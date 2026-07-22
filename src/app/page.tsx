import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BrandMark } from "@/components/brand";
import { PILLAR_COLORS, PILLAR_ICONS, PILLAR_ORDER } from "@/components/pillar-visual";
import { SafetyNotice } from "@/components/safety-notice";
import { buttonVariants } from "@/components/ui/button";
import { PILLAR_LABELS } from "@/lib/checkins/labels";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/checkin");

  return (
    <main className="flex min-h-dvh flex-col items-center p-3 text-center xs:p-4">
      <div className="my-auto flex flex-col items-center gap-8 py-8">
        <div className="space-y-3">
          <h1 className="flex items-center justify-center gap-3 text-4xl font-bold tracking-tight">
            <BrandMark className="size-10" />
            Cadence
          </h1>
          <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
            AI Personal Health Coach
          </p>
          <p className="max-w-md text-muted-foreground">
            ผู้ช่วยดูแลสุขภาพประจำวันสำหรับนักศึกษาและคนเริ่มทำงาน — เห็น pattern การกิน การนอน
            การเคลื่อนไหว แล้วเริ่มจากก้าวเล็ก ๆ ที่ทำได้จริง
          </p>
        </div>
        <ul className="flex flex-wrap justify-center gap-3">
          {PILLAR_ORDER.map((pillar) => {
            const Icon = PILLAR_ICONS[pillar];
            return (
              <li
                key={pillar}
                className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium"
              >
                <Icon className="size-4 shrink-0" style={{ color: PILLAR_COLORS[pillar] }} />
                {PILLAR_LABELS[pillar]}
              </li>
            );
          })}
        </ul>

        <div className="flex w-full max-w-xs flex-col gap-3">
          <Link href="/login" className={buttonVariants()}>
            เข้าสู่ระบบ
          </Link>
          <Link href="/register" className={buttonVariants({ variant: "outline" })}>
            สมัครสมาชิก
          </Link>
        </div>
      </div>

      <SafetyNotice className="max-w-md pb-2" />
    </main>
  );
}
