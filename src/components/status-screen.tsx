import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatusScreen({
  icon: Icon,
  tone = "neutral",
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone?: "neutral" | "error";
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-5 px-4 py-10 text-center">
      <div
        className={cn(
          "flex size-14 items-center justify-center rounded-full",
          tone === "error" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
        )}
      >
        <Icon className="size-7" />
      </div>

      <div className="max-w-md space-y-2">
        <h1 className="text-xl font-semibold lg:text-2xl">{title}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>

      {children && <div className="flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}
