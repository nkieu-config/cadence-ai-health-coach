import { daysAgo, shiftDate, today } from "@/lib/checkins/date";
import { getCheckinsBetween } from "@/lib/checkins/queries";
import { createClient } from "@/lib/supabase/server";
import {
  buildWeekComparison,
  buildWeekFacts,
  REFLECTION_DAYS,
  type WeekComparison,
} from "./reflection-facts";
import {
  AI_OUTPUT_COLUMNS,
  REFLECTION_HISTORY_LIMIT,
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

function toReflection(row: AiOutputRow): Reflection {
  return {
    periodStart: row.period_start,
    periodEnd: row.period_end,
    createdAt: row.created_at,
    ...(row.content as Omit<Reflection, "periodStart" | "periodEnd" | "createdAt">),
  };
}

export async function getLatestReflection(): Promise<Reflection | null> {
  const row = await latest("weekly_reflection");
  return row ? toReflection(row) : null;
}

export async function getWeekComparison(
  periodStart: string,
  periodEnd: string
): Promise<WeekComparison | null> {
  const previousEnd = shiftDate(periodStart, -1);
  const previousStart = shiftDate(previousEnd, -(REFLECTION_DAYS - 1));

  const [currentCheckins, previousCheckins] = await Promise.all([
    getCheckinsBetween(periodStart, periodEnd),
    getCheckinsBetween(previousStart, previousEnd),
  ]);

  const current = buildWeekFacts(currentCheckins, [], REFLECTION_DAYS);
  const previous = buildWeekFacts(previousCheckins, [], REFLECTION_DAYS);

  return buildWeekComparison(current, previous, previousStart, previousEnd);
}

export async function getReflections(): Promise<Reflection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_outputs")
    .select(AI_OUTPUT_COLUMNS)
    .eq("kind", "weekly_reflection")
    .order("period_start", { ascending: false })
    .limit(REFLECTION_HISTORY_LIMIT);

  if (error || !data) return [];
  return (data as unknown as AiOutputRow[]).map(toReflection);
}
