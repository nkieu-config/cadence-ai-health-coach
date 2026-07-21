import type { ReactNode } from "react";
import { AlertCircle, MailCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function AuthMessage({ tone, children }: { tone: "error" | "notice"; children: ReactNode }) {
  const Icon = tone === "error" ? AlertCircle : MailCheck;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-lg border p-3 text-sm",
        tone === "error"
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-primary/30 bg-primary/5 text-foreground"
      )}
    >
      <Icon
        className={cn("mt-0.5 size-4 shrink-0", tone === "notice" && "text-primary")}
        aria-hidden
      />
      <span>{children}</span>
    </div>
  );
}
