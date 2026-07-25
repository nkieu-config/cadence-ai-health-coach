import { generateJson, isQuotaExhausted } from "@/lib/ai";
import { REFLECTION_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { GOAL_STATUS_LABELS } from "@/lib/goals/types";
import { findForbiddenTerms } from "@/lib/safety/language";
import {
  pillarEvidence,
  templateReflection,
  type ReflectionText,
  type WeekFacts,
} from "./reflection-facts";
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
      จำนวนวันที่กินครบทุกมื้อ: `${facts.eating.completeDays} วัน`,
      จำนวนวันที่ข้ามมื้อเช้า: `${facts.eating.skipBreakfastDays} วัน`,
      "สัดส่วนวันที่ข้ามมื้อใดก็ได้ (ไม่เจาะจงว่ามื้อเช้า) — เฉพาะวันมีสิ่งรบกวนตาราง": `${Math.round(facts.eating.skipRateDisruptor * 100)}% ของ ${facts.eating.disruptorDays} วัน`,
      "สัดส่วนวันที่ข้ามมื้อใดก็ได้ (ไม่เจาะจงว่ามื้อเช้า) — เฉพาะวันปกติ": `${Math.round(facts.eating.skipRateCalm * 100)}% ของ ${facts.eating.calmDays} วัน`,
    },
    การนอน: {
      "ชั่วโมงนอนเฉลี่ยต่อคืน (ไม่ใช่เวลาเข้านอน)": `${facts.sleep.avgHours} ชม.`,
      จำนวนคืนที่เข้านอนหลังเที่ยงคืน: `${facts.sleep.lateNights} คืน`,
      "ชั่วโมงนอนเฉลี่ยต่อคืน — เฉพาะวันมีสิ่งรบกวนตาราง": `${facts.sleep.avgHoursDisruptor} ชม.`,
      "ชั่วโมงนอนเฉลี่ยต่อคืน — เฉพาะวันปกติ": `${facts.sleep.avgHoursCalm} ชม.`,
    },
    การเคลื่อนไหว: {
      นาทีที่ขยับเฉลี่ยต่อวัน: `${facts.movement.avgMinutes} นาที`,
      จำนวนวันที่ไม่ได้ขยับเลย: `${facts.movement.stillDays} วัน`,
      "นาทีที่ขยับเฉลี่ยต่อวัน — เฉพาะวันมีสิ่งรบกวนตาราง": `${facts.movement.avgMinutesDisruptor} นาที`,
      "นาทีที่ขยับเฉลี่ยต่อวัน — เฉพาะวันปกติ": `${facts.movement.avgMinutesCalm} นาที`,
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
  const evidence = pillarEvidence(facts);

  return {
    pillars: [
      { pillar: "eating", summary: text.eating, evidence: evidence.eating },
      { pillar: "sleep", summary: text.sleep, evidence: evidence.sleep },
      { pillar: "movement", summary: text.movement, evidence: evidence.movement },
    ],
    strengths: text.strengths,
    nextWeek: text.nextWeek,
  };
}
