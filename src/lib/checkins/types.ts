export type CheckinRow = {
  checkin_date: string;
  meals_count: number;
  skipped_meals: string[] | null;
  sweet_drinks: number | null;
  meal_feeling: string | null;
  sleep_hours: number | string;
  bed_time_bucket: string;
  sleep_quality: number;
  late_reason: string | null;
  movement_types: string[] | null;
  movement_minutes: number | null;
  movement_blocker: string | null;
  energy_level: string;
  disruptors: string[] | null;
  note: string | null;
};

export const CHECKIN_COLUMNS = [
  "checkin_date",
  "meals_count",
  "skipped_meals",
  "sweet_drinks",
  "meal_feeling",
  "sleep_hours",
  "bed_time_bucket",
  "sleep_quality",
  "late_reason",
  "movement_types",
  "movement_minutes",
  "movement_blocker",
  "energy_level",
  "disruptors",
  "note",
].join(", ");
