"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorNotice, GentleNotice } from "@/components/ui/notice";
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
  const [invitation, setInvitation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleClick = () => {
    setInvitation(null);
    setError(null);
    startTransition(async () => {
      const result = await generateInsight(days);
      if ("notEnoughData" in result) {
        setInvitation(result.message);
        return;
      }
      if ("error" in result) {
        setError(result.error);
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
      {invitation && <GentleNotice>{invitation}</GentleNotice>}
      {error && <ErrorNotice>{error}</ErrorNotice>}
    </div>
  );
}
