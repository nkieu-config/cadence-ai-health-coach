import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const WIDTHS = {
  form: "max-w-md",
  content: "max-w-5xl",
} as const;

export function PageContainer({
  width = "form",
  className,
  children,
}: {
  width?: keyof typeof WIDTHS;
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("mx-auto w-full", WIDTHS[width], className)}>{children}</div>;
}
