import { Suspense } from "react";
import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { getCheckins } from "@/lib/checkins/queries";
import { daysAgo, today } from "@/lib/checkins/date";
import { MAX_PERIOD, parsePeriod, PeriodToggle } from "@/components/dashboard/period-toggle";
import { PageContainer } from "@/components/page-container";
import { CardSkeleton } from "@/components/page-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { CurrentGoalCard } from "@/components/goals/current-goal-card";
import { ReflectionCard } from "@/components/reflection/reflection-card";
import { TodaySummary } from "@/components/dashboard/today-summary";
import { PatternTable } from "@/components/dashboard/pattern-table";
import { PillarCharts } from "@/components/dashboard/pillar-charts";
import { EnergyChart } from "@/components/dashboard/energy-chart";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { days } = await searchParams;
  const period = parsePeriod(days);
  const checkins = await getCheckins(MAX_PERIOD);

  if (checkins.length === 0) {
    return (
      <PageContainer width="content" className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold lg:text-2xl">ภาพรวมสุขภาพ</h1>
          <p className="text-sm text-muted-foreground">
            ดูแนวโน้มสุขภาพและคำแนะนำจากบันทึกสุขภาพรายวันของคุณ
          </p>
        </div>
        <Card className="flex flex-col items-center justify-center border-dashed p-8 text-center">
          <CardContent className="flex max-w-sm flex-col items-center justify-center space-y-4 pt-6">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CalendarCheck className="size-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">ยังไม่มีข้อมูลสุขภาพ</h2>
              <p className="text-sm text-muted-foreground">
                บันทึกสุขภาพรายวันครั้งแรกของคุณเพื่อเริ่มต้นวิเคราะห์แนวโน้มสุขภาพทั้ง 3 ด้าน
                (การกิน การนอน และการเคลื่อนไหว)
              </p>
            </div>
            <Link href="/checkin" className={buttonVariants({ className: "w-full lg:w-auto" })}>
              เช็คอินวันนี้
            </Link>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const todayDate = today();
  const todayCheckin = checkins.find((c) => c.checkinDate === todayDate) ?? null;
  const inPeriod = checkins.filter((c) => c.checkinDate >= daysAgo(period - 1));

  return (
    <PageContainer width="content" className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold lg:text-2xl">ภาพรวมสุขภาพ</h1>
          <p className="text-sm text-muted-foreground">
            ดูแนวโน้มสุขภาพและคำแนะนำจากบันทึกสุขภาพรายวันของคุณ — บันทึกแล้ว {inPeriod.length} วัน
            จาก {period} วันที่ผ่านมา
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodToggle period={period} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-1 min-w-0">
          <TodaySummary checkin={todayCheckin} date={todayDate} />
        </div>
        <div className="lg:col-span-2 min-w-0">
          <PillarCharts checkins={checkins} period={period} />
        </div>
      </div>

      <EnergyChart checkins={checkins} period={period} />

      <div className="grid gap-5 lg:grid-cols-2">
        <Suspense fallback={<CardSkeleton rows={1} />}>
          <CurrentGoalCard />
        </Suspense>
        <Suspense fallback={<CardSkeleton rows={1} />}>
          <ReflectionCard />
        </Suspense>
      </div>

      <Suspense fallback={<CardSkeleton rows={3} />}>
        <PatternTable days={period} recordedDays={inPeriod.length} />
      </Suspense>
    </PageContainer>
  );
}
