import Link from "next/link";
import { Compass } from "lucide-react";
import { StatusScreen } from "@/components/status-screen";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-dvh">
      <StatusScreen
        icon={Compass}
        title="ไม่พบหน้าที่ต้องการ"
        description="ลิงก์นี้อาจเก่าไปแล้ว หรือพิมพ์ที่อยู่ไม่ตรง ลองกลับไปเริ่มใหม่จากหน้าแรกได้เลย"
      >
        <Link href="/" className={buttonVariants()}>
          กลับหน้าแรก
        </Link>
      </StatusScreen>
    </main>
  );
}
