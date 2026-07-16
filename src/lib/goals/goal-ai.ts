import { generateJson, isQuotaExhausted } from "@/lib/ai";
import { GOAL_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { DISRUPTOR_LABELS } from "@/lib/checkins/labels";
import { BUSY_PERIOD_LABELS, CONSTRAINT_LABELS, EARLY_DAY_LABELS } from "@/lib/onboarding/types";
import type { Checkin } from "@/lib/patterns/types";
import { fallbackGoal, matchingCheckins, validateGoalTitle } from "./suggest";
import { SITUATION_LABELS, type GoalProfile, type GoalSuggestion, type Situation } from "./types";

export const GOAL_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    goals: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          situation: { type: "STRING" },
          title: { type: "STRING" },
        },
        required: ["situation", "title"],
        propertyOrdering: ["situation", "title"],
      },
    },
  },
  required: ["goals"],
};

function describeCheckin(checkin: Checkin): string {
  const parts = [
    `นอน ${checkin.sleepHours} ชม.`,
    checkin.skippedMeals.length > 0 ? `ข้ามมื้อ${checkin.skippedMeals.join("/")}` : null,
    `ขยับ ${checkin.movementMinutes} นาที`,
    checkin.disruptors.length > 0 && !checkin.disruptors.includes("none")
      ? checkin.disruptors.map((d) => DISRUPTOR_LABELS[d]).join(", ")
      : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

function mapLabels(values: string[], labels: Record<string, string>): string[] {
  return values.map((value) => labels[value]).filter(Boolean);
}

function profileFacts(profile: GoalProfile | null): Record<string, string[]> | null {
  if (!profile) return null;

  const facts: Record<string, string[]> = {};

  const earlyDays = mapLabels(profile.earlyDays, EARLY_DAY_LABELS);
  if (earlyDays.length > 0) facts["วันที่ต้องตื่นเช้า"] = earlyDays;

  const busyPeriods = mapLabels(profile.busyPeriods, BUSY_PERIOD_LABELS);
  if (busyPeriods.length > 0) facts["ช่วงที่งานหนักเป็นประจำ"] = busyPeriods;

  const constraints = mapLabels(profile.constraints, CONSTRAINT_LABELS);
  if (constraints.length > 0) facts["ข้อจำกัดที่บอกไว้ตอนสมัคร"] = constraints;

  return Object.keys(facts).length > 0 ? facts : null;
}

export function buildGoalPrompt(
  situations: Situation[],
  checkins: Checkin[],
  profile: GoalProfile | null
): string {
  const fewShot = situations.map((situation) => ({
    situation,
    สถานการณ์: SITUATION_LABELS[situation],
    goal_มาตรฐาน: fallbackGoal(situation),
  }));

  const facts = situations.map((situation) => {
    const examples = matchingCheckins(checkins, situation).slice(-3).map(describeCheckin);
    return {
      situation,
      สถานการณ์: SITUATION_LABELS[situation],
      วันที่เจอสถานการณ์นี้: examples.length,
      ตัวอย่างวันจริง: examples,
    };
  });

  const blocks = [`ตารางมาตรฐาน (few-shot):\n${JSON.stringify(fewShot, null, 2)}`];

  const constraints = profileFacts(profile);
  if (constraints) {
    blocks.push(
      [
        "ตารางชีวิตและข้อจำกัดของผู้ใช้คนนี้ (ผู้ใช้กรอกไว้เอง):",
        JSON.stringify(constraints, null, 2),
        "goal ทุกข้อต้องทำได้จริงภายใต้เงื่อนไขนี้ ห้ามเสนอสิ่งที่ขัดกับข้อจำกัด —",
        'เช่น "ไม่มีสถานที่ออกกำลังกาย" ห้ามชวนไปฟิตเนสหรือสนามกีฬา · "งบจำกัด" ห้ามเสนอสิ่งที่ต้องจ่ายเงิน · "ไม่ค่อยมีเวลา" ให้เลือกก้าวที่ใช้เวลาน้อยที่สุด',
        "ถ้าอ้างถึงวันหรือช่วงเวลา ให้ใช้วันจากตารางด้านบนเท่านั้น ห้ามเดาวันเอง",
      ].join("\n")
    );
  }

  blocks.push(
    `สถานการณ์จริงของผู้ใช้คนนี้ (ปรับ goal มาตรฐานด้านบนให้เข้ากับข้อมูลนี้ ตอบครบทุก situation):\n${JSON.stringify(facts, null, 2)}`
  );

  return blocks.join("\n\n");
}

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function parseGoalSuggestions(
  raw: unknown,
  allowedSituations: Set<Situation>
): Map<Situation, string> {
  const result = new Map<Situation, string>();
  if (!raw || typeof raw !== "object") return result;

  const goals = (raw as { goals?: unknown }).goals;
  if (!Array.isArray(goals)) return result;

  for (const entry of goals) {
    if (!entry || typeof entry !== "object") continue;

    const situation = (entry as { situation?: unknown }).situation as Situation;
    if (!allowedSituations.has(situation) || result.has(situation)) continue;

    const title = cleanString((entry as { title?: unknown }).title);
    if (!title || validateGoalTitle(title)) continue;

    result.set(situation, title);
  }

  return result;
}

export async function generateGoalSuggestions(
  situations: Situation[],
  checkins: Checkin[],
  profile: GoalProfile | null
): Promise<Map<Situation, string> | null> {
  if (situations.length === 0) return null;

  const allowed = new Set(situations);
  const prompt = buildGoalPrompt(situations, checkins, profile);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const raw = await generateJson<unknown>(
        [{ role: "user", content: prompt }],
        GOAL_RESPONSE_SCHEMA,
        GOAL_SYSTEM_PROMPT
      );
      const parsed = parseGoalSuggestions(raw, allowed);
      if (parsed.size > 0) return parsed;
    } catch (error) {
      if (isQuotaExhausted(error)) return null;
    }
  }

  return null;
}

export function mergeGoalSuggestions(
  situations: Situation[],
  aiBySituation: Map<Situation, string> | null
): GoalSuggestion[] {
  return situations.map((situation) => ({
    situation,
    title: aiBySituation?.get(situation) ?? fallbackGoal(situation),
  }));
}
