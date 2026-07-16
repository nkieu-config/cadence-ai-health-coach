import { generateJson, isQuotaExhausted } from "@/lib/ai";
import { REFLECTION_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { GOAL_STATUS_LABELS } from "@/lib/goals/types";
import { findForbiddenTerms } from "@/lib/safety/language";
import { templateReflection, type ReflectionText, type WeekFacts } from "./reflection-facts";
import type { ReflectionPillar } from "./types";

export const REFLECTION_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    eating: { type: "STRING" },
    sleep: { type: "STRING" },
    movement: { type: "STRING" },
    strengths: { type: "STRING" },
    nextWeek: { type: "STRING" },
  },
  required: ["eating", "sleep", "movement", "strengths", "nextWeek"],
  propertyOrdering: ["eating", "sleep", "movement", "strengths", "nextWeek"],
};

export function buildReflectionPrompt(facts: WeekFacts): string {
  const body = {
    ความถี่บันทึก: `${facts.daysRecorded}/${facts.totalDays} วัน`,
    การกิน: {
      กินครบทุกมื้อ: `${facts.eating.completeDays} วัน`,
      ข้ามมื้อเช้า: `${facts.eating.skipBreakfastDays} วัน`,
      อัตราข้ามมื้อวันมีสิ่งรบกวนตาราง: `${Math.round(facts.eating.skipRateDisruptor * 100)}% (${facts.eating.disruptorDays} วัน)`,
      อัตราข้ามมื้อวันปกติ: `${Math.round(facts.eating.skipRateCalm * 100)}% (${facts.eating.calmDays} วัน)`,
    },
    การนอน: {
      นอนเฉลี่ย: `${facts.sleep.avgHours} ชม.`,
      เข้านอนหลังเที่ยงคืน: `${facts.sleep.lateNights} วัน`,
      นอนเฉลี่ยวันมีสิ่งรบกวนตาราง: `${facts.sleep.avgHoursDisruptor} ชม.`,
      นอนเฉลี่ยวันปกติ: `${facts.sleep.avgHoursCalm} ชม.`,
    },
    การเคลื่อนไหว: {
      ขยับเฉลี่ย: `${facts.movement.avgMinutes} นาที/วัน`,
      ไม่ได้ขยับเลย: `${facts.movement.stillDays} วัน`,
      ขยับเฉลี่ยวันมีสิ่งรบกวนตาราง: `${facts.movement.avgMinutesDisruptor} นาที/วัน`,
      ขยับเฉลี่ยวันปกติ: `${facts.movement.avgMinutesCalm} นาที/วัน`,
    },
    เป้าหมายสัปดาห์นี้: facts.goals.map((goal) => ({
      ชื่อ: goal.title,
      สถานการณ์: goal.situation,
      สถานะ: GOAL_STATUS_LABELS[goal.status],
      ทำไปแล้ว: `${goal.daysTicked} วัน`,
    })),
  };

  return `นี่คือสถิติสัปดาห์นี้ที่ระบบคำนวณจากข้อมูลจริงของผู้ใช้ เขียนสรุปสัปดาห์ตาม schema:\n\n${JSON.stringify(body, null, 2)}`;
}

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function parseReflectionText(raw: unknown): ReflectionText | null {
  if (!raw || typeof raw !== "object") return null;

  const obj = raw as Record<string, unknown>;
  const eating = cleanString(obj.eating);
  const sleep = cleanString(obj.sleep);
  const movement = cleanString(obj.movement);
  const strengths = cleanString(obj.strengths);
  const nextWeek = cleanString(obj.nextWeek);

  if (!eating || !sleep || !movement || !strengths || !nextWeek) return null;

  const combined = `${eating} ${sleep} ${movement} ${strengths} ${nextWeek}`;
  if (findForbiddenTerms(combined).length > 0) return null;

  return { eating, sleep, movement, strengths, nextWeek };
}

export async function generateReflectionText(facts: WeekFacts): Promise<ReflectionText | null> {
  const prompt = buildReflectionPrompt(facts);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const raw = await generateJson<unknown>(
        [{ role: "user", content: prompt }],
        REFLECTION_RESPONSE_SCHEMA,
        REFLECTION_SYSTEM_PROMPT
      );
      const parsed = parseReflectionText(raw);
      if (parsed) return parsed;
    } catch (error) {
      if (isQuotaExhausted(error)) return null;
    }
  }

  return null;
}

export function mergeReflectionText(
  facts: WeekFacts,
  ai: ReflectionText | null
): { pillars: ReflectionPillar[]; strengths: string; nextWeek: string } {
  const text = ai ?? templateReflection(facts);

  return {
    pillars: [
      { pillar: "eating", summary: text.eating },
      { pillar: "sleep", summary: text.sleep },
      { pillar: "movement", summary: text.movement },
    ],
    strengths: text.strengths,
    nextWeek: text.nextWeek,
  };
}
