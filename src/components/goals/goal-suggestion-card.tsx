"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, RotateCcw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ErrorNotice, GentleNotice } from "@/components/ui/notice";
import { recommendGoals, acceptGoal } from "@/lib/goals/actions";
import {
  GOAL_LIMIT_NOTICE,
  GOAL_TITLE_MAX_LENGTH,
  MAX_ACTIVE_GOALS,
  SITUATION_LABELS,
  type GoalSuggestion,
  type Goal,
} from "@/lib/goals/types";
import { cn } from "@/lib/utils";

interface GoalSuggestionCardProps {
  initialGoals: Goal[];
}

export function GoalSuggestionCard({ initialGoals }: GoalSuggestionCardProps) {
  const [suggestions, setSuggestions] = useState<GoalSuggestion[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [customText, setCustomText] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const atLimit = initialGoals.length >= MAX_ACTIVE_GOALS;

  const handleRequestGoals = () => {
    setNotice(null);
    setError(null);
    startTransition(async () => {
      const result = await recommendGoals();
      if ("notice" in result) {
        setNotice(result.notice);
        return;
      }
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setSuggestions(result.suggestions);
      setCustomText(result.suggestions[0]?.title ?? "");
      setSelectedIndex(0);
      setEditMode(false);
    });
  };

  const handleAccept = () => {
    setNotice(null);
    setError(null);
    startTransition(async () => {
      const result = await acceptGoal(customText, suggestions[selectedIndex].situation);
      if ("notice" in result) {
        setNotice(result.notice);
        return;
      }
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setSuggestions([]);
      router.refresh();
    });
  };

  const feedback = (
    <>
      {notice && <GentleNotice>{notice}</GentleNotice>}
      {error && <ErrorNotice>{error}</ErrorNotice>}
    </>
  );

  // ยังไม่มีเป้าหมาย และยังไม่ได้กดขอคำแนะนำ
  if (initialGoals.length === 0 && suggestions.length === 0) {
    return (
      <Card className="border-dashed border-primary/30 bg-accent/5">
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
          <div className="rounded-full bg-primary/10 p-3">
            <Zap className="size-8 text-primary" />
          </div>
          <div className="max-w-sm space-y-1">
            <h2 className="text-lg font-semibold text-foreground">ยังไม่มีเป้าหมายสัปดาห์นี้</h2>
            <p className="text-sm text-muted-foreground">
              ขอคำแนะนำแผนงานประจำสัปดาห์จาก AI เพื่อเริ่มพัฒนาสุขภาพของคุณ
            </p>
          </div>
          <div className="w-full max-w-sm space-y-2">
            <Button onClick={handleRequestGoals} disabled={isPending} className="min-h-11 px-6">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> กำลังประมวลผล…
                </>
              ) : (
                "ขอคำแนะนำเป้าหมาย"
              )}
            </Button>
            {isPending && (
              <p className="text-center text-xs text-muted-foreground">ใช้เวลาราว 10 วินาที</p>
            )}
            {feedback}
          </div>
        </CardContent>
      </Card>
    );
  }

  // มีเป้าหมายอยู่แล้ว — ครบโควตาแล้วบอกตรง ๆ ก่อน ไม่ปล่อยให้รอ AI แล้วค่อยปฏิเสธ
  if (initialGoals.length > 0 && suggestions.length === 0) {
    if (atLimit) {
      return <GentleNotice>{GOAL_LIMIT_NOTICE}</GentleNotice>;
    }

    return (
      <div className="space-y-2">
        <Button
          variant="outline"
          onClick={handleRequestGoals}
          disabled={isPending}
          className="min-h-11 w-full text-foreground"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> กำลังประมวลผลคำแนะนำ…
            </>
          ) : (
            "ขอคำแนะนำเป้าหมายเพิ่มเติม"
          )}
        </Button>
        {isPending && (
          <p className="text-center text-xs text-muted-foreground">ใช้เวลาราว 10 วินาที</p>
        )}
        {feedback}
      </div>
    );
  }

  const current = suggestions[selectedIndex];

  return (
    <Card className="border-primary/20 bg-accent/10">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-semibold">คำแนะนำเป้าหมายสัปดาห์นี้</CardTitle>
        <CardDescription>เลือกข้อเสนอหรือแก้ไขข้อความให้เหมาะสมตามพฤติกรรมคุณ</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedback}

        <div className="grid gap-2">
          {suggestions.map((suggestion, index) => {
            const isSelected = selectedIndex === index;
            return (
              <button
                key={suggestion.situation}
                type="button"
                aria-pressed={isSelected}
                disabled={isPending}
                onClick={() => {
                  setSelectedIndex(index);
                  setCustomText(suggestion.title);
                  setEditMode(false);
                }}
                className={cn(
                  "min-h-11 rounded-lg border p-3 text-left text-sm transition-all focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  isSelected
                    ? "border-primary bg-primary/5 font-medium"
                    : "border-border hover:bg-muted/40"
                )}
              >
                <span className="block">{suggestion.title}</span>
                <span className="mt-1 block text-xs font-normal text-muted-foreground">
                  {SITUATION_LABELS[suggestion.situation]}
                </span>
              </button>
            );
          })}
        </div>

        {!editMode ? (
          <div className="space-y-2">
            <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm font-medium">
              {customText}
            </div>
            <Button
              variant="outline"
              onClick={() => setEditMode(true)}
              disabled={isPending}
              className="min-h-11 w-full"
            >
              แก้ไขข้อความ
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Input
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              maxLength={GOAL_TITLE_MAX_LENGTH}
              placeholder="พิมพ์เป้าหมายของคุณเอง…"
              disabled={isPending}
              className="min-h-11"
              autoComplete="off"
              aria-label={`ปรับข้อความเป้าหมาย · สถานการณ์ ${SITUATION_LABELS[current.situation]}`}
            />
            <div className="text-right text-xs text-muted-foreground">
              {customText.length}/{GOAL_TITLE_MAX_LENGTH} ตัวอักษร
            </div>
            <Button
              variant="outline"
              onClick={() => setEditMode(false)}
              disabled={isPending}
              className="min-h-11 w-full"
            >
              เสร็จแก้ไข
            </Button>
          </div>
        )}

        <div className="grid gap-2 pt-2 lg:grid-cols-2">
          <Button
            variant="outline"
            onClick={handleRequestGoals}
            disabled={isPending}
            className="min-h-11 text-foreground"
          >
            <RotateCcw className="mr-2 size-4" /> ขอใหม่
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!customText.trim() || isPending}
            className="min-h-11"
          >
            <Check className="mr-2 size-4" /> รับเป้าหมาย
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
