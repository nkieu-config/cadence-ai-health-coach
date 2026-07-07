import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasCompletedOnboarding } from "@/lib/auth/onboarding";
import { signOut } from "@/lib/auth/actions";
import { SafetyNotice } from "@/components/safety-notice";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-4 text-center">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">HealthCoach</h1>
          <p className="max-w-md text-muted-foreground">
            ผู้ช่วยดูแลสุขภาพประจำวันสำหรับนักศึกษาและคนเริ่มทำงาน — เห็น pattern การกิน การนอน
            การเคลื่อนไหว แล้วเริ่มจากก้าวเล็ก ๆ ที่ทำได้จริง
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className={buttonVariants()}>
            เข้าสู่ระบบ
          </Link>
          <Link href="/register" className={buttonVariants({ variant: "outline" })}>
            สมัครสมาชิก
          </Link>
        </div>
      </main>
    );
  }

  if (!(await hasCompletedOnboarding(supabase, user.id))) {
    redirect("/onboarding");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>สวัสดี 👋</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            เข้าสู่ระบบเรียบร้อย — หน้าแอปหลัก (check-in / dashboard) กำลังพัฒนาใน Sprint 1
          </p>
          <form action={signOut}>
            <Button type="submit" variant="outline" className="w-full">
              ออกจากระบบ
            </Button>
          </form>
        </CardContent>
      </Card>
      <SafetyNotice className="max-w-md" />
    </main>
  );
}
