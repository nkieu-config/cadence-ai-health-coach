"use server";

import { revalidatePath } from "next/cache";
import { getCheckins } from "@/lib/checkins/queries";
import { createClient } from "@/lib/supabase/server";
import { generateGoalSuggestions, mergeGoalSuggestions } from "./goal-ai";
import { getActiveGoals, getGoals } from "./queries";
import { chooseSituations, validateGoalTitle } from "./suggest";
import {
  MAX_ACTIVE_GOALS,
  SITUATIONS,
  type GoalStatus,
  type GoalSuggestion,
  type Situation,
} from "./types";
import { weekStart } from "./week";

const SUGGESTION_WINDOW_DAYS = 14;

export type GoalResult = { ok: true } | { error: string };
export type SuggestResult = { ok: true; suggestions: GoalSuggestion[] } | { error: string };

async function currentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function recommendGoals(): Promise<SuggestResult> {
  const { user } = await currentUser();
  if (!user) {
    return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };
  }

  const checkins = await getCheckins(SUGGESTION_WINDOW_DAYS);
  if (checkins.length === 0) {
    return { error: "ยังไม่มีบันทึกให้ดู — ลองเช็คอินสัก 2–3 วันก่อน แล้วค่อยกลับมาขอคำแนะนำ" };
  }

  const situations = chooseSituations(checkins, MAX_ACTIVE_GOALS);
  const aiBySituation = await generateGoalSuggestions(situations, checkins);

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
    return {
      error: `สัปดาห์นี้มีเป้าหมายอยู่ ${MAX_ACTIVE_GOALS} ข้อแล้ว — จบข้อเดิมก่อนค่อยเพิ่มใหม่ จะได้ไม่หนักเกินไป`,
    };
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
