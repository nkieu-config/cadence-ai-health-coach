import { CheckinForm } from "@/components/checkin/checkin-form";
import { today } from "@/lib/checkins/date";
import { getCheckinByDate } from "@/lib/checkins/queries";

export default async function CheckinPage() {
  const date = today();
  const existing = await getCheckinByDate(date);

  return <CheckinForm date={date} existing={existing} />;
}
