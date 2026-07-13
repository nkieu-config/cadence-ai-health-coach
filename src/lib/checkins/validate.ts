import type { Checkin } from "@/lib/patterns/types";
import {
  BED_TIME_LABELS,
  DISRUPTOR_LABELS,
  ENERGY_LABELS,
  LATE_REASON_LABELS,
  MEAL_FEELING_LABELS,
  MEAL_LABELS,
  MOVEMENT_BLOCKER_LABELS,
  MOVEMENT_TYPE_LABELS,
} from "./labels";

export const NOTE_MAX_LENGTH = 200;
export const TOTAL_MEALS = 3;

function allowed(labels: Record<string, string>) {
  return new Set(Object.keys(labels));
}

const BED_TIME_BUCKETS = allowed(BED_TIME_LABELS);
const ENERGY_LEVELS = allowed(ENERGY_LABELS);
const MEALS = allowed(MEAL_LABELS);
const MEAL_FEELINGS = allowed(MEAL_FEELING_LABELS);
const LATE_REASONS = allowed(LATE_REASON_LABELS);
const MOVEMENT_TYPES = allowed(MOVEMENT_TYPE_LABELS);
const MOVEMENT_BLOCKERS = allowed(MOVEMENT_BLOCKER_LABELS);
const DISRUPTORS = allowed(DISRUPTOR_LABELS);

function isBetween(value: number, min: number, max: number) {
  return Number.isFinite(value) && value >= min && value <= max;
}

function isKnownList(values: string[], known: Set<string>) {
  return (
    Array.isArray(values) &&
    values.every((value) => known.has(value)) &&
    new Set(values).size === values.length
  );
}

function isKnownOrNull(value: string | null, known: Set<string>) {
  return value === null || known.has(value);
}

export function validateCheckin(checkin: Checkin, today: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkin.checkinDate)) {
    return "วันที่ไม่ถูกต้อง";
  }
  if (checkin.checkinDate > today) {
    return "บันทึกล่วงหน้าไม่ได้";
  }

  if (!isBetween(checkin.mealsCount, 0, TOTAL_MEALS)) {
    return "จำนวนมื้อต้องอยู่ระหว่าง 0–3";
  }
  if (!isKnownList(checkin.skippedMeals, MEALS)) {
    return "มื้อที่ข้ามไม่ถูกต้อง";
  }
  if (checkin.skippedMeals.length > TOTAL_MEALS - checkin.mealsCount) {
    return "จำนวนมื้อที่ข้ามขัดแย้งกับจำนวนมื้อที่กิน";
  }
  if (!isBetween(checkin.sweetDrinks, 0, 20)) {
    return "จำนวนเครื่องดื่มหวานไม่ถูกต้อง";
  }
  if (!isKnownOrNull(checkin.mealFeeling, MEAL_FEELINGS)) {
    return "ความรู้สึกหลังกินไม่ถูกต้อง";
  }

  if (!isBetween(checkin.sleepHours, 0, 24)) {
    return "ชั่วโมงนอนต้องอยู่ระหว่าง 0–24";
  }
  if (!BED_TIME_BUCKETS.has(checkin.bedTimeBucket)) {
    return "เลือกเวลาเข้านอนก่อน";
  }
  if (!isBetween(checkin.sleepQuality, 1, 5)) {
    return "คุณภาพการนอนต้องอยู่ระหว่าง 1–5";
  }
  if (!isKnownOrNull(checkin.lateReason, LATE_REASONS)) {
    return "เหตุผลที่นอนดึกไม่ถูกต้อง";
  }

  if (!isKnownList(checkin.movementTypes, MOVEMENT_TYPES)) {
    return "ชนิดการเคลื่อนไหวไม่ถูกต้อง";
  }
  if (checkin.movementTypes.includes("none") && checkin.movementTypes.length > 1) {
    return "เลือก “ไม่ได้ขยับเลย” พร้อมกับชนิดอื่นไม่ได้";
  }
  if (!isBetween(checkin.movementMinutes, 0, 600)) {
    return "นาทีเคลื่อนไหวไม่ถูกต้อง";
  }
  if (checkin.movementTypes.includes("none") && checkin.movementMinutes > 0) {
    return "เลือก “ไม่ได้ขยับเลย” แล้วมีนาทีเคลื่อนไหวไม่ได้";
  }
  if (!isKnownOrNull(checkin.movementBlocker, MOVEMENT_BLOCKERS)) {
    return "อุปสรรคการเคลื่อนไหวไม่ถูกต้อง";
  }

  if (!ENERGY_LEVELS.has(checkin.energyLevel)) {
    return "เลือกระดับพลังงานก่อน";
  }
  if (!isKnownList(checkin.disruptors, DISRUPTORS)) {
    return "สิ่งรบกวนไม่ถูกต้อง";
  }
  if (checkin.disruptors.includes("none") && checkin.disruptors.length > 1) {
    return "เลือก “ไม่มีอะไรพิเศษ” พร้อมกับข้ออื่นไม่ได้";
  }
  if ((checkin.note?.length ?? 0) > NOTE_MAX_LENGTH) {
    return `บันทึกเพิ่มเติมยาวเกิน ${NOTE_MAX_LENGTH} ตัวอักษร`;
  }

  return null;
}
