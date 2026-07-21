import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/page-container";
import { CalendarPlus, History } from "lucide-react";
import { TodayCheckinForm } from "@/components/checkin/today-checkin-form";
import { buttonVariants } from "@/components/ui/button";
import { daysAgo, formatThaiDate, today } from "@/lib/checkins/date";
import { getCheckins } from "@/lib/checkins/queries";
import { MAX_BACKFILL_DAYS } from "@/lib/checkins/validate";

export const metadata: Metadata = { title: "เช็คอินประจำวัน" };

export default async function CheckinPage() {
  const date = today();
  const yesterday = daysAgo(1);

  const recent = await getCheckins(MAX_BACKFILL_DAYS);
  const existing = recent.find((checkin) => checkin.checkinDate === date) ?? null;
  const hasEarlierCheckin = recent.some((checkin) => checkin.checkinDate !== date);
  const missedYesterday = !recent.some((checkin) => checkin.checkinDate === yesterday);

  const nudge =
    hasEarlierCheckin && missedYesterday ? (
      <Link
        href={`/checkin/edit/${yesterday}`}
        className="flex items-center gap-3 rounded-lg border border-dashed p-3 text-sm transition-colors hover:bg-muted"
      >
        <CalendarPlus className="size-4 shrink-0 text-primary" />
        <span>
          ยังไม่ได้บันทึกของ{formatThaiDate(yesterday)}
          <span className="block text-xs text-muted-foreground">
            ลืมกรอกก่อนนอนก็ย้อนกลับไปบันทึกได้
          </span>
        </span>
      </Link>
    ) : null;

  const footer =
    recent.length > 0 ? (
      <Link
        href="/checkin/history"
        className={buttonVariants({ variant: "ghost", className: "w-full" })}
      >
        <History className="size-4" />
        ดูบันทึกย้อนหลัง
      </Link>
    ) : null;

  return (
    <PageContainer width="content">
      <h1 className="sr-only">เช็คอินประจำวัน</h1>
      <TodayCheckinForm date={date} existing={existing} nudge={nudge} footer={footer} />
    </PageContainer>
  );
}
