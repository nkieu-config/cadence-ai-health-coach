import Link from "next/link";
import { redirect } from "next/navigation";
import { Footprints, Moon, Utensils } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SafetyNotice } from "@/components/safety-notice";
import { buttonVariants } from "@/components/ui/button";

const PILLARS = [
  { icon: Utensils, label: "การกิน", color: "var(--chart-2)" },
  { icon: Moon, label: "การนอน", color: "var(--chart-1)" },
  { icon: Footprints, label: "การเคลื่อนไหว", color: "var(--chart-3)" },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/checkin");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 p-4 text-center">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">HealthCoach</h1>
        <p className="max-w-md text-muted-foreground">
          ผู้ช่วยดูแลสุขภาพประจำวันสำหรับนักศึกษาและคนเริ่มทำงาน — เห็น pattern การกิน การนอน
          การเคลื่อนไหว แล้วเริ่มจากก้าวเล็ก ๆ ที่ทำได้จริง
        </p>
      </div>
      <ul className="flex flex-wrap justify-center gap-3">
        {PILLARS.map(({ icon: Icon, label, color }) => (
          <li
            key={label}
            className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium"
          >
            <Icon className="size-4 shrink-0" style={{ color }} />
            {label}
          </li>
        ))}
      </ul>

      <div className="flex gap-3">
        <Link href="/login" className={buttonVariants()}>
          เข้าสู่ระบบ
        </Link>
        <Link href="/register" className={buttonVariants({ variant: "outline" })}>
          สมัครสมาชิก
        </Link>
      </div>

      <SafetyNotice className="max-w-md" />
    </main>
  );
}
