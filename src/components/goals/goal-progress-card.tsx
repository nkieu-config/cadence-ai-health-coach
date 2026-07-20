"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toggleGoalDay, updateGoalStatus } from "@/lib/goals/actions";
import {
  GOAL_STATUS_LABELS,
  SITUATION_LABELS,
  type Goal,
  type GoalStatus,
} from "@/lib/goals/types";
import { weekDates } from "@/lib/goals/week";
import { today } from "@/lib/checkins/date";

interface GoalProgressCardProps {
  goal: Goal;
}

export function GoalProgressCard({ goal }: GoalProgressCardProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const currentProgress = goal.progressDates || [];
  const weekDaysList = weekDates(goal.weekStart);
  const dayLabels = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."];
  const todayStr = today();

  const handleToggleDay = (dateStr: string) => {
    setError(null);
    startTransition(async () => {
      const result = await toggleGoalDay(goal.id, dateStr);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.refresh();
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
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-foreground">{goal.title}</CardTitle>
            <CardDescription className="text-xs">
              บริบท: {goal.situation ? SITUATION_LABELS[goal.situation] : "เป้าหมายทั่วไป"}
            </CardDescription>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="min-h-11 px-3 text-xs gap-1 text-primary border-primary/20 hover:bg-accent"
              onClick={() => handleStatusChange("done")}
              disabled={isPending}
            >
              <CheckCircle2 className="size-4" />
              สำเร็จ
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="min-h-11 px-3 text-xs gap-1 text-destructive border-destructive/20 hover:bg-destructive/5"
              onClick={() => handleStatusChange("dropped")}
              disabled={isPending}
            >
              <XCircle className="size-4" />
              {GOAL_STATUS_LABELS.dropped}
            </Button>
          </div>
        </div>
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
          <p className="text-sm font-medium text-foreground">ความคืบหน้าสัปดาห์นี้</p>
          <div className="grid grid-cols-7 gap-2">
            {weekDaysList.map((dateStr, index) => {
              const isChecked = currentProgress.includes(dateStr);
              const isFuture = dateStr > todayStr;
              const displayNum = dateStr.split("-")[2] || String(index + 1);

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => handleToggleDay(dateStr)}
                  disabled={isPending || isFuture}
                  aria-label={dateStr}
                  className={`flex min-h-11 flex-col items-center justify-center rounded-md border text-xs font-medium transition-all focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 ${
                    isChecked
                      ? "border-primary bg-primary text-primary-foreground font-semibold"
                      : isFuture
                        ? "cursor-not-allowed border-border bg-muted text-muted-foreground opacity-50"
                        : "border-border bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <span>{dayLabels[index]}</span>
                  <span className="text-[10px] opacity-70 font-mono">{displayNum}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            สะสมความสำเร็จ: {currentProgress.length} / 7 วัน
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm flex items-center justify-between">
          <span className="font-medium text-muted-foreground">สถานะเป้าหมาย:</span>
          <span className="font-mono font-medium bg-background px-2 py-0.5 rounded border text-foreground">
            {GOAL_STATUS_LABELS[goal.status]}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
