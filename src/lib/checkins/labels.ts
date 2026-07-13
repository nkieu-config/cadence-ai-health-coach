import type {
  BedTimeBucket,
  Checkin,
  Disruptor,
  EnergyLevel,
  LateReason,
  Meal,
  MealFeeling,
  MovementBlocker,
  MovementType,
} from "@/lib/patterns/types";

export const MEAL_LABELS: Record<Meal, string> = {
  breakfast: "เช้า",
  lunch: "กลางวัน",
  dinner: "เย็น",
};

export const MEAL_FEELING_LABELS: Record<MealFeeling, string> = {
  just_right: "กำลังดี",
  sleepy: "ง่วงหลังกิน",
  hungry_fast: "หิวเร็ว",
  energized: "มีแรง",
};

export const BED_TIME_LABELS: Record<BedTimeBucket, string> = {
  before_23: "ก่อน 23:00",
  "23_00": "23:00–00:00",
  "00_01": "00:00–01:00",
  "01_02": "01:00–02:00",
  after_02: "หลัง 02:00",
};

export const LATE_REASON_LABELS: Record<LateReason, string> = {
  work: "งาน",
  exam: "อ่านสอบ",
  phone: "เล่นมือถือ",
  commute: "เดินทาง",
  other: "อื่น ๆ",
};

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  walk: "เดิน",
  stretch: "ยืดเส้น",
  stairs: "ขึ้นบันได",
  bike: "ปั่นจักรยาน",
  sport: "เล่นกีฬา",
  none: "ไม่ได้ขยับเลย",
};

export const MOVEMENT_BLOCKER_LABELS: Record<MovementBlocker, string> = {
  no_time: "ไม่มีเวลา",
  rain: "ฝนตก",
  tired: "เหนื่อยเกิน",
  long_sitting: "นั่งยาว",
};

export const ENERGY_LABELS: Record<EnergyLevel, string> = {
  low: "ต่ำ",
  medium: "กลาง",
  high: "สูง",
};

export const DISRUPTOR_LABELS: Record<Disruptor, string> = {
  deadline: "เดดไลน์",
  long_meeting: "ประชุมยาว",
  early_class: "เรียนเช้า",
  commute: "เดินทางไกล",
  exam: "สอบ",
  none: "ไม่มีอะไรพิเศษ",
};

export const SLEEP_QUALITY_LABELS: Record<Checkin["sleepQuality"], string> = {
  1: "แย่มาก",
  2: "ไม่ค่อยดี",
  3: "พอใช้",
  4: "ดี",
  5: "ดีมาก",
};
