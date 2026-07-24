import type { ReactNode } from "react";
import { AlertCircle, Sprout, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function GentleNotice({
  icon: Icon = Sprout,
  title,
  children,
  className,
}: {
  icon?: LucideIcon;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3.5 text-left",
        className
      )}
    >
      <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 space-y-1">
        {title && <p className="text-sm font-medium text-foreground">{title}</p>}
        <p className="text-sm text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

export function ErrorNotice({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-left text-sm text-destructive",
        className
      )}
    >
      <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
      <span className="min-w-0">{children}</span>
    </div>
  );
}
