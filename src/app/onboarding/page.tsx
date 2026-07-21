import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, hasCompletedOnboarding } from "@/lib/auth/user";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export const metadata: Metadata = { title: "ตั้งค่าเริ่มต้น" };

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (await hasCompletedOnboarding()) redirect("/");

  const userMetadata = user.user_metadata ?? {};
  const defaultName =
    (typeof userMetadata.full_name === "string" && userMetadata.full_name) ||
    (typeof userMetadata.name === "string" && userMetadata.name) ||
    user.email?.split("@")[0] ||
    "";

  return <OnboardingForm defaultName={defaultName} />;
}
