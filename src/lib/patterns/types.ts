export type Pillar = "eating" | "sleep" | "movement";

export type EnergyLevel = "low" | "medium" | "high";

export type BedTimeBucket =
  | "before_23"
  | "23_00"
  | "00_01"
  | "01_02"
  | "after_02";

export type Meal = "breakfast" | "lunch" | "dinner";

export type MealFeeling = "just_right" | "sleepy" | "hungry_fast" | "energized";

export type LateReason = "work" | "exam" | "phone" | "commute" | "other";

export type MovementType = "walk" | "stretch" | "stairs" | "bike" | "sport" | "none";

export type MovementBlocker = "no_time" | "rain" | "tired" | "long_sitting";

export type Disruptor =
  | "deadline"
  | "long_meeting"
  | "early_class"
  | "commute"
  | "exam"
  | "none";

export type Checkin = {
  checkinDate: string;
  mealsCount: number;
  skippedMeals: Meal[];
  sweetDrinks: number;
  mealFeeling: MealFeeling | null;
  sleepHours: number;
  bedTimeBucket: BedTimeBucket;
  sleepQuality: 1 | 2 | 3 | 4 | 5;
  lateReason: LateReason | null;
  movementTypes: MovementType[];
  movementMinutes: number;
  movementBlocker: MovementBlocker | null;
  energyLevel: EnergyLevel;
  disruptors: Disruptor[];
  note: string | null;
};

export type PatternGroup = {
  label: string;
  days: number;
  value: number;
};

export type PatternCandidate = {
  id: string;
  pillars: Pillar[];
  metric: string;
  groupA: PatternGroup;
  groupB: PatternGroup;
};
