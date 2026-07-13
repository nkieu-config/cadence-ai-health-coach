import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import {
  MAX_PERIOD,
  PeriodToggle,
  parsePeriod,
  type DashboardPeriod,
} from "@/components/dashboard/period-toggle";
import { CurrentGoalCard } from "@/components/goals/current-goal-card";
import { PageContainer } from "@/components/page-container";
import { ReflectionCard } from "@/components/reflection/reflection-card";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { daysAgo, formatThaiDate, today } from "@/lib/checkins/date";
import { getCheckins } from "@/lib/checkins/queries";
import { buildCheckinSummary } from "@/lib/checkins/summary";
import type { Checkin } from "@/lib/patterns/types";

function ComingSoonSection({ label }: { label: string }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-lg border border-dashed bg-muted/30 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function WelcomeCard() {
  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle>ยินดีต้อนรับสู่ HealthCoach 👋</CardTitle>
        <CardDescription>เริ่มจากบันทึกวันนี้ก่อน</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          พอบันทึกต่อเนื่องสักพัก หน้านี้จะเริ่มแสดงรูปแบบการกิน การนอน
          และการเคลื่อนไหวของคุณให้เห็น
        </p>
        <Link href="/checkin" className={buttonVariants({ className: "w-full" })}>
          <CalendarCheck className="size-4" />
          เช็คอินวันแรกของคุณ
        </Link>
      </CardContent>
    </Card>
  );
}

function TodayCard({ checkin }: { checkin: Checkin | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">สรุปวันนี้</CardTitle>
        <CardDescription>{formatThaiDate(today())}</CardDescription>
      </CardHeader>
      <CardContent>
        {checkin ? (
          <ul className="space-y-1 text-sm text-muted-foreground">
            {buildCheckinSummary(checkin).lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">ยังไม่ได้บันทึกของวันนี้</p>
            <Link href="/checkin" className={buttonVariants({ className: "w-full" })}>
              เช็คอินวันนี้
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const period = parsePeriod((await searchParams).days);
  const recent = await getCheckins(MAX_PERIOD);

  if (recent.length === 0) {
    return (
      <PageContainer>
        <WelcomeCard />
      </PageContainer>
    );
  }

  const from = daysAgo(period - 1);
  const inPeriod = recent.filter((checkin) => checkin.checkinDate >= from);
  const todaysCheckin = recent.find((checkin) => checkin.checkinDate === today()) ?? null;

  return (
    <PageContainer width="content" className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold lg:text-2xl">ภาพรวมสุขภาพ</h1>
          <p className="text-sm text-muted-foreground">ดูรูปแบบของตัวเองย้อนหลัง</p>
        </div>
        <PeriodToggle period={period} />
      </div>

      {inPeriod.length === 0 ? (
        <div className="space-y-5">
          <TodayCard checkin={todaysCheckin} />
          <EmptyPeriodCard period={period} />
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3 lg:items-start">
          <div className="space-y-5 lg:col-span-1">
            <TodayCard checkin={todaysCheckin} />
            <CurrentGoalCard />
            <ReflectionCard />
          </div>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">แนวโน้ม 3 ด้าน</CardTitle>
              <CardDescription>
                บันทึกแล้ว {inPeriod.length} วัน จาก {period} วันที่ผ่านมา
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComingSoonSection label="กราฟ กิน / นอน / เคลื่อนไหว (F2-02)" />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base">รูปแบบที่พบ</CardTitle>
              <CardDescription>สัญญาณที่น่าติดตาม ไม่ใช่ข้อสรุป</CardDescription>
            </CardHeader>
            <CardContent>
              <ComingSoonSection label="ตาราง pattern (F2-04)" />
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}

function EmptyPeriodCard({ period }: { period: DashboardPeriod }) {
  return (
    <Card>
      <CardContent className="space-y-3 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          ไม่มีบันทึกในช่วง {period} วันที่ผ่านมา
        </p>
        <Link
          href={`/dashboard?days=${MAX_PERIOD}`}
          className={buttonVariants({ variant: "outline", className: "w-full" })}
        >
          ลองดูย้อนหลัง {MAX_PERIOD} วัน
        </Link>
      </CardContent>
    </Card>
  );
}
