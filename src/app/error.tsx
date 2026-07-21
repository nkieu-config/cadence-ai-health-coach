"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { StatusScreen } from "@/components/status-screen";
import { Button, buttonVariants } from "@/components/ui/button";

export default function RootError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-dvh">
      <StatusScreen
        icon={AlertTriangle}
        tone="error"
        title="ระบบขัดข้องชั่วคราว"
        description="ไม่ใช่ความผิดของคุณ ลองใหม่อีกครั้ง หรือกลับไปหน้าแรกก่อนก็ได้"
      >
        <Button onClick={reset}>ลองใหม่อีกครั้ง</Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          กลับหน้าแรก
        </Link>
      </StatusScreen>
    </main>
  );
}
