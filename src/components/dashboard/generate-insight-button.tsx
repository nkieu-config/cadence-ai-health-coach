"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateInsight } from "@/lib/ai-outputs/actions";

export function GenerateInsightButton({
  days,
  label = "วิเคราะห์รูปแบบ",
  variant = "default",
  className,
}: {
  days: number;
  label?: string;
  variant?: "default" | "outline";
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleClick = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await generateInsight(days);
      if ("notEnoughData" in result) {
        setMessage(result.message);
        return;
      }
      if ("error" in result) {
        setMessage(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleClick}
        disabled={isPending}
        variant={variant}
        className={className ?? "w-full"}
      >
        <Sparkles className="size-4" />
        {isPending ? "กำลังวิเคราะห์ให้…" : label}
      </Button>
      {isPending && (
        <p className="text-center text-xs text-muted-foreground">ใช้เวลาราว 10 วินาที</p>
      )}
      {message && (
        <p className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          {message}
        </p>
      )}
    </div>
  );
}
