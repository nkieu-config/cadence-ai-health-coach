import type { Metadata } from "next";
import Link from "next/link";
import { NotebookPen, RefreshCw, Sparkles, Target } from "lucide-react";
import { PILLAR_COLORS, PILLAR_ICONS } from "@/components/pillar-visual";
import { GenerateReflectionButton } from "@/components/reflection/generate-reflection-button";
import { WeekComparisonCard } from "@/components/reflection/week-comparison-card";
import { pickWeek, WeekPicker } from "@/components/reflection/week-picker";
import { PageContainer } from "@/components/page-container";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isFresh } from "@/lib/ai-outputs/cache";
import { PILLAR_LABELS } from "@/lib/checkins/labels";
import { getReflections, getWeekComparison } from "@/lib/ai-outputs/queries";
import type { ReflectionPillar } from "@/lib/ai-outputs/types";
import { formatShortThaiDate } from "@/lib/checkins/date";
import { latestCheckinAt } from "@/lib/checkins/queries";

export const metadata: Metadata = { title: "สรุปสัปดาห์" };

export const dynamic = "force-dynamic";

function PillarSection({ entry }: { entry: ReflectionPillar }) {
  const Icon = PILLAR_ICONS[entry.pillar];
  return (
    <div className="flex gap-3">
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted/60"
        style={{ color: PILLAR_COLORS[entry.pillar] }}
      >
        <Icon className="size-4" />
      </div>
      <div className="space-y-1 pt-0.5">
        <h3 className="text-sm font-semibold text-foreground">ด้าน{PILLAR_LABELS[entry.pillar]}</h3>
        <p className="text-base text-foreground/90">{entry.summary}</p>
      </div>
    </div>
  );
}

function PageHeading() {
  return (
    <div className="space-y-2">
      <h1 className="flex items-center gap-2 text-xl font-semibold lg:text-2xl">
        <NotebookPen className="size-6 shrink-0 text-primary" />
        สรุปสัปดาห์
      </h1>
      <p className="text-sm text-muted-foreground">
        ภาพรวมการกิน การนอน และการเคลื่อนไหวของคุณ พร้อมก้าวเล็ก ๆ สำหรับสัปดาห์หน้า
      </p>
    </div>
  );
}

function OutdatedNotice() {
  return (
    <Card className="border-primary/20 bg-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="size-5 shrink-0 text-primary" />
          สรุปนี้ยังไม่รวมบันทึกล่าสุดของคุณ
        </CardTitle>
        <CardDescription>
          ข้อความสรุปด้านล่างสร้างไว้ก่อนที่คุณจะบันทึกเพิ่ม
          ส่วนตัวเลขที่เทียบกับสัปดาห์ก่อนคำนวณสดจากข้อมูลปัจจุบันเสมอ ทั้งสองอย่างจึงอาจไม่ตรงกัน
        </CardDescription>
      </CardHeader>
      <CardContent>
        <GenerateReflectionButton label="สร้างสรุปใหม่ให้ตรงข้อมูลล่าสุด" />
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ยังไม่มีสรุปของสัปดาห์นี้</CardTitle>
        <CardDescription>
          สรุปสร้างจากบันทึก 7 วันล่าสุดของคุณ ยิ่งบันทึกหลายวัน ภาพก็ยิ่งชัด
        </CardDescription>
      </CardHeader>
      <CardContent>
        <GenerateReflectionButton />
      </CardContent>
    </Card>
  );
}

export default async function ReflectionPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const reflections = await getReflections();
  const selected = pickWeek(reflections, week);

  if (!selected) {
    return (
      <PageContainer width="content">
        <div className="mx-auto max-w-3xl space-y-6">
          <PageHeading />
          <EmptyState />
        </div>
      </PageContainer>
    );
  }

  const [comparison, checkinAt] = await Promise.all([
    getWeekComparison(selected.periodStart, selected.periodEnd),
    latestCheckinAt(),
  ]);

  const isCurrentWeek = selected.periodStart === reflections[0].periodStart;
  const outdated = isCurrentWeek && !isFresh(selected.createdAt, checkinAt);

  return (
    <PageContainer width="content">
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeading />

        {reflections.length > 1 && (
          <WeekPicker weeks={reflections} selected={selected.periodStart} />
        )}

        {outdated && <OutdatedNotice />}

        <Card>
          <CardHeader>
            <CardTitle>
              {formatShortThaiDate(selected.periodStart)} –{" "}
              {formatShortThaiDate(selected.periodEnd)}
            </CardTitle>
            <CardDescription>
              คุณบันทึกข้อมูล {selected.daysRecorded} จาก {selected.totalDays} วัน
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {selected.pillars.map((entry) => (
              <PillarSection key={entry.pillar} entry={entry} />
            ))}
          </CardContent>
        </Card>

        {comparison && <WeekComparisonCard comparison={comparison} />}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 shrink-0 text-primary" />
              จุดแข็งที่ควรรักษาไว้
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-foreground/90">{selected.strengths}</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-5 shrink-0 text-primary" />
              ข้อเสนอสำหรับสัปดาห์หน้า
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base text-foreground/90">{selected.nextWeek}</p>
            <Link href="/goals" className={buttonVariants({ className: "w-full" })}>
              ตั้งเป้าสัปดาห์หน้า
            </Link>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
