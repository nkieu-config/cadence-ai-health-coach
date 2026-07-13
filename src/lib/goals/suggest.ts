import type { Checkin } from "@/lib/patterns/types";
import { GOAL_TITLE_MAX_LENGTH, SITUATIONS, type GoalSuggestion, type Situation } from "./types";
import { findForbiddenTerms } from "@/lib/safety/language";

const FALLBACK_GOALS: Record<Situation, string> = {
  early_class: "เตรียมมื้อเช้าง่าย ๆ ไว้ล่วงหน้า 2 วันในสัปดาห์นี้",
  deadline: "ตั้งเวลาพัก 5 นาทีทุก 60–90 นาทีในวันที่มีเดดไลน์",
  long_screen: "ยืดเหยียด 5 นาทีหลังจบคาบเรียนหรือประชุม",
  long_commute: "เดินเบา ๆ 10 นาทีหลังถึงบ้าน",
  phone_before_bed: "วางมือถือก่อนนอน 15 นาที จำนวน 3 คืน",
  no_exercise_time: "เดินขึ้นบันไดแทนลิฟต์ หรือเดินสั้น ๆ ระหว่างวัน",
};

export function fallbackGoal(situation: Situation): string {
  return FALLBACK_GOALS[situation];
}

function scoreSituations(checkins: Checkin[]): Record<Situation, number> {
  const score = Object.fromEntries(SITUATIONS.map((s) => [s, 0])) as Record<Situation, number>;

  for (const checkin of checkins) {
    if (checkin.disruptors.includes("deadline") || checkin.disruptors.includes("exam")) {
      score.deadline += 1;
    }
    if (checkin.disruptors.includes("early_class") || checkin.skippedMeals.includes("breakfast")) {
      score.early_class += 1;
    }
    if (checkin.disruptors.includes("long_meeting") || checkin.movementBlocker === "long_sitting") {
      score.long_screen += 1;
    }
    if (checkin.disruptors.includes("commute")) {
      score.long_commute += 1;
    }
    if (checkin.lateReason === "phone") {
      score.phone_before_bed += 1;
    }
    if (checkin.movementBlocker === "no_time" || checkin.movementMinutes === 0) {
      score.no_exercise_time += 1;
    }
  }

  return score;
}

export function suggestGoals(checkins: Checkin[], limit: number): GoalSuggestion[] {
  const score = scoreSituations(checkins);

  const ranked = SITUATIONS.filter((situation) => score[situation] > 0).sort(
    (a, b) => score[b] - score[a]
  );

  const chosen = ranked.length > 0 ? ranked.slice(0, limit) : (["no_exercise_time"] as Situation[]);

  return chosen.map((situation) => ({ situation, title: fallbackGoal(situation) }));
}

export function validateGoalTitle(title: string): string | null {
  const trimmed = title.trim();
  if (!trimmed) {
    return "เป้าหมายต้องไม่ว่าง";
  }
  if (trimmed.length > GOAL_TITLE_MAX_LENGTH) {
    return `เป้าหมายยาวเกิน ${GOAL_TITLE_MAX_LENGTH} ตัวอักษร`;
  }

  const forbidden = findForbiddenTerms(trimmed);
  if (forbidden.length > 0) {
    return "เป้าหมายต้องไม่พูดถึงน้ำหนัก รูปร่าง หรือการอดอาหาร — ลองตั้งเป็นก้าวเล็ก ๆ ที่ทำได้จริงแทน";
  }

  return null;
}
