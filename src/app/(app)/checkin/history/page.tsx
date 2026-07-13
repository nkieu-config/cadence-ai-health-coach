import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CheckinHistory } from "@/components/checkin/checkin-history";
import { buttonVariants } from "@/components/ui/button";
import { getCheckins } from "@/lib/checkins/queries";
import { MAX_BACKFILL_DAYS } from "@/lib/checkins/validate";

export default async function CheckinHistoryPage() {
  const checkins = await getCheckins(MAX_BACKFILL_DAYS);
  const newestFirst = [...checkins].reverse();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">บันทึกย้อนหลัง</h1>
        <Link href="/checkin" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <ChevronLeft className="size-4" />
          เช็คอิน
        </Link>
      </div>

      <p className="text-sm text-muted-foreground">
        แก้ไขหรือลบบันทึกของตัวเองได้ทุกรายการ (ย้อนหลังได้ {MAX_BACKFILL_DAYS} วัน)
      </p>

      <CheckinHistory checkins={newestFirst} />
    </div>
  );
}
