"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorNotice } from "@/components/ui/notice";
import { toggleGoalDay, updateGoalStatus } from "@/lib/goals/actions";
import { SITUATION_LABELS, type Goal, type GoalStatus } from "@/lib/goals/types";
import { weekDates } from "@/lib/goals/week";
import { formatThaiDate, today } from "@/lib/checkins/date";
import { toggleValue } from "@/components/ui/chip";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."];

function progressLine(count: number): string {
  if (count === 0) return "ยังไม่ได้ติ๊กวันไหน — เริ่มวันนี้ได้เลย";
  if (count === 7) return "ทำได้ครบทุกวันเลยสัปดาห์นี้";
  return `ทำได้แล้ว ${count} วันในสัปดาห์นี้`;
}

interface GoalProgressCardProps {
  goal: Goal;
}

export function GoalProgressCard({ goal }: GoalProgressCardProps) {
  const [progress, setProgress] = useState<string[]>(goal.progressDates ?? []);
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<GoalStatus | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const weekDaysList = weekDates(goal.weekStart);
  const todayStr = today();

  const handleToggleDay = (dateStr: string) => {
    setError(null);
    const previous = progress;
    setProgress((current) => toggleValue(current, dateStr));
    startTransition(async () => {
      const result = await toggleGoalDay(goal.id, dateStr);
      if ("error" in result) {
        setProgress(previous);
        setError(result.error);
      }
    });
  };

  const handleStatusChange = (newStatus: GoalStatus) => {
    setError(null);
    startTransition(async () => {
      const result = await updateGoalStatus(goal.id, newStatus);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setOutcome(newStatus);
    });
  };

  // ปิดสัปดาห์แล้วต้องมีจังหวะรับรู้ก่อนการ์ดหาย — ไม่งั้นกดเสร็จแล้วของหายเงียบ
  if (outcome) {
    const done = outcome === "done";
    return (
      <Card className={done ? "border-primary/40 bg-accent/10" : undefined}>
        <CardContent className="space-y-3 py-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {done ? <CheckCircle2 className="size-6" /> : <RotateCcw className="size-6" />}
          </div>
          <p className="font-medium text-foreground">
            {done ? "ทำเป้านี้สำเร็จแล้ว" : "เก็บเป้านี้ไว้ลองใหม่"}
          </p>
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">
            {done
              ? `${goal.title} · ${progressLine(progress.length)}`
              : "สัปดาห์ที่ยากเป็นพิเศษก็มี — กลับมาลองใหม่ตอนพร้อมได้เสมอ"}
          </p>
          <Button variant="outline" className="min-h-11" onClick={() => router.refresh()}>
            เรียบร้อย
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{goal.title}</CardTitle>
        <CardDescription className="text-xs">
          บริบท: {goal.situation ? SITUATION_LABELS[goal.situation] : "เป้าหมายทั่วไป"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && <ErrorNotice>{error}</ErrorNotice>}

        <div className="space-y-2">
          <p className="text-sm font-medium">ความคืบหน้าสัปดาห์นี้</p>
          <div className="grid grid-cols-7 gap-2">
            {weekDaysList.map((dateStr, index) => {
              const isChecked = progress.includes(dateStr);
              const isFuture = dateStr > todayStr;
              const displayNum = dateStr.split("-")[2] || String(index + 1);

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => handleToggleDay(dateStr)}
                  disabled={isPending || isFuture}
                  aria-label={`วัน${DAY_LABELS[index].replace(".", "")} ${formatThaiDate(dateStr)}`}
                  aria-pressed={isChecked}
                  className={cn(
                    "flex min-h-11 flex-col items-center justify-center rounded-md border text-xs font-medium transition-all outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95",
                    isChecked
                      ? "border-primary bg-primary font-semibold text-primary-foreground"
                      : isFuture
                        ? "border-dashed border-border text-muted-foreground"
                        : "border-border bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <span>{DAY_LABELS[index]}</span>
                  <span className="font-mono text-xs">{displayNum}</span>
                </button>
              );
            })}
          </div>
          <p className="pt-1 text-xs text-muted-foreground">{progressLine(progress.length)}</p>
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <Button
            variant="ghost"
            size="sm"
            className="min-h-11 px-2 text-xs text-muted-foreground"
            onClick={() => handleStatusChange("dropped")}
            disabled={isPending}
          >
            สัปดาห์นี้ไม่เหมาะ ไว้ลองใหม่
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="min-h-11 gap-1 px-3 text-xs text-primary"
            onClick={() => handleStatusChange("done")}
            disabled={isPending}
          >
            <CheckCircle2 className="size-4" />
            ทำเป้านี้สำเร็จ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
