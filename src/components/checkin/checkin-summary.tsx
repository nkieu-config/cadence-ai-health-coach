import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";
import { formatThaiDate } from "@/lib/checkins/date";
import { buildCheckinSummary } from "@/lib/checkins/summary";
import type { Checkin } from "@/lib/patterns/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function CheckinSummary({
  checkin,
  onEdit,
}: {
  checkin: Checkin;
  onEdit: () => void;
}) {
  const { lines, encouragement } = buildCheckinSummary(checkin);

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <CheckCircle2 className="size-10 text-primary" />
        <CardTitle>บันทึกแล้ว</CardTitle>
        <CardDescription>{formatThaiDate(checkin.checkinDate)}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-1.5 rounded-lg bg-muted/40 p-4 text-sm">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        <p className="flex gap-2 text-sm text-muted-foreground">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>{encouragement}</span>
        </p>

        <div className="space-y-2 pt-1">
          <Link href="/dashboard" className={buttonVariants({ className: "w-full" })}>
            ดูภาพรวม
          </Link>
          <Button variant="outline" className="w-full" onClick={onEdit}>
            แก้ไขบันทึกนี้
          </Button>
          <Link
            href="/checkin/history"
            className={buttonVariants({ variant: "ghost", className: "w-full" })}
          >
            ดูบันทึกย้อนหลัง
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
