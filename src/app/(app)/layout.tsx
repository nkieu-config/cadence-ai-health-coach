import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { hasCompletedOnboarding } from "@/lib/auth/onboarding";
import { signOut } from "@/lib/auth/actions";
import { AppNav } from "@/components/app-nav";
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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3">
          <span className="font-semibold">HealthCoach</span>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm" aria-label="ออกจากระบบ">
              <LogOut className="size-4" />
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">{children}</main>

      <div className="mx-auto w-full max-w-md px-4 pb-3">
        <SafetyNotice />
      </div>

      <AppNav />
    </div>
  );
}
