import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser, getProfile, hasCompletedOnboarding } from "@/lib/auth/user";
import { AppNav } from "@/components/app-nav";
import { AppSidebar } from "@/components/app-sidebar";
import { PageContainer } from "@/components/page-container";
import { SafetyNotice } from "@/components/safety-notice";
import { SignOutButton } from "@/components/sign-out-button";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!(await hasCompletedOnboarding())) redirect("/onboarding");

  const profile = await getProfile();
  const name = profile?.display_name ?? null;

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <AppSidebar name={name} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b bg-background lg:hidden">
          <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-2">
            <div className="min-w-0">
              <span className="block font-semibold">HealthCoach</span>
              {name && (
                <span className="block truncate text-xs text-muted-foreground">
                  สวัสดี {name} 👋
                </span>
              )}
            </div>
            <SignOutButton compact />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-10 lg:py-10">{children}</main>

        <div className="px-4 pb-3 lg:px-10 lg:pb-8">
          <PageContainer width="content">
            <SafetyNotice />
          </PageContainer>
        </div>

        <AppNav />
      </div>
    </div>
  );
}
