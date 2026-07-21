import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, History } from "lucide-react";
import { CheckinHistory } from "@/components/checkin/checkin-history";
import { PageContainer } from "@/components/page-container";
import { buttonVariants } from "@/components/ui/button";
import { getCheckins } from "@/lib/checkins/queries";
import { MAX_BACKFILL_DAYS } from "@/lib/checkins/validate";

export const metadata: Metadata = { title: "บันทึกย้อนหลัง" };

export default async function CheckinHistoryPage() {
  const checkins = await getCheckins(MAX_BACKFILL_DAYS);
  const newestFirst = [...checkins].reverse();

  return (
    <PageContainer width="content" className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-semibold lg:text-2xl">
          <History className="size-6 shrink-0 text-primary" />
          บันทึกย้อนหลัง
        </h1>
        <Link href="/checkin" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <ChevronLeft className="size-4" />
          เช็คอิน
        </Link>
      </div>

      <p className="text-sm text-muted-foreground">
        แก้ไขหรือลบบันทึกของตัวเองได้ทุกรายการ (ย้อนหลังได้ {MAX_BACKFILL_DAYS} วัน)
      </p>

      <CheckinHistory checkins={newestFirst} />
    </PageContainer>
  );
}
