import { ArrowDown, ArrowRight, ArrowUp, Minus, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatWeekChangeDelta, formatWeekChangeValue } from "@/lib/ai-outputs/format";
import type { WeekChange, WeekComparison } from "@/lib/ai-outputs/reflection-facts";
import { formatShortThaiDate } from "@/lib/checkins/date";

function DeltaIcon({ delta }: { delta: number }) {
  if (delta > 0) return <ArrowUp className="size-3.5 shrink-0" />;
  if (delta < 0) return <ArrowDown className="size-3.5 shrink-0" />;
  return <Minus className="size-3.5 shrink-0" />;
}

function ChangeRow({ change }: { change: WeekChange }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2.5">
      <span className="text-sm text-muted-foreground">{change.label}</span>
      <span className="flex items-baseline gap-1.5 text-sm">
        <span className="text-muted-foreground tabular-nums">
          {formatWeekChangeValue(change.metric, change.previous)}
        </span>
        <ArrowRight className="size-3 shrink-0 self-center text-muted-foreground/60" />
        <span className="font-medium text-foreground tabular-nums">
          {formatWeekChangeValue(change.metric, change.current)} {change.unit}
        </span>
        <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground tabular-nums">
          <DeltaIcon delta={change.delta} />
          {formatWeekChangeDelta(change.metric, change.delta)}
        </span>
      </span>
    </div>
  );
}

export function WeekComparisonCard({ comparison }: { comparison: WeekComparison }) {
  return (
    <Card className="border-primary/20 bg-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-5 shrink-0 text-primary" />
          เทียบกับสัปดาห์ก่อน
        </CardTitle>
        <CardDescription>
          {formatShortThaiDate(comparison.previousStart)} –{" "}
          {formatShortThaiDate(comparison.previousEnd)} · บันทึกไว้{" "}
          {comparison.daysRecordedPrevious} วัน
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border/50">
          {comparison.changes.map((change) => (
            <ChangeRow key={change.metric} change={change} />
          ))}
        </div>
        <p className="pt-3 text-xs leading-relaxed text-muted-foreground">
          ตัวเลขเทียบเป็นค่าเฉลี่ยต่อวันและสัดส่วนของวันที่บันทึก
          จึงเทียบกันได้แม้สองสัปดาห์บันทึกไม่เท่ากัน
        </p>
      </CardContent>
    </Card>
  );
}
