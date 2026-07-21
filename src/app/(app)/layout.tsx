import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser, hasCompletedOnboarding } from "@/lib/auth/user";
import { AppNav } from "@/components/app-nav";
import { AppSidebar } from "@/components/app-sidebar";
import { PageContainer } from "@/components/page-container";
import { SafetyNotice } from "@/components/safety-notice";
import { SignOutButton } from "@/components/sign-out-button";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!(await hasCompletedOnboarding())) redirect("/onboarding");

  return (
    <div className="relative flex min-h-dvh flex-col lg:flex-row">
      <a
        href="#main"
        className="absolute top-4 left-4 z-50 inline-flex min-h-11 -translate-y-24 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-transform focus-visible:translate-y-0"
      >
        ข้ามไปเนื้อหาหลัก
      </a>

      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b bg-background lg:hidden">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-2">
            <span className="font-semibold">HealthCoach</span>
            <SignOutButton compact />
          </div>
        </header>

        <main id="main" tabIndex={-1} className="flex-1 px-4 py-6 outline-none lg:px-10 lg:py-10">
          {children}
        </main>

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
