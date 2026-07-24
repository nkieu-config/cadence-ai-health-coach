import type { BedTimeBucket, Checkin, Disruptor, FirstMealTime } from "@/lib/domain";
import { daysAgo, formatThaiDate } from "@/lib/checkins/date";
import { DISRUPTOR_LABELS } from "@/lib/checkins/labels";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DAYS_SHOWN = 7;

const AXIS_START_HOUR = 21;
const AXIS_HOURS = 17;

const TICKS = [
  { hour: 21, label: "21:00" },
  { hour: 24, label: "00:00" },
  { hour: 27, label: "03:00" },
  { hour: 30, label: "06:00" },
  { hour: 33, label: "09:00" },
  { hour: 36, label: "12:00" },
];

const BED_TIME_HOUR: Record<BedTimeBucket, number> = {
  before_23: 22.5,
  "23_00": 23.5,
  "00_01": 24.5,
  "01_02": 25.5,
  after_02: 26.5,
};

const FIRST_MEAL_HOUR: Record<FirstMealTime, number> = {
  before_9: 32,
  "9_12": 34.5,
  after_12: 37,
};

const WEEKDAY_LABELS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

function percentOf(hour: number): number {
  return ((hour - AXIS_START_HOUR) / AXIS_HOURS) * 100;
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function weekdayLabel(isoDate: string): string {
  return WEEKDAY_LABELS[new Date(`${isoDate}T00:00:00Z`).getUTCDay()];
}

function dayOfMonth(isoDate: string): string {
  return String(Number(isoDate.slice(8, 10)));
}

function recentDates(): string[] {
  return Array.from({ length: DAYS_SHOWN }, (_, index) => daysAgo(DAYS_SHOWN - 1 - index));
}

function disruptorSummary(disruptors: Disruptor[]): string | null {
  const named = (disruptors ?? [])
    .filter((disruptor) => disruptor && disruptor !== "none")
    .map((disruptor) => DISRUPTOR_LABELS[disruptor])
    .filter(Boolean);
  return named.length > 0 ? named.join(" · ") : null;
}

function SleepBar({ checkin }: { checkin: Checkin }) {
  const start = BED_TIME_HOUR[checkin.bedTimeBucket];
  const left = clampPercent(percentOf(start));
  const right = clampPercent(percentOf(start + checkin.sleepHours));

  return (
    <div
      className="absolute inset-y-1.5 rounded-full bg-chart-1"
      style={{ left: `${left}%`, width: `${Math.max(right - left, 1.5)}%` }}
    />
  );
}

function FirstMealDot({ firstMealTime }: { firstMealTime: FirstMealTime }) {
  return (
    <div
      className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card bg-chart-2"
      style={{ left: `${clampPercent(percentOf(FIRST_MEAL_HOUR[firstMealTime]))}%` }}
    />
  );
}

function DayRow({ date, checkin }: { date: string; checkin: Checkin | undefined }) {
  const disruptors = checkin ? disruptorSummary(checkin.disruptors) : null;
  const label = `${weekdayLabel(date)} ${dayOfMonth(date)}`;

  if (!checkin) {
    return (
      <div className="flex items-center gap-3">
        <span className="w-12 shrink-0 text-xs text-muted-foreground">{label}</span>
        <div className="relative h-8 flex-1 rounded-lg border border-dashed border-border" />
        <span className="w-14 shrink-0 text-right text-xs text-muted-foreground">ไม่ได้บันทึก</span>
      </div>
    );
  }

  const movementWidth = Math.min(100, (checkin.movementMinutes / 45) * 100);

  return (
    <div className="flex items-center gap-3">
      <span className="w-12 shrink-0 text-xs font-medium">{label}</span>

      <div
        className={cn(
          "relative h-8 flex-1 overflow-hidden rounded-lg",
          disruptors ? "bg-chart-5/22 ring-1 ring-chart-5/45" : "bg-muted/60"
        )}
        title={
          disruptors
            ? `${formatThaiDate(date)} · ${disruptors}`
            : `${formatThaiDate(date)} · ไม่มีปัจจัยรบกวน`
        }
      >
        <SleepBar checkin={checkin} />
        {checkin.firstMealTime && <FirstMealDot firstMealTime={checkin.firstMealTime} />}
      </div>

      <div className="hidden w-14 shrink-0 items-center gap-1.5 lg:flex">
        <div className="h-1.5 flex-1 rounded-full bg-muted">
          <div className="h-full rounded-full bg-chart-3" style={{ width: `${movementWidth}%` }} />
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          {checkin.movementMinutes}
        </span>
      </div>
      <span className="w-14 shrink-0 text-right font-mono text-xs text-muted-foreground lg:hidden">
        {checkin.movementMinutes} น.
      </span>
    </div>
  );
}

function LegendItem({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
      {children}
    </span>
  );
}

export function DayLines({ checkins }: { checkins: Checkin[] }) {
  const dates = recentDates();
  const byDate = new Map(checkins.map((checkin) => [checkin.checkinDate, checkin]));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">คืนสู่เช้า — 7 วันล่าสุด</CardTitle>
        <CardDescription>
          แต่ละแถวคือหนึ่งวัน เรียงตามเวลาจริงตั้งแต่เข้านอนจนถึงมื้อแรก ·
          วันที่มีปัจจัยรบกวนจะมีแถบสีคลุมทั้งแถว
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-12 shrink-0" />
          <div className="relative h-4 flex-1">
            {TICKS.map((tick) => (
              <span
                key={tick.hour}
                className="absolute -translate-x-1/2 text-[11px] text-muted-foreground"
                style={{ left: `${clampPercent(percentOf(tick.hour))}%` }}
              >
                {tick.label}
              </span>
            ))}
          </div>
          <span className="w-14 shrink-0 text-right text-xs text-muted-foreground">ขยับ</span>
        </div>

        <div className="space-y-1.5">
          {dates.map((date) => (
            <DayRow key={date} date={date} checkin={byDate.get(date)} />
          ))}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 border-t pt-3 text-xs text-muted-foreground">
          <LegendItem color="var(--chart-1)">ช่วงที่นอน</LegendItem>
          <LegendItem color="var(--chart-2)">มื้อแรกของวัน</LegendItem>
          <LegendItem color="var(--chart-3)">นาทีที่ขยับ (ไม่ได้อ้างเวลา)</LegendItem>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-chart-5/40 ring-1 ring-chart-5/60" />
            วันที่มีปัจจัยรบกวน
          </span>
        </div>

        <p className="pt-2 text-xs text-muted-foreground">
          เช็คอินบันทึกเวลาเป็นช่วง (เช่น เข้านอน 23:00–00:00) แท่งจึงวางตามกลางช่วงที่เลือกไว้
          ไม่ใช่เวลานาทีจริง
        </p>
      </CardContent>
    </Card>
  );
}
