"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toggleGoalDay, updateGoalStatus } from "@/lib/goals/actions";
import { SITUATION_LABELS, type Goal, type GoalStatus } from "@/lib/goals/types";
import { weekDates } from "@/lib/goals/week";
import { today } from "@/lib/checkins/date";
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
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{goal.title}</CardTitle>
        <CardDescription className="text-xs">
          บริบท: {goal.situation ? SITUATION_LABELS[goal.situation] : "เป้าหมายทั่วไป"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

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
                  aria-label={dateStr}
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
                  <span className="font-mono text-xs opacity-70">{displayNum}</span>
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
