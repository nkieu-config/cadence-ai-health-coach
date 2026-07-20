import type { BedTimeBucket, Checkin, Pillar } from "@/lib/domain";
import type { PatternCandidate, PatternId, PatternMetric } from "./types";

export const MIN_DAYS_FOR_ANALYSIS = 7;
export const MIN_DAYS_PER_GROUP = 3;
export const MIN_RATE_DIFFERENCE = 0.2;
export const MIN_RELATIVE_DIFFERENCE = 0.2;

export const LOW_SLEEP_HOURS = 6;
export const ACTIVE_MOVEMENT_MINUTES = 15;

const HOURS_AFTER_8PM: Record<BedTimeBucket, number> = {
  before_23: 2.5,
  "23_00": 3.5,
  "00_01": 4.5,
  "01_02": 5.5,
  after_02: 7,
};

export function bedTimeHours(bucket: BedTimeBucket): number {
  return HOURS_AFTER_8PM[bucket];
}

export function hasEnoughData(checkins: Checkin[]): boolean {
  return checkins.length >= MIN_DAYS_FOR_ANALYSIS;
}

type Group<T> = { label: string; items: T[] };
type DayPair = { day: Checkin; next: Checkin };

const DAY_MS = 86_400_000;

function sortedByDate(checkins: Checkin[]): Checkin[] {
  return [...checkins].sort((a, b) => a.checkinDate.localeCompare(b.checkinDate));
}

function isNextDay(earlier: string, later: string): boolean {
  return Date.parse(`${later}T00:00:00Z`) - Date.parse(`${earlier}T00:00:00Z`) === DAY_MS;
}

function consecutivePairs(checkins: Checkin[]): DayPair[] {
  const pairs: DayPair[] = [];
  for (let index = 0; index < checkins.length - 1; index += 1) {
    const day = checkins[index];
    const next = checkins[index + 1];
    if (isNextDay(day.checkinDate, next.checkinDate)) {
      pairs.push({ day, next });
    }
  }
  return pairs;
}

function split<T>(items: T[], labelA: string, labelB: string, inGroupA: (item: T) => boolean) {
  return [
    { label: labelA, items: items.filter(inGroupA) },
    { label: labelB, items: items.filter((item) => !inGroupA(item)) },
  ] as const;
}

function bothGroupsBigEnough<T>(a: Group<T>, b: Group<T>): boolean {
  return a.items.length >= MIN_DAYS_PER_GROUP && b.items.length >= MIN_DAYS_PER_GROUP;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function toCandidate<T>(
  id: PatternId,
  pillars: Pillar[],
  metric: PatternMetric,
  a: Group<T>,
  b: Group<T>,
  valueA: number,
  valueB: number
): PatternCandidate {
  return {
    id,
    pillars,
    metric,
    groupA: { label: a.label, days: a.items.length, value: round(valueA) },
    groupB: { label: b.label, days: b.items.length, value: round(valueB) },
  };
}

function rateCandidate<T>(
  id: PatternId,
  pillars: Pillar[],
  metric: PatternMetric,
  a: Group<T>,
  b: Group<T>,
  matches: (item: T) => boolean
): PatternCandidate | null {
  if (!bothGroupsBigEnough(a, b)) return null;

  const rateA = a.items.filter(matches).length / a.items.length;
  const rateB = b.items.filter(matches).length / b.items.length;
  if (Math.abs(rateA - rateB) < MIN_RATE_DIFFERENCE) return null;

  return toCandidate(id, pillars, metric, a, b, rateA, rateB);
}

function averageCandidate<T>(
  id: PatternId,
  pillars: Pillar[],
  metric: PatternMetric,
  a: Group<T>,
  b: Group<T>,
  value: (item: T) => number
): PatternCandidate | null {
  if (!bothGroupsBigEnough(a, b)) return null;

  const average = (items: T[]) => items.reduce((sum, item) => sum + value(item), 0) / items.length;
  const averageA = average(a.items);
  const averageB = average(b.items);

  const baseline = Math.max(Math.abs(averageB), 1);
  if (Math.abs(averageA - averageB) / baseline < MIN_RELATIVE_DIFFERENCE) return null;

  return toCandidate(id, pillars, metric, a, b, averageA, averageB);
}

export function computePatternCandidates(input: Checkin[]): PatternCandidate[] {
  if (!hasEnoughData(input)) return [];

  const checkins = sortedByDate(input);
  const pairs = consecutivePairs(checkins);

  const [lowSleep, enoughSleep] = split(
    checkins,
    `นอนน้อยกว่า ${LOW_SLEEP_HOURS} ชม.`,
    `นอน ${LOW_SLEEP_HOURS} ชม. ขึ้นไป`,
    (checkin) => checkin.sleepHours < LOW_SLEEP_HOURS
  );

  const [pressured, ordinary] = split(
    checkins,
    "วันที่มีเดดไลน์หรือสอบ",
    "วันปกติ",
    (checkin) => checkin.disruptors.includes("deadline") || checkin.disruptors.includes("exam")
  );

  const [afterActive, afterSedentary] = split(
    pairs,
    `หลังวันที่ขยับ ${ACTIVE_MOVEMENT_MINUTES} นาทีขึ้นไป`,
    `หลังวันที่ขยับน้อยกว่า ${ACTIVE_MOVEMENT_MINUTES} นาที`,
    (pair) => pair.day.movementMinutes >= ACTIVE_MOVEMENT_MINUTES
  );

  const [ateEveryMeal, skippedAMeal] = split(
    checkins,
    "วันที่กินครบทุกมื้อ",
    "วันที่ข้ามมื้อ",
    (checkin) => checkin.skippedMeals.length === 0
  );

  const [ateOnTime, ateLate] = split(
    checkins.filter((checkin) => checkin.firstMealTime !== null),
    "วันที่กินมื้อแรกก่อน 9:00",
    "วันที่กินมื้อแรกหลัง 9:00",
    (checkin) => checkin.firstMealTime === "before_9"
  );

  const [earlyClass, noEarlyClass] = split(
    checkins,
    "วันที่มีเรียนหรือทำงานเช้า",
    "วันที่ไม่ต้องตื่นเช้า",
    (checkin) => checkin.disruptors.includes("early_class")
  );

  const [onlineDays, onsiteDays] = split(
    checkins,
    "วันที่เรียนหรือทำงาน online",
    "วันที่ได้ออกจากบ้าน",
    (checkin) => checkin.disruptors.includes("online_class")
  );

  return [
    rateCandidate(
      "sleep-eating-skip-breakfast",
      ["sleep", "eating"],
      "skip_breakfast_rate",
      lowSleep,
      enoughSleep,
      (checkin) => checkin.skippedMeals.includes("breakfast")
    ),
    averageCandidate(
      "sleep-eating-sweet-drinks",
      ["sleep", "eating"],
      "sweet_drinks_avg",
      lowSleep,
      enoughSleep,
      (checkin) => checkin.sweetDrinks
    ),
    averageCandidate(
      "deadline-sleep-bedtime",
      ["sleep"],
      "bed_time_hours_after_20",
      pressured,
      ordinary,
      (checkin) => bedTimeHours(checkin.bedTimeBucket)
    ),
    averageCandidate(
      "deadline-movement-minutes",
      ["movement"],
      "movement_minutes_avg",
      pressured,
      ordinary,
      (checkin) => checkin.movementMinutes
    ),
    averageCandidate(
      "movement-next-day-sleep",
      ["movement", "sleep"],
      "sleep_quality_next_day",
      afterActive,
      afterSedentary,
      (pair) => pair.next.sleepQuality
    ),
    rateCandidate(
      "movement-next-day-energy",
      ["movement"],
      "high_energy_rate_next_day",
      afterActive,
      afterSedentary,
      (pair) => pair.next.energyLevel === "high"
    ),
    rateCandidate(
      "eating-energy",
      ["eating"],
      "high_energy_rate",
      ateEveryMeal,
      skippedAMeal,
      (checkin) => checkin.energyLevel === "high"
    ),
    rateCandidate(
      "eating-on-time-energy",
      ["eating"],
      "high_energy_rate",
      ateOnTime,
      ateLate,
      (checkin) => checkin.energyLevel === "high"
    ),
    rateCandidate(
      "early-class-skip-breakfast",
      ["eating"],
      "skip_breakfast_rate",
      earlyClass,
      noEarlyClass,
      (checkin) => checkin.skippedMeals.includes("breakfast")
    ),
    averageCandidate(
      "online-class-movement",
      ["movement"],
      "movement_minutes_avg",
      onlineDays,
      onsiteDays,
      (checkin) => checkin.movementMinutes
    ),
  ].filter((candidate): candidate is PatternCandidate => candidate !== null);
}

export type * from "./types";
