import Link from "next/link";
import { Compass } from "lucide-react";
import { StatusScreen } from "@/components/status-screen";
import { buttonVariants } from "@/components/ui/button";

export default function AppNotFound() {
  return (
    <StatusScreen
      icon={Compass}
      title="ไม่พบบันทึกที่ต้องการ"
      description="บันทึกนี้อาจถูกลบไปแล้ว หรืออยู่นอกช่วง 30 วันที่ย้อนกลับไปแก้ไขได้"
    >
      <Link href="/checkin/history" className={buttonVariants()}>
        ดูบันทึกย้อนหลัง
      </Link>
      <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
        ไปหน้าภาพรวม
      </Link>
    </StatusScreen>
  );
}
