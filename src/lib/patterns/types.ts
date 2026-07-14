export type Pillar = "eating" | "sleep" | "movement";

export type EnergyLevel = "low" | "medium" | "high";

export type BedTimeBucket = "before_23" | "23_00" | "00_01" | "01_02" | "after_02";

export type Meal = "breakfast" | "lunch" | "dinner";

export type MealFeeling = "just_right" | "sleepy" | "hungry_fast" | "energized";

export type FirstMealTime = "before_9" | "9_12" | "after_12";

export type FoodType = "snack" | "veg_fruit";

export type LateReason = "work" | "exam" | "phone" | "commute" | "other";

export type MovementType = "walk" | "stretch" | "stairs" | "bike" | "sport" | "none";

export type MovementBlocker = "no_time" | "rain" | "tired" | "long_sitting";

export type MovementFeeling = "refreshed" | "relaxed" | "tired" | "no_change";

export type Disruptor =
  "deadline" | "long_meeting" | "early_class" | "online_class" | "commute" | "exam" | "none";

export type Checkin = {
  checkinDate: string;
  mealsCount: number;
  skippedMeals: Meal[];
  firstMealTime: FirstMealTime | null;
  foodTypes: FoodType[];
  sweetDrinks: number;
  mealFeeling: MealFeeling | null;
  sleepHours: number;
  bedTimeBucket: BedTimeBucket;
  sleepQuality: 1 | 2 | 3 | 4 | 5;
  lateReason: LateReason | null;
  movementTypes: MovementType[];
  movementMinutes: number;
  movementBlocker: MovementBlocker | null;
  movementFeeling: MovementFeeling | null;
  energyLevel: EnergyLevel;
  disruptors: Disruptor[];
  note: string | null;
};

export type PatternGroup = {
  label: string;
  days: number;
  value: number;
};

export type PatternId =
  | "sleep-eating-skip-breakfast"
  | "sleep-eating-sweet-drinks"
  | "deadline-sleep-bedtime"
  | "deadline-movement-minutes"
  | "movement-next-day-sleep"
  | "movement-next-day-energy"
  | "eating-energy"
  | "eating-on-time-energy"
  | "early-class-skip-breakfast"
  | "online-class-movement";

export type PatternMetric =
  | "skip_breakfast_rate"
  | "sweet_drinks_avg"
  | "bed_time_hours_after_20"
  | "movement_minutes_avg"
  | "sleep_quality_next_day"
  | "high_energy_rate_next_day"
  | "high_energy_rate";

export type PatternCandidate = {
  id: PatternId;
  pillars: Pillar[];
  metric: PatternMetric;
  groupA: PatternGroup;
  groupB: PatternGroup;
};
