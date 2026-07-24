"use client";

import * as React from "react";
import {
  AlertCircle,
  Users,
  Sunrise,
  Car,
  GraduationCap,
  Laptop,
  ChevronDown,
  X,
} from "lucide-react";
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

// ปัจจัยรบกวนใช้ปะการัง --chart-5 สีเดียวทั้งหมด (DESIGN.md) — แยกชนิดด้วยไอคอน
// ไม่ใช่ด้วยสี เพราะสีในแอปนี้สงวนความหมายไว้ให้ pillar (นอน/กิน/ขยับ)
const disruptorIcons: Partial<Record<Disruptor, React.ComponentType<{ className?: string }>>> = {
  deadline: AlertCircle,
  long_meeting: Users,
  early_class: Sunrise,
  commute: Car,
  exam: GraduationCap,
  online_class: Laptop,
};

export function knownDisruptors(list: Disruptor[]): Disruptor[] {
  return (list ?? []).filter((d) => d && d !== "none" && disruptorIcons[d]);
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
  const Icon = disruptorIcons[disruptor];
  if (!Icon) return null;
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-chart-5/40 bg-chart-5/15",
        wrapClass
      )}
    >
      <Icon className={cn("text-chart-5", iconClass)} />
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
  const dense = period >= 14;
  // 30 วันบนจอ 320px วันห่างกันแค่ ~9px — badge มีไอคอนจะทับกันเป็นก้อนอ่านไม่ออก
  const crowded = period > 14;
  const size = crowded ? "size-2" : dense ? "w-4.5 h-4.5" : "w-6 h-6";
  const interactive = Boolean(primary);
  const label = interactive
    ? `ปัจจัยรบกวน ${formatThaiDate(point.date)}: ${knownDisruptors(point.disruptors)
        .map((d) => DISRUPTOR_LABELS[d])
        .join(", ")}`
    : undefined;

  // ช่วงยาววันชิดกันจนป้ายวันซ้อนกัน — เว้นป้ายไว้ แต่ marker ต้องครบทุกวันเสมอ
  const showDay = !crowded || payload.index % 3 === 0;
  const tickWidth = crowded ? 12 : dense ? 28 : 44;

  return (
    <foreignObject
      x={x - tickWidth / 2}
      y={y}
      width={tickWidth}
      height={48}
      className="overflow-visible"
    >
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-start select-none",
          // วันที่ไม่มีปัจจัยรบกวนต้องไม่ดูดคลิกที่เล็งไปยัง marker ข้างเคียง
          interactive
            ? "cursor-pointer rounded-lg focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            : "pointer-events-none"
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
        {!primary ? (
          <div className={size} />
        ) : crowded ? (
          <span
            className={cn(
              "shrink-0 rounded-full bg-chart-5 transition-all duration-200",
              size,
              activeDate === point.date && "scale-125 ring-2 ring-primary"
            )}
          />
        ) : (
          <DisruptorBadge
            disruptor={primary}
            wrapClass={cn(
              "transition-all duration-200",
              size,
              activeDate === point.date
                ? "scale-110 border-primary ring-2 ring-primary"
                : "hover:scale-105"
            )}
            iconClass={dense ? "w-2.5 h-2.5" : "w-3.5 h-3.5"}
          />
        )}
        {showDay && (
          <span
            className={cn(
              "mt-1 text-xs font-medium",
              primary ? "font-semibold text-foreground" : "text-muted-foreground"
            )}
          >
            {point.day}
          </span>
        )}
      </div>
    </foreignObject>
  );
}

export function DisruptorTooltipRows({ disruptors }: { disruptors: Disruptor[] }) {
  const known = knownDisruptors(disruptors);
  if (known.length === 0) return null;
  return (
    <div className="mt-1 space-y-1 border-t pt-1.5 text-xs text-muted-foreground">
      <span className="block font-semibold">ปัจจัยรบกวน:</span>
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
      className="animate-in fade-in zoom-in-95 pointer-events-auto absolute z-50 w-60 max-w-full rounded-xl border border-border bg-popover/95 p-3.5 text-xs text-popover-foreground shadow-xl backdrop-blur-xs duration-150"
      // การ์ดกราฟเป็น overflow-hidden — marker ริมขอบต้องหนีเข้ามาเอง ไม่งั้นโดนตัด
      style={{
        left: `clamp(7.5rem, ${active.x}px, calc(100% - 7.5rem))`,
        top: active.y - 12,
        transform: "translate(-50%, -100%)",
      }}
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
          <div className="rounded border bg-muted/50 p-2 text-xs text-muted-foreground italic">
            &quot;{active.note}&quot;
          </div>
        ) : (
          <div className="text-xs text-muted-foreground/60 italic">(ไม่มีบันทึกเพิ่มเติม)</div>
        )}
      </div>
    </div>
  );
}

function DisruptorLegendItems() {
  return knownDisruptors(Object.keys(disruptorIcons) as Disruptor[]).map((d) => (
    <div key={d} className="flex items-center gap-1.5">
      <DisruptorBadge disruptor={d} wrapClass="w-4 h-4" iconClass="w-2.5 h-2.5" />
      <span>{DISRUPTOR_LABELS[d]}</span>
    </div>
  ));
}

export function DisruptorLegend() {
  return (
    <>
      <details className="group mt-3.5 border-t pt-1 text-xs text-muted-foreground lg:hidden">
        <summary className="flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full outline-none select-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
          <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" />
          <span>สัญลักษณ์วันพิเศษ</span>
        </summary>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 pb-1">
          <DisruptorLegendItems />
        </div>
      </details>
      <div className="mt-3.5 hidden flex-wrap justify-center gap-x-4 gap-y-2 border-t pt-3.5 text-xs text-muted-foreground lg:flex">
        <span className="mr-1 font-medium text-foreground">สัญลักษณ์วันพิเศษ (Disruptors):</span>
        <DisruptorLegendItems />
      </div>
    </>
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

  const isLocked = activeDisruptor?.isLocked ?? false;

  React.useEffect(() => {
    if (!isLocked) return;
    const dismiss = () => setActiveDisruptor(null);
    document.addEventListener("click", dismiss);
    return () => document.removeEventListener("click", dismiss);
  }, [isLocked]);

  return { activeDisruptor, setActiveDisruptor, handleMarkerHover, handleMarkerClick };
}
