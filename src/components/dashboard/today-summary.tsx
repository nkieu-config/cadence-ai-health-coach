import Link from "next/link";
import { ChevronRight, Activity, Moon, Utensils } from "lucide-react";
import type { Checkin } from "@/lib/domain";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatThaiDate } from "@/lib/checkins/date";
import { buildCheckinSummary } from "@/lib/checkins/summary";
import { cn } from "@/lib/utils";

function StatTile({
  color,
  label,
  valueText,
  icon: Icon,
}: {
  color: string;
  label: string;
  valueText: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex size-11 items-center justify-center rounded-full bg-muted/60"
        style={{ color }}
      >
        <Icon className="size-5" />
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <p className="text-sm font-bold">{valueText}</p>
      </div>
    </div>
  );
}

export function TodaySummary({ checkin, date }: { checkin: Checkin | null; date: string }) {
  const energyBadge = (() => {
    if (!checkin) return { label: "ยังไม่ได้บันทึก", variant: "outline" as const };
    const energyMap = {
      low: { label: "พลังงานต่ำ", variant: "secondary" as const },
      medium: { label: "พลังงานปานกลาง", variant: "secondary" as const },
      high: { label: "พลังงานสูง", variant: "secondary" as const },
    };
    return energyMap[checkin.energyLevel];
  })();

  const pillars = [
    {
      color: "var(--chart-2)",
      label: "การกิน",
      text: checkin ? `${checkin.mealsCount} มื้อ` : "--",
      icon: Utensils,
    },
    {
      color: "var(--chart-1)",
      label: "การนอน",
      text: checkin ? `${checkin.sleepHours} ชม.` : "--",
      icon: Moon,
    },
    {
      color: "var(--chart-3)",
      label: "เคลื่อนไหว",
      text: checkin ? `${checkin.movementMinutes} นาที` : "--",
      icon: Activity,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-4 flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardDescription>{formatThaiDate(date)}</CardDescription>
          <CardTitle className="text-lg">สรุปวันนี้</CardTitle>
        </div>
        <Badge variant={energyBadge.variant}>{energyBadge.label}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 py-2 bg-muted/20 dark:bg-muted/10 rounded-xl">
          {pillars.map((p) => (
            <StatTile
              key={p.label}
              color={p.color}
              label={p.label}
              valueText={p.text}
              icon={p.icon}
            />
          ))}
        </div>
        <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground ">
          {checkin
            ? buildCheckinSummary(checkin).encouragement
            : "คุณยังไม่ได้บันทึกพฤติกรรมสุขภาพของวันนี้ แวะมาเช็คอินสักนิดเพื่อดูภาพรวมของวันนี้กันนะ"}
        </div>
        <div>
          <Link
            href="/checkin"
            className={cn(
              buttonVariants({
                variant: checkin ? "outline" : "default",
                size: "sm",
                className: "w-full",
              })
            )}
          >
            {checkin ? "แก้ไขบันทึกวันนี้" : "บันทึกตอนนี้"}
            {!checkin && <ChevronRight className="size-4" />}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
