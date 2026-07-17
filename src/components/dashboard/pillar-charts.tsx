"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts";
import type { Checkin, Disruptor } from "@/lib/domain";
import { daysAgo, formatShortThaiDate, formatThaiDate } from "@/lib/checkins/date";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { AlertCircle, Users, Sunrise, Car, GraduationCap, Laptop, X } from "lucide-react";

const chartConfig = {
  sleepHours: { label: "ชั่วโมงนอน (ชม.)", color: "var(--chart-1)" },
  mealsCount: { label: "มื้อที่กิน (มื้อ)", color: "var(--chart-2)" },
  sweetDrinks: { label: "เครื่องดื่มหวาน (แก้ว)", color: "var(--chart-5)" },
  movementMinutes: { label: "นาทีเคลื่อนไหว", color: "var(--chart-3)" },
} satisfies ChartConfig;

interface ProcessedDataItem {
  day: string;
  date: string;
  disruptors: Disruptor[];
  note: string | null;
  sleepHours: number | null;
  mealsCount: number | null;
  sweetDrinks: number | null;
  movementMinutes: number | null;
}

interface ActiveDisruptor extends ProcessedDataItem {
  x: number;
  y: number;
  isLocked?: boolean;
}

interface CustomXAxisTickProps {
  x?: number;
  y?: number;
  payload?: {
    value: string;
    index: number;
  };
  processedData: ProcessedDataItem[];
  period: number;
  onMarkerHover: (data: ProcessedDataItem | null, coords?: { x: number; y: number }) => void;
  onMarkerClick: (data: ProcessedDataItem | null, coords?: { x: number; y: number }) => void;
  activeDate?: string | null;
}

interface TooltipPayloadItem {
  payload: ProcessedDataItem;
  value: number;
  name: string;
  dataKey: string;
}

interface CustomTooltipContentProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

// Config for disruptor markers with colors using dark-mode safe tokens
const disruptorConfig: Partial<
  Record<
    Disruptor,
    {
      icon: React.ComponentType<{ className?: string }>;
      color: string;
      bg: string;
      border: string;
      label: string;
    }
  >
> = {
  deadline: {
    icon: AlertCircle,
    color: "text-destructive dark:text-destructive",
    bg: "bg-destructive/10 dark:bg-destructive/15",
    border: "border-destructive/20 dark:border-destructive/30",
    label: "เดดไลน์",
  },
  long_meeting: {
    icon: Users,
    color: "text-[var(--chart-2)] dark:text-[var(--chart-2)]",
    bg: "bg-[var(--chart-2)]/10 dark:bg-[var(--chart-2)]/15",
    border: "border-[var(--chart-2)]/20 dark:border-[var(--chart-2)]/30",
    label: "ประชุมยาว",
  },
  early_class: {
    icon: Sunrise,
    color: "text-[var(--chart-3)] dark:text-[var(--chart-3)]",
    bg: "bg-[var(--chart-3)]/10 dark:bg-[var(--chart-3)]/15",
    border: "border-[var(--chart-3)]/20 dark:border-[var(--chart-3)]/30",
    label: "เรียนเช้า",
  },
  commute: {
    icon: Car,
    color: "text-[var(--chart-4)] dark:text-[var(--chart-4)]",
    bg: "bg-[var(--chart-4)]/10 dark:bg-[var(--chart-4)]/15",
    border: "border-[var(--chart-4)]/20 dark:border-[var(--chart-4)]/30",
    label: "เดินทางไกล",
  },
  exam: {
    icon: GraduationCap,
    color: "text-[var(--chart-5)] dark:text-[var(--chart-5)]",
    bg: "bg-[var(--chart-5)]/10 dark:bg-[var(--chart-5)]/15",
    border: "border-[var(--chart-5)]/20 dark:border-[var(--chart-5)]/30",
    label: "สอบ",
  },
  online_class: {
    icon: Laptop,
    color: "text-[var(--chart-4)] dark:text-[var(--chart-4)]",
    bg: "bg-[var(--chart-4)]/10 dark:bg-[var(--chart-4)]/15",
    border: "border-[var(--chart-4)]/20 dark:border-[var(--chart-4)]/30",
    label: "เรียน/ทำงาน online",
  },
};

function getPastDates(daysCount: number): string[] {
  const dates: string[] = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    dates.push(daysAgo(i));
  }
  return dates;
}

// Custom X-Axis Tick rendering Lucide icon + day label
const CustomXAxisTick = ({
  x = 0,
  y = 0,
  payload,
  processedData,
  period,
  onMarkerHover,
  onMarkerClick,
  activeDate,
}: CustomXAxisTickProps) => {
  if (!payload) return null;
  const dataItem = processedData[payload.index];
  if (!dataItem) return null;

  const { day, disruptors } = dataItem;
  const activeDisruptors = (disruptors || []).filter((d: Disruptor) => d && d !== "none");
  const primaryDisruptor = activeDisruptors[0];
  const iconConfig = primaryDisruptor ? disruptorConfig[primaryDisruptor] : null;
  const IconComponent = iconConfig?.icon;
  const is30Days = period === 30;

  return (
    <foreignObject x={x - 22} y={y} width={44} height={48} className="overflow-visible">
      <div
        className="flex flex-col items-center justify-start w-full h-full cursor-pointer select-none"
        onMouseEnter={() => IconComponent && onMarkerHover(dataItem, { x, y })}
        onMouseLeave={() => IconComponent && onMarkerHover(null)}
        onClick={(e) => {
          e.stopPropagation();
          if (IconComponent) onMarkerClick(dataItem, { x, y });
        }}
      >
        {IconComponent && iconConfig ? (
          <div
            className={cn(
              "flex items-center justify-center rounded-full border transition-all duration-200 bg-background",
              is30Days ? "w-4.5 h-4.5" : "w-6 h-6",
              activeDate === dataItem.date
                ? "scale-110 ring-2 ring-primary border-primary"
                : "hover:scale-105",
              iconConfig.bg,
              iconConfig.border
            )}
          >
            <IconComponent
              className={cn(is30Days ? "w-2.5 h-2.5" : "w-3.5 h-3.5", iconConfig.color)}
            />
          </div>
        ) : (
          <div className={is30Days ? "w-4.5 h-4.5" : "w-6 h-6"} />
        )}
        <span
          className={cn(
            "text-[10px] sm:text-xs mt-1 font-medium",
            IconComponent ? "text-foreground font-semibold" : "text-muted-foreground"
          )}
        >
          {day}
        </span>
      </div>
    </foreignObject>
  );
};

// Custom Tooltip content showing metrics + disruptor list
const CustomTooltipContent = ({ active, payload }: CustomTooltipContentProps) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const activeDisruptors = (data.disruptors || []).filter((d: Disruptor) => d && d !== "none");

  return (
    <div className="grid min-w-36 items-start gap-1.5 rounded-lg border bg-background p-2.5 text-xs shadow-md">
      <div className="font-semibold text-muted-foreground pb-1 border-b">
        {formatThaiDate(data.date)}
      </div>
      <div className="grid gap-1 pt-0.5">
        {payload.map((item: TooltipPayloadItem, idx: number) => {
          const config = chartConfig[item.dataKey as keyof typeof chartConfig];
          const unit =
            item.dataKey === "sleepHours"
              ? " ชม."
              : item.dataKey === "mealsCount"
                ? " มื้อ"
                : item.dataKey === "sweetDrinks"
                  ? " แก้ว"
                  : " นาที";
          return (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">{config?.label || item.name}</span>
              <span className="font-mono font-medium text-foreground">
                {item.value}
                {unit}
              </span>
            </div>
          );
        })}
        {activeDisruptors.length > 0 && (
          <div className="border-t pt-1.5 mt-1 text-[10px] text-muted-foreground space-y-1">
            <span className="font-semibold block text-[9px] uppercase">ปัจจัยรบกวน:</span>
            {activeDisruptors.map((d: Disruptor) => {
              const config = disruptorConfig[d];
              if (!config) return null;
              const Icon = config.icon;
              return (
                <div key={d} className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      "flex items-center justify-center w-4.5 h-4.5 rounded-full border bg-background",
                      config.bg,
                      config.border
                    )}
                  >
                    <Icon className={cn("w-2.5 h-2.5", config.color)} />
                  </div>
                  <span>{config.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Disruptor Legend Component
function DisruptorLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 pt-3.5 mt-3.5 border-t text-xs text-muted-foreground justify-center">
      <span className="font-medium text-foreground mr-1">สัญลักษณ์วันพิเศษ (Disruptors):</span>
      {Object.entries(disruptorConfig).map(([key, config]) => {
        if (!config) return null;
        const Icon = config.icon;
        return (
          <div key={key} className="flex items-center gap-1.5">
            <div
              className={cn(
                "flex items-center justify-center w-4 h-4 rounded-full border bg-background",
                config.bg,
                config.border
              )}
            >
              <Icon className={cn("w-2.5 h-2.5", config.color)} />
            </div>
            <span>{config.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function PillarCharts({ checkins, period }: { checkins: Checkin[]; period: number }) {
  const [activeTab, setActiveTab] = React.useState<"sleep" | "eating" | "movement">("sleep");
  const [activeDisruptor, setActiveDisruptor] = React.useState<ActiveDisruptor | null>(null);

  const processedData = React.useMemo(() => {
    const dates = getPastDates(period);
    return dates.map((dateStr) => {
      const checkin = checkins.find((c) => c.checkinDate === dateStr);
      const formattedDay = formatShortThaiDate(dateStr).split(" ")[0];
      return {
        day: formattedDay,
        date: dateStr,
        disruptors: checkin?.disruptors || [],
        note: checkin?.note || null,
        sleepHours: checkin?.sleepHours ?? null,
        mealsCount: checkin?.mealsCount ?? null,
        sweetDrinks: checkin?.sweetDrinks ?? null,
        movementMinutes: checkin?.movementMinutes ?? null,
      };
    });
  }, [checkins, period]);

  const categories = [
    { id: "sleep", label: "ชั่วโมงนอน" },
    { id: "eating", label: "การกิน" },
    { id: "movement", label: "การเคลื่อนไหว" },
  ] as const;

  const handleTabChange = (tab: "sleep" | "eating" | "movement") => {
    setActiveTab(tab);
    setActiveDisruptor(null);
  };

  const handleMarkerHover = (data: ProcessedDataItem | null, coords?: { x: number; y: number }) => {
    if (activeDisruptor?.isLocked) return;
    if (data && coords) {
      setActiveDisruptor({ ...data, x: coords.x, y: coords.y, isLocked: false });
    } else {
      setActiveDisruptor(null);
    }
  };

  const handleMarkerClick = (data: ProcessedDataItem | null, coords?: { x: number; y: number }) => {
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
    const handleDocumentClick = () => setActiveDisruptor(null);
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, [activeDisruptor]);

  return (
    <Card className="h-full flex flex-col justify-between overflow-visible">
      <CardHeader className="pb-4 space-y-4">
        <div className="space-y-1">
          <CardTitle className="text-lg">กราฟแนวโน้มพฤติกรรม (3 Pillars Trend)</CardTitle>
          <CardDescription>
            กราฟแสดงพฤติกรรมการกิน การนอน และการเคลื่อนไหว ย้อนหลัง {period} วัน
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-1.5 bg-muted/40 p-1 rounded-full border w-fit">
          {categories.map((cat) => {
            const active = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleTabChange(cat.id)}
                aria-pressed={active}
                className={cn(
                  "inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-medium transition-all active:scale-95 cursor-pointer select-none",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="overflow-visible">
        {/* Render selected chart based on activeTab */}
        {categories.map((cat) => {
          if (activeTab !== cat.id) return null;
          return (
            <div key={cat.id} className="relative space-y-2 overflow-visible">
              <ChartContainer config={chartConfig} className="h-52 w-full">
                <BarChart
                  data={processedData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 35 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={
                      <CustomXAxisTick
                        processedData={processedData}
                        period={period}
                        activeDate={activeDisruptor?.date}
                        onMarkerHover={handleMarkerHover}
                        onMarkerClick={handleMarkerClick}
                      />
                    }
                  />
                  <YAxis
                    domain={cat.id === "sleep" ? [0, 12] : [0, "auto"]}
                    axisLine={false}
                    tickLine={false}
                  />
                  {cat.id === "sleep" && (
                    <ReferenceLine y={6} stroke="var(--destructive)" strokeDasharray="3 3" />
                  )}
                  <ChartTooltip content={<CustomTooltipContent />} />
                  {cat.id === "sleep" && (
                    <Bar
                      dataKey="sleepHours"
                      name="sleepHours"
                      fill="var(--chart-1)"
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                  {cat.id === "eating" && (
                    <>
                      <Bar
                        dataKey="mealsCount"
                        name="mealsCount"
                        fill="var(--chart-2)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="sweetDrinks"
                        name="sweetDrinks"
                        fill="var(--chart-5)"
                        radius={[4, 4, 0, 0]}
                      />
                    </>
                  )}
                  {cat.id === "movement" && (
                    <Bar
                      dataKey="movementMinutes"
                      name="movementMinutes"
                      fill="var(--chart-3)"
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                </BarChart>
              </ChartContainer>

              {activeDisruptor && (
                <div
                  className="absolute z-50 bg-popover/95 backdrop-blur-xs text-popover-foreground border border-border shadow-xl rounded-xl p-3.5 w-60 pointer-events-auto animate-in fade-in zoom-in-95 duration-150 text-xs"
                  style={{
                    left: activeDisruptor.x,
                    top: activeDisruptor.y - 12,
                    transform: "translate(-50%, -100%)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between font-semibold text-muted-foreground pb-1 border-b mb-2">
                    <span>{formatThaiDate(activeDisruptor.date)}</span>
                    {activeDisruptor.isLocked && (
                      <button
                        onClick={() => setActiveDisruptor(null)}
                        className="text-muted-foreground hover:text-foreground p-0.5 rounded-md hover:bg-muted transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-col gap-1.5">
                      {activeDisruptor.disruptors.map((d: Disruptor) => {
                        const config = disruptorConfig[d];
                        if (!config) return null;
                        const Icon = config.icon;
                        return (
                          <div key={d} className="flex items-center gap-2 font-medium">
                            <div
                              className={cn(
                                "flex items-center justify-center w-5 h-5 rounded-full border bg-background",
                                config.bg,
                                config.border
                              )}
                            >
                              <Icon className={cn("w-3 h-3", config.color)} />
                            </div>
                            <span>{config.label}</span>
                          </div>
                        );
                      })}
                    </div>
                    {activeDisruptor.note ? (
                      <div className="bg-muted/50 p-2 rounded border text-[11px] text-muted-foreground italic">
                        &quot;{activeDisruptor.note}&quot;
                      </div>
                    ) : (
                      <div className="text-[10px] text-muted-foreground/60 italic">
                        (ไม่มีบันทึกเพิ่มเติม)
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <DisruptorLegend />
      </CardContent>
    </Card>
  );
}
