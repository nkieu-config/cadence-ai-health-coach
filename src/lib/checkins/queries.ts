import type { Checkin } from "@/lib/patterns/types";
import { createClient } from "@/lib/supabase/server";
import { daysAgo } from "./date";
import { toCheckin } from "./mapper";
import { CHECKIN_COLUMNS, type CheckinRow } from "./types";

export async function getCheckins(days: number): Promise<Checkin[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("checkins")
    .select(CHECKIN_COLUMNS)
    .gte("checkin_date", daysAgo(days - 1))
    .order("checkin_date", { ascending: true });

  if (error || !data) return [];
  return (data as unknown as CheckinRow[]).map(toCheckin);
}

export async function latestCheckinAt(): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("checkins")
    .select("updated_at")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return (data as { updated_at: string }).updated_at;
}

export async function getCheckinByDate(date: string): Promise<Checkin | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("checkins")
    .select(CHECKIN_COLUMNS)
    .eq("checkin_date", date)
    .maybeSingle();

  if (error || !data) return null;
  return toCheckin(data as unknown as CheckinRow);
}
