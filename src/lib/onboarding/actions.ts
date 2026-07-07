"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type OnboardingInput = {
  displayName: string;
  status: "student" | "first_jobber";
  earlyDays: string[];
  constraints: string[];
};

export async function completeOnboarding(input: OnboardingInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const displayName = input.displayName?.trim();
  if (!displayName) {
    return { error: "กรอกชื่อเล่นก่อน" };
  }
  if (input.status !== "student" && input.status !== "first_jobber") {
    return { error: "เลือกสถานะก่อน" };
  }

  const { error } = await supabase.from("profiles").upsert({
    user_id: user.id,
    display_name: displayName,
    status: input.status,
    early_days: input.earlyDays ?? [],
    typical_constraints: input.constraints ?? [],
    disclaimer_accepted_at: new Date().toISOString(),
  });
  if (error) {
    return { error: "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง" };
  }

  revalidatePath("/", "layout");
  redirect("/");
}
