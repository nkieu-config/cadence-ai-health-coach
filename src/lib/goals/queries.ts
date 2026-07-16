import { createClient } from "@/lib/supabase/server";
import { GOAL_COLUMNS, type Goal, type GoalRow, toGoal } from "./types";
import { weekStart } from "./week";

export async function getGoals(week = weekStart()): Promise<Goal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("goals")
    .select(GOAL_COLUMNS)
    .eq("week_start", week)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return (data as unknown as GoalRow[]).map(toGoal);
}

export async function getActiveGoals(week = weekStart()): Promise<Goal[]> {
  return (await getGoals(week)).filter((goal) => goal.status === "active");
}
