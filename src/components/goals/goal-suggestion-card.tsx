"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Loader2, RotateCcw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { recommendGoals, acceptGoal } from "@/lib/goals/actions";
import {
  GOAL_TITLE_MAX_LENGTH,
  SITUATION_LABELS,
  type GoalSuggestion,
  type Goal,
} from "@/lib/goals/types";

interface GoalSuggestionCardProps {
  initialGoals: Goal[];
}

export function GoalSuggestionCard({ initialGoals }: GoalSuggestionCardProps) {
  const [suggestions, setSuggestions] = useState<GoalSuggestion[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [customText, setCustomText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRequestGoals = () => {
    setError(null);
    startTransition(async () => {
      const result = await recommendGoals();
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
    setError(null);
    startTransition(async () => {
      const result = await acceptGoal(customText, suggestions[selectedIndex].situation);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setSuggestions([]);
      router.refresh();
    });
  };

  // Flow 1: ยังไม่มีเป้าหมาย และยังไม่ได้กดขอคำแนะนำ (Empty State รวมที่นี่ตามกติกา)
  if (initialGoals.length === 0 && suggestions.length === 0) {
    return (
      <Card className="border-dashed border-primary/30 bg-accent/5">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Zap className="size-8 text-primary" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-lg font-semibold text-foreground">ยังไม่มีเป้าหมายสัปดาห์นี้</h3>
            <p className="text-sm text-muted-foreground">
              ขอคำแนะนำแผนงานประจำสัปดาห์จาก AI เพื่อเริ่มพัฒนาสุขภาพของคุณ
            </p>
          </div>
          <Button onClick={handleRequestGoals} disabled={isPending} className="min-h-11 px-6">
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> กำลังประมวลผล…
              </>
            ) : (
              "ขอคำแนะนำเป้าหมาย"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // เสริม: หากมีเป้าหมายแล้วแต่ต้องการกดขอเพิ่มแฝงด้านล่าง
  if (initialGoals.length > 0 && suggestions.length === 0) {
    return (
      <Button
        variant="outline"
        onClick={handleRequestGoals}
        disabled={isPending}
        className="w-full min-h-11 text-foreground"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" /> กำลังประมวลผลคำแนะนำ…
          </>
        ) : (
          "ขอคำแนะนำเป้าหมายเพิ่มเติม"
        )}
      </Button>
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
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-2">
          {suggestions.map((_, index) => (
            <Button
              key={index}
              variant={selectedIndex === index ? "default" : "outline"}
              className="min-h-11 px-4"
              onClick={() => {
                setSelectedIndex(index);
                setCustomText(suggestions[index].title);
                setEditMode(false);
              }}
              disabled={isPending}
            >
              ข้อที่ {index + 1}
            </Button>
          ))}
        </div>

        <div className="text-sm text-muted-foreground">
          สถานการณ์:{" "}
          <span className="font-medium text-foreground">{SITUATION_LABELS[current.situation]}</span>
        </div>

        {!editMode ? (
          <div className="space-y-2">
            <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm font-medium leading-relaxed">
              {customText}
            </div>
            <Button
              variant="outline"
              onClick={() => setEditMode(true)}
              disabled={isPending}
              className="w-full min-h-11"
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
            />
            <div className="text-xs text-muted-foreground text-right">
              {customText.length}/{GOAL_TITLE_MAX_LENGTH} ตัวอักษร
            </div>
            <Button
              variant="outline"
              onClick={() => setEditMode(false)}
              disabled={isPending}
              className="w-full min-h-11"
            >
              เสร็จแก้ไข
            </Button>
          </div>
        )}

        <div className="grid gap-2 lg:grid-cols-2 pt-2">
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
