"use server";

import { revalidatePath } from "next/cache";
import { daysAgo, today } from "@/lib/checkins/date";
import { getCheckins, latestCheckinAt } from "@/lib/checkins/queries";
import { getGoals } from "@/lib/goals/queries";
import { computePatternCandidates } from "@/lib/patterns";
import { createClient } from "@/lib/supabase/server";
import { isFresh } from "./cache";
import { generateInsightText, mergeInsightPatterns } from "./insight-ai";
import { periodFor } from "./queries";
import {
  buildWeekFacts,
  MIN_DAYS_FOR_REFLECTION,
  REFLECTION_DAYS,
  shortReflection,
} from "./reflection-facts";
import { generateReflectionText, mergeReflectionText } from "./reflection-ai";
import { checkDataSufficiency } from "./sufficiency";
import type { AiOutputKind, Reflection } from "./types";

export type GenerateResult =
  | { ok: true; cached?: boolean }
  | { notEnoughData: true; daysRecorded: number; daysNeeded: number; message: string }
  | { error: string };

type Period = { periodStart: string; periodEnd: string };

async function cachedOutputAt(kind: AiOutputKind, period: Period): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_outputs")
    .select("created_at")
    .eq("kind", kind)
    .eq("period_start", period.periodStart)
    .eq("period_end", period.periodEnd)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return (data as { created_at: string }).created_at;
}

async function isCacheUsable(kind: AiOutputKind, period: Period): Promise<boolean> {
  const [cachedAt, checkinAt] = await Promise.all([
    cachedOutputAt(kind, period),
    latestCheckinAt(),
  ]);
  return isFresh(cachedAt, checkinAt);
}

async function replaceOutput(
  kind: AiOutputKind,
  period: Period,
  content: unknown
): Promise<GenerateResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };
  }

  await supabase
    .from("ai_outputs")
    .delete()
    .eq("user_id", user.id)
    .eq("kind", kind)
    .eq("period_start", period.periodStart)
    .eq("period_end", period.periodEnd);

  const { error } = await supabase.from("ai_outputs").insert({
    user_id: user.id,
    kind,
    period_start: period.periodStart,
    period_end: period.periodEnd,
    content,
  });

  if (error) {
    return { error: "บันทึกผลวิเคราะห์ไม่สำเร็จ ลองใหม่อีกครั้ง" };
  }
  return { ok: true };
}

export async function generateInsight(days: number): Promise<GenerateResult> {
  const period = periodFor(days);

  if (await isCacheUsable("pattern_analysis", period)) {
    return { ok: true, cached: true };
  }

  const checkins = await getCheckins(days);

  const sufficiency = checkDataSufficiency(checkins.length);
  if (!sufficiency.enough) {
    return {
      notEnoughData: true,
      daysRecorded: sufficiency.daysRecorded,
      daysNeeded: sufficiency.daysNeeded,
      message: sufficiency.message,
    };
  }

  const candidates = computePatternCandidates(checkins);
  const aiById = await generateInsightText(candidates);
  const patterns = mergeInsightPatterns(candidates, aiById);

  const result = await replaceOutput("pattern_analysis", period, { patterns });
  if ("error" in result) return result;

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function generateReflection(): Promise<GenerateResult> {
  const period = { periodStart: daysAgo(REFLECTION_DAYS - 1), periodEnd: today() };

  if (await isCacheUsable("weekly_reflection", period)) {
    return { ok: true, cached: true };
  }

  const checkins = await getCheckins(REFLECTION_DAYS);

  if (checkins.length === 0) {
    return { error: "ยังไม่มีบันทึกในสัปดาห์นี้ ลองเช็คอินก่อน" };
  }

  let content: Omit<Reflection, "periodStart" | "periodEnd" | "createdAt">;

  if (checkins.length < MIN_DAYS_FOR_REFLECTION) {
    content = shortReflection(checkins.length, REFLECTION_DAYS);
  } else {
    const goals = await getGoals();
    const facts = buildWeekFacts(checkins, goals, REFLECTION_DAYS);
    const aiText = await generateReflectionText(facts);
    const { pillars, strengths, nextWeek } = mergeReflectionText(facts, aiText);
    content = {
      daysRecorded: checkins.length,
      totalDays: REFLECTION_DAYS,
      pillars,
      strengths,
      nextWeek,
    };
  }

  const result = await replaceOutput("weekly_reflection", period, content);
  if ("error" in result) return result;

  revalidatePath("/reflection");
  revalidatePath("/dashboard");
  return { ok: true };
}
