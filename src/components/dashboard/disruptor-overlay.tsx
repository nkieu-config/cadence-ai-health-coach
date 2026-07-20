"use client";

import * as React from "react";
import { AlertCircle, Users, Sunrise, Car, GraduationCap, Laptop, X } from "lucide-react";
import type { Disruptor } from "@/lib/domain";
import { DISRUPTOR_LABELS } from "@/lib/checkins/labels";
import { formatThaiDate } from "@/lib/checkins/date";
import { cn } from "@/lib/utils";

export interface DisruptorPoint {
  day: string;
  date: string;
  disruptors: Disruptor[];
  note: string | null;
}

export interface ActiveDisruptor extends DisruptorPoint {
  x: number;
  y: number;
  isLocked?: boolean;
}

type DisruptorStyle = {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
};

const disruptorConfig: Partial<Record<Disruptor, DisruptorStyle>> = {
  deadline: {
    icon: AlertCircle,
    color: "text-destructive dark:text-destructive",
    bg: "bg-destructive/10 dark:bg-destructive/15",
    border: "border-destructive/20 dark:border-destructive/30",
  },
  long_meeting: {
    icon: Users,
    color: "text-[var(--chart-2)] dark:text-[var(--chart-2)]",
    bg: "bg-[var(--chart-2)]/10 dark:bg-[var(--chart-2)]/15",
    border: "border-[var(--chart-2)]/20 dark:border-[var(--chart-2)]/30",
  },
  early_class: {
    icon: Sunrise,
    color: "text-[var(--chart-3)] dark:text-[var(--chart-3)]",
    bg: "bg-[var(--chart-3)]/10 dark:bg-[var(--chart-3)]/15",
    border: "border-[var(--chart-3)]/20 dark:border-[var(--chart-3)]/30",
  },
  commute: {
    icon: Car,
    color: "text-[var(--chart-4)] dark:text-[var(--chart-4)]",
    bg: "bg-[var(--chart-4)]/10 dark:bg-[var(--chart-4)]/15",
    border: "border-[var(--chart-4)]/20 dark:border-[var(--chart-4)]/30",
  },
  exam: {
    icon: GraduationCap,
    color: "text-[var(--chart-5)] dark:text-[var(--chart-5)]",
    bg: "bg-[var(--chart-5)]/10 dark:bg-[var(--chart-5)]/15",
    border: "border-[var(--chart-5)]/20 dark:border-[var(--chart-5)]/30",
  },
  online_class: {
    icon: Laptop,
    color: "text-[var(--chart-1)] dark:text-[var(--chart-1)]",
    bg: "bg-[var(--chart-1)]/10 dark:bg-[var(--chart-1)]/15",
    border: "border-[var(--chart-1)]/20 dark:border-[var(--chart-1)]/30",
  },
};

export function knownDisruptors(list: Disruptor[]): Disruptor[] {
  return (list ?? []).filter((d) => d && d !== "none" && disruptorConfig[d]);
}

function DisruptorBadge({
  disruptor,
  wrapClass,
  iconClass,
}: {
  disruptor: Disruptor;
  wrapClass: string;
  iconClass: string;
}) {
  const style = disruptorConfig[disruptor];
  if (!style) return null;
  const Icon = style.icon;
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border bg-background",
        style.bg,
        style.border,
        wrapClass
      )}
    >
      <Icon className={cn(style.color, iconClass)} />
    </div>
  );
}

interface DisruptorTickProps {
  x?: number;
  y?: number;
  payload?: { value: string; index: number };
  processedData: DisruptorPoint[];
  period: number;
  onMarkerHover: (data: DisruptorPoint | null, coords?: { x: number; y: number }) => void;
  onMarkerClick: (data: DisruptorPoint | null, coords?: { x: number; y: number }) => void;
  activeDate?: string | null;
}

export function DisruptorTick({
  x = 0,
  y = 0,
  payload,
  processedData,
  period,
  onMarkerHover,
  onMarkerClick,
  activeDate,
}: DisruptorTickProps) {
  if (!payload) return null;
  const point = processedData[payload.index];
  if (!point) return null;

  const primary = knownDisruptors(point.disruptors)[0];
  const style = primary ? disruptorConfig[primary] : null;
  const is30Days = period === 30;
  const size = is30Days ? "w-4.5 h-4.5" : "w-6 h-6";
  const interactive = Boolean(primary && style);
  const label = interactive
    ? `ปัจจัยรบกวน ${formatThaiDate(point.date)}: ${knownDisruptors(point.disruptors)
        .map((d) => DISRUPTOR_LABELS[d])
        .join(", ")}`
    : undefined;

  return (
    <foreignObject x={x - 22} y={y} width={44} height={48} className="overflow-visible">
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-start select-none",
          interactive && "cursor-pointer"
        )}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={label}
        aria-expanded={interactive ? activeDate === point.date : undefined}
        onMouseEnter={() => interactive && onMarkerHover(point, { x, y })}
        onMouseLeave={() => onMarkerHover(null)}
        onClick={(e) => {
          e.stopPropagation();
          if (interactive) onMarkerClick(point, { x, y });
        }}
        onKeyDown={
          interactive
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onMarkerClick(point, { x, y });
                }
              }
            : undefined
        }
      >
        {primary && style ? (
          <DisruptorBadge
            disruptor={primary}
            wrapClass={cn(
              "border transition-all duration-200",
              size,
              activeDate === point.date
                ? "scale-110 ring-2 ring-primary border-primary"
                : "hover:scale-105"
            )}
            iconClass={is30Days ? "w-2.5 h-2.5" : "w-3.5 h-3.5"}
          />
        ) : (
          <div className={size} />
        )}
        <span
          className={cn(
            "mt-1 text-[10px] font-medium sm:text-xs",
            primary ? "font-semibold text-foreground" : "text-muted-foreground"
          )}
        >
          {point.day}
        </span>
      </div>
    </foreignObject>
  );
}

export function DisruptorTooltipRows({ disruptors }: { disruptors: Disruptor[] }) {
  const known = knownDisruptors(disruptors);
  if (known.length === 0) return null;
  return (
    <div className="mt-1 space-y-1 border-t pt-1.5 text-[10px] text-muted-foreground">
      <span className="block text-[9px] font-semibold uppercase">ปัจจัยรบกวน:</span>
      {known.map((d) => (
        <div key={d} className="flex items-center gap-1.5">
          <DisruptorBadge disruptor={d} wrapClass="w-4.5 h-4.5" iconClass="w-2.5 h-2.5" />
          <span>{DISRUPTOR_LABELS[d]}</span>
        </div>
      ))}
    </div>
  );
}

export function DisruptorPopover({
  active,
  onClose,
}: {
  active: ActiveDisruptor;
  onClose: () => void;
}) {
  return (
    <div
      className="animate-in fade-in zoom-in-95 pointer-events-auto absolute z-50 w-60 rounded-xl border border-border bg-popover/95 p-3.5 text-xs text-popover-foreground shadow-xl backdrop-blur-xs duration-150"
      style={{ left: active.x, top: active.y - 12, transform: "translate(-50%, -100%)" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-2 flex items-center justify-between border-b pb-1 font-semibold text-muted-foreground">
        <span>{formatThaiDate(active.date)}</span>
        {active.isLocked && (
          <button
            onClick={onClose}
            aria-label="ปิด"
            className="cursor-pointer rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex flex-col gap-1.5">
          {knownDisruptors(active.disruptors).map((d) => (
            <div key={d} className="flex items-center gap-2 font-medium">
              <DisruptorBadge disruptor={d} wrapClass="w-5 h-5" iconClass="w-3 h-3" />
              <span>{DISRUPTOR_LABELS[d]}</span>
            </div>
          ))}
        </div>
        {active.note ? (
          <div className="rounded border bg-muted/50 p-2 text-[11px] text-muted-foreground italic">
            &quot;{active.note}&quot;
          </div>
        ) : (
          <div className="text-[10px] text-muted-foreground/60 italic">(ไม่มีบันทึกเพิ่มเติม)</div>
        )}
      </div>
    </div>
  );
}

export function DisruptorLegend() {
  return (
    <div className="mt-3.5 flex flex-wrap justify-center gap-x-4 gap-y-2 border-t pt-3.5 text-xs text-muted-foreground">
      <span className="mr-1 font-medium text-foreground">สัญลักษณ์วันพิเศษ (Disruptors):</span>
      {knownDisruptors(Object.keys(disruptorConfig) as Disruptor[]).map((d) => (
        <div key={d} className="flex items-center gap-1.5">
          <DisruptorBadge disruptor={d} wrapClass="w-4 h-4" iconClass="w-2.5 h-2.5" />
          <span>{DISRUPTOR_LABELS[d]}</span>
        </div>
      ))}
    </div>
  );
}

export function useDisruptorMarkers() {
  const [activeDisruptor, setActiveDisruptor] = React.useState<ActiveDisruptor | null>(null);

  const handleMarkerHover = (data: DisruptorPoint | null, coords?: { x: number; y: number }) => {
    if (activeDisruptor?.isLocked) return;
    if (data && coords) {
      setActiveDisruptor({ ...data, x: coords.x, y: coords.y, isLocked: false });
    } else {
      setActiveDisruptor(null);
    }
  };

  const handleMarkerClick = (data: DisruptorPoint | null, coords?: { x: number; y: number }) => {
    if (!data || !coords) {
      setActiveDisruptor(null);
      return;
    }
    if (activeDisruptor?.date === data.date && activeDisruptor.isLocked) {
      setActiveDisruptor(null);
    } else {
      setActiveDisruptor({ ...data, x: coords.x, y: coords.y, isLocked: true });
    }
  };

  React.useEffect(() => {
    if (!activeDisruptor?.isLocked) return;
    const dismiss = () => setActiveDisruptor(null);
    document.addEventListener("click", dismiss);
    return () => document.removeEventListener("click", dismiss);
  }, [activeDisruptor]);

  return { activeDisruptor, setActiveDisruptor, handleMarkerHover, handleMarkerClick };
}
