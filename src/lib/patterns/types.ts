import type { Pillar } from "@/lib/domain";

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
