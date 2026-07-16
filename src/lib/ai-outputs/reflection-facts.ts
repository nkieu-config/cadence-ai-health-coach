import type { Goal, GoalStatus } from "@/lib/goals/types";
import { SITUATION_LABELS } from "@/lib/goals/types";
import type { Checkin } from "@/lib/patterns/types";
import type { Reflection } from "./types";

export const MIN_DAYS_FOR_REFLECTION = 3;

export const REFLECTION_DAYS = 7;

export type GoalOutcomeFact = {
  title: string;
  situation: string | null;
  status: GoalStatus;
  daysTicked: number;
};

export type WeekFacts = {
  daysRecorded: number;
  totalDays: number;
  eating: {
    completeDays: number;
    skipBreakfastDays: number;
    disruptorDays: number;
    calmDays: number;
    skipRateDisruptor: number;
    skipRateCalm: number;
  };
  sleep: {
    avgHours: number;
    lateNights: number;
    avgHoursDisruptor: number;
    avgHoursCalm: number;
  };
  movement: {
    avgMinutes: number;
    stillDays: number;
    avgMinutesDisruptor: number;
    avgMinutesCalm: number;
  };
  goals: GoalOutcomeFact[];
};

export type ReflectionText = {
  eating: string;
  sleep: string;
  movement: string;
  strengths: string;
  nextWeek: string;
};

export type WeekChangeMetric =
  "daysRecorded" | "sleepHours" | "movementMinutes" | "completeMealRate";

export type WeekChange = {
  metric: WeekChangeMetric;
  label: string;
  unit: string;
  current: number;
  previous: number;
  delta: number;
};

export type WeekComparison = {
  previousStart: string;
  previousEnd: string;
  daysRecordedPrevious: number;
  changes: WeekChange[];
};

const LATE_NIGHT_BUCKETS = new Set(["00_01", "01_02", "after_02"]);

function isDisruptedDay(checkin: Checkin): boolean {
  return checkin.disruptors.length > 0 && !checkin.disruptors.includes("none");
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function rate(count: number, total: number): number {
  return total === 0 ? 0 : Math.round((count / total) * 100) / 100;
}

export function buildWeekFacts(checkins: Checkin[], goals: Goal[], totalDays: number): WeekFacts {
  const disruptedDays = checkins.filter(isDisruptedDay);
  const calmDays = checkins.filter((checkin) => !isDisruptedDay(checkin));
  const skippedAnyMeal = (checkin: Checkin) => checkin.skippedMeals.length > 0;

  const eating = {
    completeDays: checkins.filter((checkin) => checkin.skippedMeals.length === 0).length,
    skipBreakfastDays: checkins.filter((checkin) => checkin.skippedMeals.includes("breakfast"))
      .length,
    disruptorDays: disruptedDays.length,
    calmDays: calmDays.length,
    skipRateDisruptor: rate(disruptedDays.filter(skippedAnyMeal).length, disruptedDays.length),
    skipRateCalm: rate(calmDays.filter(skippedAnyMeal).length, calmDays.length),
  };

  const sleep = {
    avgHours: average(checkins.map((checkin) => checkin.sleepHours)),
    lateNights: checkins.filter((checkin) => LATE_NIGHT_BUCKETS.has(checkin.bedTimeBucket)).length,
    avgHoursDisruptor: average(disruptedDays.map((checkin) => checkin.sleepHours)),
    avgHoursCalm: average(calmDays.map((checkin) => checkin.sleepHours)),
  };

  const movement = {
    avgMinutes: average(checkins.map((checkin) => checkin.movementMinutes)),
    stillDays: checkins.filter((checkin) => checkin.movementMinutes === 0).length,
    avgMinutesDisruptor: average(disruptedDays.map((checkin) => checkin.movementMinutes)),
    avgMinutesCalm: average(calmDays.map((checkin) => checkin.movementMinutes)),
  };

  const goalFacts: GoalOutcomeFact[] = goals.map((goal) => ({
    title: goal.title,
    situation: goal.situation ? SITUATION_LABELS[goal.situation] : null,
    status: goal.status,
    daysTicked: goal.progressDates.length,
  }));

  return {
    daysRecorded: checkins.length,
    totalDays,
    eating,
    sleep,
    movement,
    goals: goalFacts,
  };
}

function change(
  metric: WeekChangeMetric,
  label: string,
  unit: string,
  current: number,
  previous: number,
  decimals = 1
): WeekChange {
  const factor = 10 ** decimals;
  return {
    metric,
    label,
    unit,
    current,
    previous,
    delta: Math.round((current - previous) * factor) / factor,
  };
}

export function buildWeekComparison(
  current: WeekFacts,
  previous: WeekFacts,
  previousStart: string,
  previousEnd: string
): WeekComparison | null {
  if (previous.daysRecorded === 0) return null;

  return {
    previousStart,
    previousEnd,
    daysRecordedPrevious: previous.daysRecorded,
    changes: [
      change("daysRecorded", "บันทึก", "วัน", current.daysRecorded, previous.daysRecorded, 0),
      change(
        "sleepHours",
        "นอนเฉลี่ย",
        "ชม. ต่อวัน",
        current.sleep.avgHours,
        previous.sleep.avgHours
      ),
      change(
        "movementMinutes",
        "ขยับเฉลี่ย",
        "นาทีต่อวัน",
        current.movement.avgMinutes,
        previous.movement.avgMinutes
      ),
      change(
        "completeMealRate",
        "กินครบทุกมื้อ",
        "ของวันที่บันทึก",
        rate(current.eating.completeDays, current.daysRecorded),
        rate(previous.eating.completeDays, previous.daysRecorded),
        2
      ),
    ],
  };
}

export function templateReflection(facts: WeekFacts): ReflectionText {
  return {
    eating: `กินครบทุกมื้อ ${facts.eating.completeDays} จาก ${facts.daysRecorded} วันที่บันทึก · ข้ามมื้อเช้า ${facts.eating.skipBreakfastDays} วัน`,
    sleep: `นอนเฉลี่ย ${facts.sleep.avgHours} ชม. · เข้านอนหลังเที่ยงคืน ${facts.sleep.lateNights} วัน`,
    movement: `ขยับเฉลี่ย ${facts.movement.avgMinutes} นาทีต่อวัน · ไม่ได้ขยับเลย ${facts.movement.stillDays} วัน`,
    strengths: `บันทึกต่อเนื่อง ${facts.daysRecorded} จาก ${facts.totalDays} วัน เป็นความสม่ำเสมอที่ควรรักษาไว้`,
    nextWeek: "เลือกก้าวเล็ก ๆ สัก 1 ข้อที่ทำได้แม้ในวันที่ตารางแน่น แล้วลองดูสัปดาห์หน้า",
  };
}

export function shortReflection(
  daysRecorded: number,
  totalDays: number
): Omit<Reflection, "periodStart" | "periodEnd" | "createdAt"> {
  return {
    daysRecorded,
    totalDays,
    pillars: [
      { pillar: "eating", summary: "ยังบันทึกไม่ถึงพอจะสรุปด้านการกิน ลองบันทึกต่ออีกหน่อยนะ" },
      { pillar: "sleep", summary: "ยังบันทึกไม่ถึงพอจะสรุปด้านการนอน ลองบันทึกต่ออีกหน่อยนะ" },
      {
        pillar: "movement",
        summary: "ยังบันทึกไม่ถึงพอจะสรุปด้านการเคลื่อนไหว ลองบันทึกต่ออีกหน่อยนะ",
      },
    ],
    strengths: `เริ่มบันทึกแล้ว ${daysRecorded} วัน เป็นก้าวแรกที่ดีมาก`,
    nextWeek: "บันทึกต่ออีกสักหน่อย พอครบ 3 วันจะเริ่มเห็นสรุปแต่ละด้านได้ชัดขึ้น",
  };
}
