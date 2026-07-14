"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateOnboarding, type OnboardingInput } from "./types";

export async function completeOnboarding(input: OnboardingInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const invalid = validateOnboarding(input);
  if (invalid) {
    return { error: invalid };
  }

  const { error } = await supabase.from("profiles").upsert({
    user_id: user.id,
    display_name: input.displayName.trim(),
    status: input.status,
    early_days: input.earlyDays,
    typical_constraints: input.constraints,
    busy_periods: input.busyPeriods,
    disclaimer_accepted_at: new Date().toISOString(),
  });
  if (error) {
    return { error: "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง" };
  }

  revalidatePath("/", "layout");
  redirect("/");
}
