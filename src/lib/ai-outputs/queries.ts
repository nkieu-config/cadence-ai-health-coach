import { daysAgo, today } from "@/lib/checkins/date";
import { createClient } from "@/lib/supabase/server";
import {
  AI_OUTPUT_COLUMNS,
  type AiOutputKind,
  type AiOutputRow,
  type Insight,
  type Reflection,
} from "./types";

export function periodFor(days: number) {
  return { periodStart: daysAgo(days - 1), periodEnd: today() };
}

async function latest(kind: AiOutputKind, period?: { periodStart: string; periodEnd: string }) {
  const supabase = await createClient();
  let query = supabase
    .from("ai_outputs")
    .select(AI_OUTPUT_COLUMNS)
    .eq("kind", kind)
    .order("created_at", { ascending: false })
    .limit(1);

  if (period) {
    query = query.eq("period_start", period.periodStart).eq("period_end", period.periodEnd);
  }

  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return data as unknown as AiOutputRow;
}

export async function getLatestInsight(days: number): Promise<Insight | null> {
  const period = periodFor(days);
  const row = await latest("pattern_analysis", period);
  if (!row) return null;

  return {
    periodStart: row.period_start,
    periodEnd: row.period_end,
    createdAt: row.created_at,
    ...(row.content as { patterns: Insight["patterns"] }),
  };
}

export async function getLatestReflection(): Promise<Reflection | null> {
  const row = await latest("weekly_reflection");
  if (!row) return null;

  return {
    periodStart: row.period_start,
    periodEnd: row.period_end,
    createdAt: row.created_at,
    ...(row.content as Omit<Reflection, "periodStart" | "periodEnd" | "createdAt">),
  };
}
