import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarPlus } from "lucide-react";
import { BackfillCheckinForm } from "@/components/checkin/backfill-checkin-form";
import { PageContainer } from "@/components/page-container";
import { formatThaiDate, today } from "@/lib/checkins/date";
import { getCheckinByDate } from "@/lib/checkins/queries";
import { isCheckinDate, isWithinBackfillWindow } from "@/lib/checkins/validate";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  return {
    title: isCheckinDate(date) ? `บันทึกย้อนหลัง ${formatThaiDate(date)}` : "บันทึกย้อนหลัง",
  };
}

export default async function EditCheckinPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;

  if (!isCheckinDate(date) || !isWithinBackfillWindow(date, today())) {
    notFound();
  }

  const existing = await getCheckinByDate(date);

  return (
    <PageContainer width="content" className="space-y-6">
      <div className="space-y-2">
        <h1 className="flex items-center gap-2 text-xl font-semibold lg:text-2xl">
          <CalendarPlus className="size-6 shrink-0 text-primary" />
          บันทึกย้อนหลัง
        </h1>
        <p className="text-sm text-muted-foreground">
          {formatThaiDate(date)}
          {existing ? " · กำลังแก้ไขบันทึกเดิม" : " · ยังไม่เคยบันทึกวันนั้น"}
        </p>
      </div>
      <BackfillCheckinForm date={date} existing={existing} />
    </PageContainer>
  );
}
