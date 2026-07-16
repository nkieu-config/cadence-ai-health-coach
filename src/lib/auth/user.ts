import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("display_name, status, early_days, busy_periods, typical_constraints")
    .eq("user_id", user.id)
    .maybeSingle();

  return data;
});

export const hasCompletedOnboarding = cache(async (): Promise<boolean> => {
  return Boolean(await getProfile());
});
