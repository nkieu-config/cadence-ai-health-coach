"use server";

import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth/user";
import { getCheckins } from "@/lib/checkins/queries";
import { createClient } from "@/lib/supabase/server";
import { generateGoalSuggestions, mergeGoalSuggestions } from "./goal-ai";
import { getActiveGoals, getGoals } from "./queries";
import { chooseSituations, validateGoalTitle } from "./suggest";
import { BUSY_PERIOD_LABELS, CONSTRAINT_LABELS, EARLY_DAY_LABELS } from "@/lib/onboarding/types";
import {
  GOAL_LIMIT_NOTICE,
  MAX_ACTIVE_GOALS,
  PILLARS,
  SITUATIONS,
  type GoalContext,
  type GoalProfile,
  type GoalStatus,
  type GoalSuggestion,
  type Situation,
} from "./types";
import { weekDates, weekStart } from "./week";
import { today } from "@/lib/checkins/date";

const SUGGESTION_WINDOW_DAYS = 14;

type ProfileRow = Awaited<ReturnType<typeof getProfile>>;

function knownOnly(values: string[] | undefined, labels: Record<string, string>): string[] {
  return (values ?? []).filter((value) => value in labels);
}

function mergeContext(profileRow: ProfileRow, context: GoalContext | undefined): GoalProfile {
  const fromProfile = {
    earlyDays: knownOnly(profileRow?.early_days ?? [], EARLY_DAY_LABELS),
    busyPeriods: knownOnly(profileRow?.busy_periods ?? [], BUSY_PERIOD_LABELS),
    constraints: knownOnly(profileRow?.typical_constraints ?? [], CONSTRAINT_LABELS),
  };

  const fromFlow = knownOnly(context?.constraints, CONSTRAINT_LABELS);

  return {
    ...fromProfile,
    constraints: [...new Set([...fromProfile.constraints, ...fromFlow])],
    busyDaysNextWeek: knownOnly(context?.busyDays, EARLY_DAY_LABELS),
  };
}

export type GoalResult = { ok: true } | { notice: string } | { error: string };
export type SuggestResult =
  { ok: true; suggestions: GoalSuggestion[] } | { notice: string } | { error: string };

async function currentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function recommendGoals(context?: GoalContext): Promise<SuggestResult> {
  const { user } = await currentUser();
  if (!user) {
    return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };
  }

  const [checkins, profileRow] = await Promise.all([
    getCheckins(SUGGESTION_WINDOW_DAYS),
    getProfile(),
  ]);

  if (checkins.length === 0) {
    return { notice: "ยังไม่มีบันทึกให้ดู — ลองเช็คอินสัก 2–3 วันก่อน แล้วค่อยกลับมาขอคำแนะนำ" };
  }

  const profile = profileRow || context ? mergeContext(profileRow, context) : null;
  const pillar = PILLARS.includes(context?.pillar as (typeof PILLARS)[number])
    ? context?.pillar
    : undefined;

  const situations = chooseSituations(checkins, MAX_ACTIVE_GOALS, pillar);
  const aiBySituation = await generateGoalSuggestions(situations, checkins, profile);

  return { ok: true, suggestions: mergeGoalSuggestions(situations, aiBySituation) };
}

export async function acceptGoal(title: string, situation: Situation): Promise<GoalResult> {
  const invalid = validateGoalTitle(title);
  if (invalid) {
    return { error: invalid };
  }
  if (!SITUATIONS.includes(situation)) {
    return { error: "สถานการณ์ไม่ถูกต้อง" };
  }

  const { supabase, user } = await currentUser();
  if (!user) {
    return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };
  }

  const active = await getActiveGoals();
  if (active.length >= MAX_ACTIVE_GOALS) {
    return { notice: GOAL_LIMIT_NOTICE };
  }

  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    week_start: weekStart(),
    title: title.trim(),
    situation_tag: situation,
    status: "active",
  });

  if (error) {
    return { error: "บันทึกเป้าหมายไม่สำเร็จ ลองใหม่อีกครั้ง" };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function toggleGoalDay(goalId: string, date: string): Promise<GoalResult> {
  const { supabase, user } = await currentUser();
  if (!user) {
    return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };
  }

  const goal = (await getGoals()).find((candidate) => candidate.id === goalId);
  if (!goal) {
    return { error: "ไม่พบเป้าหมายนี้" };
  }

  if (!weekDates(goal.weekStart).includes(date)) {
    return { error: "วันที่ติ๊กไม่อยู่ในสัปดาห์ของเป้าหมายนี้" };
  }
  if (date > today()) {
    return { error: "ติ๊กความคืบหน้าล่วงหน้าไม่ได้" };
  }

  const progressDates = goal.progressDates.includes(date)
    ? goal.progressDates.filter((day) => day !== date)
    : [...goal.progressDates, date].sort();

  const { error } = await supabase
    .from("goals")
    .update({ progress_dates: progressDates })
    .eq("id", goalId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "บันทึกความคืบหน้าไม่สำเร็จ ลองใหม่อีกครั้ง" };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateGoalStatus(goalId: string, status: GoalStatus): Promise<GoalResult> {
  const { supabase, user } = await currentUser();
  if (!user) {
    return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };
  }

  const { error } = await supabase
    .from("goals")
    .update({ status })
    .eq("id", goalId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "อัปเดตสถานะไม่สำเร็จ ลองใหม่อีกครั้ง" };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { ok: true };
}
