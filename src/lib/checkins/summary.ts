import type { Checkin } from "@/lib/patterns/types";
import {
  BED_TIME_LABELS,
  DISRUPTOR_LABELS,
  MEAL_LABELS,
  MOVEMENT_BLOCKER_LABELS,
  MOVEMENT_TYPE_LABELS,
} from "./labels";

export type CheckinSummary = {
  lines: string[];
  encouragement: string;
};

function eatingLine(checkin: Checkin) {
  const parts = [`กิน ${checkin.mealsCount} มื้อ`];
  if (checkin.skippedMeals.length > 0) {
    parts.push(`ข้าม${checkin.skippedMeals.map((meal) => MEAL_LABELS[meal]).join(" / ")}`);
  }
  if (checkin.sweetDrinks > 0) {
    parts.push(`เครื่องดื่มหวาน ${checkin.sweetDrinks} แก้ว`);
  }
  return parts.join(" · ");
}

function sleepLine(checkin: Checkin) {
  return [
    `นอน ${checkin.sleepHours} ชม.`,
    `เข้านอน ${BED_TIME_LABELS[checkin.bedTimeBucket]}`,
    `คุณภาพการนอนที่ประเมินเอง ${checkin.sleepQuality}/5`,
  ].join(" · ");
}

function movementLine(checkin: Checkin) {
  const types = checkin.movementTypes
    .filter((type) => type !== "none")
    .map((type) => MOVEMENT_TYPE_LABELS[type]);

  if (types.length === 0 || checkin.movementMinutes === 0) {
    const blocker = checkin.movementBlocker
      ? ` (${MOVEMENT_BLOCKER_LABELS[checkin.movementBlocker]})`
      : "";
    return `ไม่ได้ขยับ${blocker}`;
  }
  return `${types.join(" / ")} ${checkin.movementMinutes} นาที`;
}

function encouragement(checkin: Checkin) {
  const disruptors = checkin.disruptors.filter((disruptor) => disruptor !== "none");
  if (disruptors.length > 0) {
    const labels = disruptors.map((disruptor) => DISRUPTOR_LABELS[disruptor]).join(" และ ");
    return `วันนี้มี${labels}ด้วย — บันทึกได้ในวันแบบนี้ก็ดีมากแล้ว ขอบคุณที่แวะมาดูแลตัวเอง`;
  }
  if (checkin.energyLevel === "low") {
    return "วันที่พลังงานน้อยเป็นเรื่องปกติ ขอบคุณที่ยังแวะมาบันทึกไว้";
  }
  return "ขอบคุณที่บันทึกวันนี้ · บันทึกต่อเนื่องจะช่วยให้เห็นรูปแบบของตัวเองชัดขึ้น";
}

export function buildCheckinSummary(checkin: Checkin): CheckinSummary {
  return {
    lines: [eatingLine(checkin), sleepLine(checkin), movementLine(checkin)],
    encouragement: encouragement(checkin),
  };
}
