import Link from "next/link";
import { ChevronRight, Activity, Moon, Utensils } from "lucide-react";
import type { Checkin } from "@/lib/domain";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatThaiDate } from "@/lib/checkins/date";
import { buildCheckinSummary } from "@/lib/checkins/summary";
import { cn } from "@/lib/utils";

function ProgressCircle({
  value,
  max,
  color,
  label,
  valueText,
  icon: Icon,
}: {
  value: number;
  max: number;
  color: string;
  label: string;
  valueText: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const strokeDashoffset = 150.8 - (percentage / 100) * 150.8;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <svg className="absolute size-full -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="24"
            className="stroke-muted/40 dark:stroke-muted/20"
            strokeWidth="3.5"
            fill="none"
          />
          <circle
            cx="32"
            cy="32"
            r="24"
            className="transition-all duration-500"
            style={{ stroke: color }}
            strokeWidth="3.5"
            fill="none"
            strokeDasharray="150.8"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <Icon className="size-4 opacity-80" />
      </div>
      <div className="text-center">
        <p className="text-[10px] font-semibold text-muted-foreground">{label}</p>
        <p className="text-xs font-bold">{valueText}</p>
      </div>
    </div>
  );
}

export function TodaySummary({ checkin, date }: { checkin: Checkin | null; date: string }) {
  const energyBadge = (() => {
    if (!checkin) return { label: "ยังไม่ได้บันทึก", variant: "outline" as const };
    const energyMap = {
      low: { label: "พลังงานต่ำ", variant: "destructive" as const },
      medium: { label: "พลังงานปานกลาง", variant: "secondary" as const },
      high: { label: "พลังงานสูง", variant: "default" as const },
    };
    return energyMap[checkin.energyLevel];
  })();

  const pillars = [
    {
      val: checkin?.mealsCount ?? 0,
      max: 3,
      color: "var(--chart-2)",
      label: "การกิน",
      text: checkin ? `${checkin.mealsCount}/3 มื้อ` : "--",
      icon: Utensils,
    },
    {
      val: checkin?.sleepHours ?? 0,
      max: 8,
      color: "var(--chart-1)",
      label: "การนอน",
      text: checkin ? `${checkin.sleepHours} ชม.` : "--",
      icon: Moon,
    },
    {
      val: checkin?.movementMinutes ?? 0,
      max: 30,
      color: "var(--chart-3)",
      label: "เคลื่อนไหว",
      text: checkin ? `${checkin.movementMinutes} นาที` : "--",
      icon: Activity,
    },
  ];

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="pb-4 flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardDescription>{formatThaiDate(date)}</CardDescription>
          <CardTitle className="text-lg">สรุปวันนี้</CardTitle>
        </div>
        <Badge variant={energyBadge.variant}>{energyBadge.label}</Badge>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-3 gap-2 py-2 bg-muted/20 dark:bg-muted/10 rounded-xl">
          {pillars.map((p) => (
            <ProgressCircle
              key={p.label}
              value={p.val}
              max={p.max}
              color={p.color}
              label={p.label}
              valueText={p.text}
              icon={p.icon}
            />
          ))}
        </div>
        <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground leading-relaxed">
          {checkin
            ? buildCheckinSummary(checkin).encouragement
            : "คุณยังไม่ได้บันทึกพฤติกรรมสุขภาพของวันนี้ แวะมาเช็คอินสักนิดเพื่อติดตามเป้าหมายประจำวันกันนะ"}
        </div>
        <div className="pt-2">
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
