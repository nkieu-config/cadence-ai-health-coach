import type { Insight } from "@/lib/ai-outputs/types";
import { DISRUPTOR_LABELS, ENERGY_LABELS, MEAL_LABELS } from "@/lib/checkins/labels";
import type { Goal } from "@/lib/goals/types";
import {
  BUSY_PERIOD_LABELS,
  CONSTRAINT_LABELS,
  EARLY_DAY_LABELS,
  STATUS_LABELS,
} from "@/lib/onboarding/types";
import type { Checkin } from "@/lib/domain";

export type BehaviorProfile = {
  status: string | null;
  earlyDays: string[];
  busyPeriods: string[];
  constraints: string[];
};

export type CoachContextData = {
  profile: BehaviorProfile | null;
  checkins: Checkin[];
  insight: Insight | null;
  goals: Goal[];
};

function labelOf(record: Record<string, string>, key: string | null): string | null {
  if (!key) return null;
  return record[key] ?? null;
}

function mapLabels(values: string[], record: Record<string, string>): string[] {
  return values.map((value) => record[value]).filter(Boolean);
}

function profileLine(profile: BehaviorProfile): string | null {
  const parts: string[] = [];

  const status = labelOf(STATUS_LABELS, profile.status);
  if (status) parts.push(status);

  const early = mapLabels(profile.earlyDays, EARLY_DAY_LABELS);
  if (early.length > 0) parts.push(`ต้องตื่นเช้าวัน ${early.join(" ")}`);

  const busy = mapLabels(profile.busyPeriods, BUSY_PERIOD_LABELS);
  if (busy.length > 0) parts.push(`ช่วงงานหนัก: ${busy.join(", ")}`);

  const constraints = mapLabels(profile.constraints, CONSTRAINT_LABELS);
  if (constraints.length > 0) parts.push(`ข้อจำกัด: ${constraints.join(", ")}`);

  return parts.length > 0 ? parts.join(" · ") : null;
}

function checkinLine(checkin: Checkin): string {
  const skipped =
    checkin.skippedMeals.length > 0
      ? ` (ข้าม${checkin.skippedMeals.map((meal) => MEAL_LABELS[meal]).join("/")})`
      : "";

  const disruptors = checkin.disruptors.filter((disruptor) => disruptor !== "none");
  const disruptorText =
    disruptors.length > 0
      ? ` · ${disruptors.map((disruptor) => DISRUPTOR_LABELS[disruptor]).join(", ")}`
      : "";

  return `${checkin.checkinDate}: นอน ${checkin.sleepHours} ชม. · กิน ${checkin.mealsCount} มื้อ${skipped} · ขยับ ${checkin.movementMinutes} นาที · พลังงาน${ENERGY_LABELS[checkin.energyLevel]}${disruptorText}`;
}

export function formatCoachContext(data: CoachContextData): string | null {
  const body: string[] = [];

  const profile = data.profile ? profileLine(data.profile) : null;
  if (profile) body.push(`โปรไฟล์: ${profile}`);

  if (data.checkins.length > 0) {
    const lines = data.checkins.map(checkinLine).join("\n");
    body.push(`บันทึก ${data.checkins.length} วันล่าสุด (เก่า→ใหม่):\n${lines}`);
  }

  if (data.insight && data.insight.patterns.length > 0) {
    const lines = data.insight.patterns.map((pattern) => `- ${pattern.observation}`).join("\n");
    body.push(`รูปแบบที่ระบบพบล่าสุด:\n${lines}`);
  }

  const activeGoals = data.goals.filter((goal) => goal.status === "active");
  if (activeGoals.length > 0) {
    const lines = activeGoals
      .map((goal) => `- ${goal.title} (ทำไปแล้ว ${goal.progressDates.length} วันในสัปดาห์นี้)`)
      .join("\n");
    body.push(`เป้าหมายสัปดาห์นี้:\n${lines}`);
  }

  if (body.length === 0) return null;

  return [
    "[บริบทของผู้ใช้ — ข้อมูลพฤติกรรมเท่านั้น ไม่มีชื่อหรืออีเมล]",
    ...body,
    "ใช้ตัวเลขเหล่านี้อ้างอิงได้ตามจริงเมื่อผู้ใช้ถามถึงตัวเอง และยังคงกฎทั้งหมดด้านบน",
  ].join("\n\n");
}
