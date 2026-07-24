"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { StatusScreen } from "@/components/status-screen";
import { Button, buttonVariants } from "@/components/ui/button";

export default function RootError({ error, reset }: { error: Error; reset: () => void }) {
  // ไม่ log = พังบน production แล้วไม่เหลือร่องรอยให้ตามเลย
  useEffect(() => {
    console.error("Root error boundary:", error);
  }, [error]);

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
