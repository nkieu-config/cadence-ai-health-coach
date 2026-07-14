"use server";

import { revalidatePath } from "next/cache";
import { daysAgo, today } from "@/lib/checkins/date";
import { getCheckins, latestCheckinAt } from "@/lib/checkins/queries";
import { MIN_DAYS_FOR_ANALYSIS, computePatternCandidates, hasEnoughData } from "@/lib/patterns";
import type { Checkin } from "@/lib/patterns/types";
import { createClient } from "@/lib/supabase/server";
import { isFresh } from "./cache";
import { periodFor } from "./queries";
import { toInsightPattern } from "./templates";
import type { AiOutputKind, ReflectionPillar } from "./types";

export const REFLECTION_DAYS = 7;

export type GenerateResult = { ok: true; cached?: boolean } | { error: string };

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

  if (!hasEnoughData(checkins)) {
    return {
      error: `ต้องมีบันทึกอย่างน้อย ${MIN_DAYS_FOR_ANALYSIS} วันจึงจะวิเคราะห์ได้ — ตอนนี้มี ${checkins.length} วัน`,
    };
  }

  const patterns = computePatternCandidates(checkins).map(toInsightPattern);

  const result = await replaceOutput("pattern_analysis", period, { patterns });
  if ("error" in result) return result;

  revalidatePath("/dashboard");
  return { ok: true };
}

function countDays(checkins: Checkin[], matches: (checkin: Checkin) => boolean) {
  return checkins.filter(matches).length;
}

function average(checkins: Checkin[], value: (checkin: Checkin) => number) {
  if (checkins.length === 0) return 0;
  return (
    Math.round(
      (checkins.reduce((sum, checkin) => sum + value(checkin), 0) / checkins.length) * 10
    ) / 10
  );
}

function summarisePillars(checkins: Checkin[]): ReflectionPillar[] {
  const complete = countDays(checkins, (checkin) => checkin.skippedMeals.length === 0);
  const skippedBreakfast = countDays(checkins, (checkin) =>
    checkin.skippedMeals.includes("breakfast")
  );
  const lateNights = countDays(checkins, (checkin) =>
    ["00_01", "01_02", "after_02"].includes(checkin.bedTimeBucket)
  );
  const stillDays = countDays(checkins, (checkin) => checkin.movementMinutes === 0);

  return [
    {
      pillar: "eating",
      summary: `กินครบทุกมื้อ ${complete} จาก ${checkins.length} วันที่บันทึก · ข้ามมื้อเช้า ${skippedBreakfast} วัน`,
    },
    {
      pillar: "sleep",
      summary: `นอนเฉลี่ย ${average(checkins, (checkin) => checkin.sleepHours)} ชม. · เข้านอนหลังเที่ยงคืน ${lateNights} วัน`,
    },
    {
      pillar: "movement",
      summary: `ขยับเฉลี่ย ${average(checkins, (checkin) => checkin.movementMinutes)} นาทีต่อวัน · ไม่ได้ขยับ ${stillDays} วัน`,
    },
  ];
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

  const candidates = computePatternCandidates(checkins);
  const topStep = candidates.map(toInsightPattern).at(0)?.nextStep;

  const content = {
    daysRecorded: checkins.length,
    totalDays: REFLECTION_DAYS,
    pillars: summarisePillars(checkins),
    nextWeek:
      topStep ?? "เลือกก้าวเล็ก ๆ สัก 1 ข้อที่ทำได้แม้ในวันที่ตารางแน่น แล้วลองดูสัปดาห์หน้า",
  };

  const result = await replaceOutput("weekly_reflection", period, content);
  if ("error" in result) return result;

  revalidatePath("/reflection");
  revalidatePath("/dashboard");
  return { ok: true };
}
