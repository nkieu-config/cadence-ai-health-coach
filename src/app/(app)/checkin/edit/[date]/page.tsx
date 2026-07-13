import { notFound } from "next/navigation";
import { CheckinForm } from "@/components/checkin/checkin-form";
import { today } from "@/lib/checkins/date";
import { getCheckinByDate } from "@/lib/checkins/queries";
import { isCheckinDate, isWithinBackfillWindow } from "@/lib/checkins/validate";

export default async function EditCheckinPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;

  if (!isCheckinDate(date) || !isWithinBackfillWindow(date, today())) {
    notFound();
  }

  const existing = await getCheckinByDate(date);

  return <CheckinForm date={date} existing={existing} isBackfill />;
}
