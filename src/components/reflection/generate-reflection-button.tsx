"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateReflection } from "@/lib/ai-outputs/actions";

export function GenerateReflectionButton({ label = "สร้างสรุปสัปดาห์" }: { label?: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleClick = () => {
    setError(null);
    startTransition(async () => {
      const result = await generateReflection();
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <Button onClick={handleClick} disabled={isPending} className="w-full">
        <NotebookPen className="size-4" />
        {isPending ? "กำลังสรุปให้…" : label}
      </Button>
      {isPending && (
        <p className="text-center text-xs text-muted-foreground">ใช้เวลาราว 10 วินาที</p>
      )}
      {error && (
        <p className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
