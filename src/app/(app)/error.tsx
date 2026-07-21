"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { StatusScreen } from "@/components/status-screen";
import { Button, buttonVariants } from "@/components/ui/button";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <StatusScreen
      icon={AlertTriangle}
      tone="error"
      title="ระบบขัดข้องชั่วคราว"
      description="ไม่ใช่ความผิดของคุณ และบันทึกที่เคยบันทึกไว้ยังอยู่ครบ ลองใหม่อีกครั้งได้เลย"
    >
      <Button onClick={reset}>ลองใหม่อีกครั้ง</Button>
      <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
        ไปหน้าภาพรวม
      </Link>
    </StatusScreen>
  );
}
