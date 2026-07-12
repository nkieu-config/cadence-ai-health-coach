import type { Checkin } from "@/lib/patterns/types";
import { createClient } from "@/lib/supabase/server";
import { toCheckin } from "./mapper";
import { CHECKIN_COLUMNS, type CheckinRow } from "./types";

function isoDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export async function getCheckins(days: number): Promise<Checkin[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("checkins")
    .select(CHECKIN_COLUMNS)
    .gte("checkin_date", isoDaysAgo(days - 1))
    .order("checkin_date", { ascending: true });

  if (error || !data) return [];
  return (data as unknown as CheckinRow[]).map(toCheckin);
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
