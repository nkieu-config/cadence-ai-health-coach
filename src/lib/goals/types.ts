import type { Pillar } from "@/lib/patterns/types";

export const SITUATIONS = [
  "early_class",
  "deadline",
  "long_screen",
  "long_commute",
  "phone_before_bed",
  "no_exercise_time",
] as const;

export type Situation = (typeof SITUATIONS)[number];

export const SITUATION_LABELS: Record<Situation, string> = {
  early_class: "มีเรียนหรือทำงานเช้า",
  deadline: "มีเดดไลน์",
  long_screen: "นั่งหน้าจอนาน",
  long_commute: "เดินทางไกล",
  phone_before_bed: "นอนดึกเพราะมือถือ",
  no_exercise_time: "ไม่มีเวลาออกกำลังกาย",
};

export type GoalStatus = "active" | "done" | "dropped";

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  active: "กำลังทำ",
  done: "ทำสำเร็จ",
  dropped: "สัปดาห์นี้ไม่เหมาะ ไว้ลองใหม่",
};

export const MAX_ACTIVE_GOALS = 2;
export const GOAL_TITLE_MAX_LENGTH = 80;

export type GoalSuggestion = {
  title: string;
  situation: Situation;
};

export type GoalProfile = {
  earlyDays: string[];
  busyPeriods: string[];
  constraints: string[];
  busyDaysNextWeek?: string[];
};

export const SITUATION_PILLARS: Record<Situation, Pillar> = {
  early_class: "eating",
  phone_before_bed: "sleep",
  deadline: "movement",
  long_screen: "movement",
  long_commute: "movement",
  no_exercise_time: "movement",
};

export const PILLARS: Pillar[] = ["eating", "sleep", "movement"];

export type GoalContext = {
  pillar?: Pillar;
  busyDays?: string[];
  constraints?: string[];
};

export type Goal = {
  id: string;
  weekStart: string;
  title: string;
  situation: Situation | null;
  status: GoalStatus;
  progressDates: string[];
};

export type GoalRow = {
  id: string;
  week_start: string;
  title: string;
  situation_tag: string | null;
  status: string;
  progress_dates: string[] | null;
};

export const GOAL_COLUMNS = [
  "id",
  "week_start",
  "title",
  "situation_tag",
  "status",
  "progress_dates",
].join(", ");

export function toGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    weekStart: row.week_start,
    title: row.title,
    situation: (row.situation_tag as Situation) ?? null,
    status: row.status as GoalStatus,
    progressDates: row.progress_dates ?? [],
  };
}
