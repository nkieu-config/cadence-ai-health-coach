"use client";

import type { ComponentType } from "react";
import { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type IconProps = { className?: string };

export function NavIcon({
  icon: Icon,
  className,
}: {
  icon: ComponentType<IconProps>;
  className?: string;
}) {
  const { pending } = useLinkStatus();

  if (pending) {
    return (
      <Loader2 aria-hidden className={cn("animate-spin motion-reduce:animate-none", className)} />
    );
  }
  return <Icon aria-hidden className={className} />;
}

export function PendingBar() {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden
      data-pending={pending || undefined}
      className="pointer-events-none absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-current opacity-0 transition-all delay-100 duration-200 data-[pending]:scale-x-100 data-[pending]:opacity-60"
    />
  );
}
