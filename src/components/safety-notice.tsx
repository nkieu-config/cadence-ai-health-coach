import { cn } from "@/lib/utils";

export function SafetyNotice({ className }: { className?: string }) {
  return (
    <p className={cn("text-center text-xs text-muted-foreground", className)}>
      HealthCoach เป็นผู้ช่วยดูแลสุขภาพทั่วไป ไม่ใช่บริการทางการแพทย์ — หากมีอาการผิดปกติควรปรึกษาผู้เชี่ยวชาญ
    </p>
  );
}
