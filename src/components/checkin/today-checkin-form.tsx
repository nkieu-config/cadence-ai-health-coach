"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { formatThaiDate, today } from "@/lib/checkins/date";
import type { Checkin } from "@/lib/domain";
import { CheckinForm } from "./checkin-form";

export function TodayCheckinForm({
  date,
  existing,
  nudge,
  footer,
}: {
  date: string;
  existing: Checkin | null;
  nudge?: ReactNode;
  footer?: ReactNode;
}) {
  const router = useRouter();

  // ข้ามเที่ยงคืนระหว่างกรอก คำตอบที่กรอกไว้เป็นของวันที่เปิดหน้ามา ไม่ใช่ของวันใหม่
  // จึงพาไปบันทึกเป็นวันเดิม แทนการย้ายคำตอบมาทับวันนี้
  function stillToday() {
    if (today() === date) return null;
    router.push(`/checkin/edit/${date}`);
    return `เลยเที่ยงคืนมาแล้ว — กำลังพาไปบันทึกเป็นของ${formatThaiDate(date)} ตามที่คุณกรอกไว้`;
  }

  return (
    <CheckinForm
      date={date}
      existing={existing}
      heading="เช็คอิน"
      openWith={existing}
      beforeSave={stillToday}
      nudge={nudge}
      footer={footer}
    />
  );
}
