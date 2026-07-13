"use server";

import { revalidatePath } from "next/cache";
import type { Checkin } from "@/lib/patterns/types";
import { createClient } from "@/lib/supabase/server";
import { today } from "./date";
import { toRow } from "./mapper";
import { validateCheckin } from "./validate";

export type SaveCheckinResult = { ok: true } | { error: string };

export async function saveCheckin(input: Checkin): Promise<SaveCheckinResult> {
  const invalid = validateCheckin(input, today());
  if (invalid) {
    return { error: invalid };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };
  }

  const { error } = await supabase
    .from("checkins")
    .upsert(toRow(input, user.id), { onConflict: "user_id,checkin_date" });

  if (error) {
    return { error: "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง" };
  }

  revalidatePath("/checkin");
  revalidatePath("/dashboard");
  return { ok: true };
}
