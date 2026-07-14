"use client";

import { useRouter } from "next/navigation";
import { today } from "@/lib/checkins/date";
import type { Checkin } from "@/lib/patterns/types";
import { CheckinForm } from "./checkin-form";

export function TodayCheckinForm({ date, existing }: { date: string; existing: Checkin | null }) {
  const router = useRouter();

  function stillToday() {
    if (today() === date) return null;
    router.refresh();
    return "ข้ามไปวันใหม่แล้ว — กำลังเปลี่ยนเป็นบันทึกของวันนี้ กดบันทึกอีกครั้ง";
  }

  return <CheckinForm date={date} existing={existing} heading="เช็คอิน" beforeSave={stillToday} />;
}
