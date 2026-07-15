import type { Pillar } from "@/lib/patterns/types";

export type PatternEvidence = {
  metric: string;
  groupA: { label: string; days: number; value: number };
  groupB: { label: string; days: number; value: number };
};

export type InsightPattern = {
  pillars: Pillar[];
  observation: string;
  meaning: string;
  nextStep: string;
  evidence: PatternEvidence;
};

export type Insight = {
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  patterns: InsightPattern[];
};

export type ReflectionPillar = {
  pillar: Pillar;
  summary: string;
};

export type Reflection = {
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  daysRecorded: number;
  totalDays: number;
  pillars: ReflectionPillar[];
  strengths: string;
  nextWeek: string;
};

export type AiOutputKind = "pattern_analysis" | "weekly_reflection";

export type AiOutputRow = {
  kind: string;
  period_start: string;
  period_end: string;
  content: unknown;
  created_at: string;
};

export const REFLECTION_HISTORY_LIMIT = 12;

export const AI_OUTPUT_COLUMNS = [
  "kind",
  "period_start",
  "period_end",
  "content",
  "created_at",
].join(", ");
