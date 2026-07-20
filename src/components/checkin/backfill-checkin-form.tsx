import type { Checkin } from "@/lib/domain";
import { CheckinForm } from "./checkin-form";

export function BackfillCheckinForm({
  date,
  existing,
}: {
  date: string;
  existing: Checkin | null;
}) {
  return <CheckinForm date={date} existing={existing} heading="บันทึกย้อนหลัง" />;
}
