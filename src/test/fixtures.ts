import type { Checkin } from "@/lib/domain";

const BASE_DATE = "2026-07-14";

function dayBefore(offset: number) {
  const date = new Date(`${BASE_DATE}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - offset);
  return date.toISOString().slice(0, 10);
}

export function makeCheckin(overrides: Partial<Checkin> = {}): Checkin {
  return {
    checkinDate: BASE_DATE,
    mealsCount: 3,
    skippedMeals: [],
    firstMealTime: "before_9",
    foodTypes: [],
    sweetDrinks: 0,
    mealFeeling: null,
    sleepHours: 7,
    bedTimeBucket: "23_00",
    sleepQuality: 4,
    lateReason: null,
    movementTypes: ["walk"],
    movementMinutes: 20,
    movementBlocker: null,
    movementFeeling: null,
    energyLevel: "high",
    disruptors: [],
    note: null,
    ...overrides,
  };
}

export function makeCheckins(
  count: number,
  build: (index: number) => Partial<Checkin> = () => ({})
): Checkin[] {
  return Array.from({ length: count }, (_, index) =>
    makeCheckin({ checkinDate: dayBefore(count - 1 - index), ...build(index) })
  );
}

export function withMissingDays(checkins: Checkin[], ...indices: number[]): Checkin[] {
  const dropped = new Set(indices);
  return checkins.filter((_, index) => !dropped.has(index));
}
