import { generateJson, isQuotaExhausted } from "@/lib/ai";
import { INSIGHT_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import type { Pillar } from "@/lib/domain";
import type { PatternCandidate, PatternId } from "@/lib/patterns/types";
import { findForbiddenTerms } from "@/lib/safety/language";
import { formatMetric, METRIC_LABELS } from "./format";
import { toInsightPattern } from "./templates";
import type { InsightPattern } from "./types";

export type AiInsightText = {
  observation: string;
  meaning: string;
  nextStep: string;
};

const PILLAR_TH: Record<Pillar, string> = {
  eating: "การกิน",
  sleep: "การนอน",
  movement: "การเคลื่อนไหว",
};

export const INSIGHT_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    patterns: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          observation: { type: "STRING" },
          meaning: { type: "STRING" },
          next_step: { type: "STRING" },
        },
        required: ["id", "observation", "meaning", "next_step"],
        propertyOrdering: ["id", "observation", "meaning", "next_step"],
      },
    },
  },
  required: ["patterns"],
};

export function buildInsightPrompt(candidates: PatternCandidate[]): string {
  const facts = candidates.map((candidate) => ({
    id: candidate.id,
    ด้าน: candidate.pillars.map((pillar) => PILLAR_TH[pillar]).join(" + "),
    ตัวชี้วัด: METRIC_LABELS[candidate.metric],
    กลุ่ม_A: `${candidate.groupA.label} (${candidate.groupA.days} วัน): ${formatMetric(candidate.metric, candidate.groupA.value)}`,
    กลุ่ม_B: `${candidate.groupB.label} (${candidate.groupB.days} วัน): ${formatMetric(candidate.metric, candidate.groupB.value)}`,
  }));

  return `นี่คือสัญญาณที่ระบบคำนวณจากข้อมูลจริงของผู้ใช้ เขียน observation, meaning และ next_step ให้ครบทุกสัญญาณ โดยตอบ id ให้ตรงกับที่ให้มาเป๊ะ:\n\n${JSON.stringify(facts, null, 2)}`;
}

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function parseInsightText(
  raw: unknown,
  allowedIds: Set<PatternId>
): Map<PatternId, AiInsightText> {
  const result = new Map<PatternId, AiInsightText>();
  if (!raw || typeof raw !== "object") return result;

  const patterns = (raw as { patterns?: unknown }).patterns;
  if (!Array.isArray(patterns)) return result;

  for (const entry of patterns) {
    if (!entry || typeof entry !== "object") continue;

    const id = (entry as { id?: unknown }).id as PatternId;
    if (!allowedIds.has(id) || result.has(id)) continue;

    const observation = cleanString((entry as { observation?: unknown }).observation);
    const meaning = cleanString((entry as { meaning?: unknown }).meaning);
    const nextStep = cleanString((entry as { next_step?: unknown }).next_step);
    if (!observation || !meaning || !nextStep) continue;

    if (findForbiddenTerms(`${observation} ${meaning} ${nextStep}`).length > 0) continue;

    result.set(id, { observation, meaning, nextStep });
  }

  return result;
}

export function mergeInsightPatterns(
  candidates: PatternCandidate[],
  aiById: Map<PatternId, AiInsightText> | null
): InsightPattern[] {
  return candidates.map((candidate) => {
    const base = toInsightPattern(candidate);
    const ai = aiById?.get(candidate.id);
    if (!ai) return base;
    return { ...base, observation: ai.observation, meaning: ai.meaning, nextStep: ai.nextStep };
  });
}

export async function generateInsightText(
  candidates: PatternCandidate[]
): Promise<Map<PatternId, AiInsightText> | null> {
  if (candidates.length === 0) return null;

  const allowedIds = new Set(candidates.map((candidate) => candidate.id));
  const prompt = buildInsightPrompt(candidates);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const raw = await generateJson<unknown>(
        [{ role: "user", content: prompt }],
        INSIGHT_RESPONSE_SCHEMA,
        INSIGHT_SYSTEM_PROMPT
      );
      const parsed = parseInsightText(raw, allowedIds);
      if (parsed.size > 0) return parsed;
    } catch (error) {
      if (isQuotaExhausted(error)) return null;
    }
  }

  return null;
}
