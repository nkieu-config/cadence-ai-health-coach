import { notFound } from "next/navigation";
import { BackfillCheckinForm } from "@/components/checkin/backfill-checkin-form";
import { PageContainer } from "@/components/page-container";
import { today } from "@/lib/checkins/date";
import { getCheckinByDate } from "@/lib/checkins/queries";
import { isCheckinDate, isWithinBackfillWindow } from "@/lib/checkins/validate";

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
