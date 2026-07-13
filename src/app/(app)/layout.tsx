import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { hasCompletedOnboarding } from "@/lib/auth/onboarding";
import { signOut } from "@/lib/auth/actions";
import { AppNav } from "@/components/app-nav";
import { AppSidebar } from "@/components/app-sidebar";
import { PageContainer } from "@/components/page-container";
import { SafetyNotice } from "@/components/safety-notice";
import { Button } from "@/components/ui/button";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (!(await hasCompletedOnboarding(supabase, user.id))) redirect("/onboarding");

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b bg-background lg:hidden">
          <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-2">
            <span className="font-semibold">HealthCoach</span>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="icon" aria-label="ออกจากระบบ">
                <LogOut className="size-5" />
              </Button>
            </form>
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
