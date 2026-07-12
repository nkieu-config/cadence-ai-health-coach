import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/checkin");

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
