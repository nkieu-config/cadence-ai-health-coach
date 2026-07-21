import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
    <PageContainer width="content">
      <h1 className="sr-only">บันทึกย้อนหลัง</h1>
      <BackfillCheckinForm date={date} existing={existing} />
    </PageContainer>
  );
}
