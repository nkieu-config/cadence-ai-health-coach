import { generateJson, isQuotaExhausted } from "@/lib/ai";
import { GOAL_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { DISRUPTOR_LABELS } from "@/lib/checkins/labels";
import type { Checkin } from "@/lib/patterns/types";
import { fallbackGoal, matchingCheckins, validateGoalTitle } from "./suggest";
import { SITUATION_LABELS, type GoalSuggestion, type Situation } from "./types";

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

export function buildGoalPrompt(situations: Situation[], checkins: Checkin[]): string {
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

  return `ตารางมาตรฐาน (few-shot):\n${JSON.stringify(fewShot, null, 2)}\n\nสถานการณ์จริงของผู้ใช้คนนี้ (ปรับ goal มาตรฐานด้านบนให้เข้ากับข้อมูลนี้ ตอบครบทุก situation):\n${JSON.stringify(facts, null, 2)}`;
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
  checkins: Checkin[]
): Promise<Map<Situation, string> | null> {
  if (situations.length === 0) return null;

  const allowed = new Set(situations);
  const prompt = buildGoalPrompt(situations, checkins);

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
