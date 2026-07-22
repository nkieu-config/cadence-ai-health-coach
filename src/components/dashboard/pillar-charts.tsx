"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts";
import type { Checkin, Disruptor } from "@/lib/domain";
import { daysAgo, formatShortThaiDate, formatThaiDate } from "@/lib/checkins/date";
import { ENERGY_LABELS } from "@/lib/checkins/labels";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import {
  DisruptorTick,
  DisruptorPopover,
  DisruptorLegend,
  DisruptorTooltipRows,
  useDisruptorMarkers,
  type DisruptorPoint,
} from "@/components/dashboard/disruptor-overlay";

const chartConfig = {
  sleepHours: { label: "ชั่วโมงนอน (ชม.)", color: "var(--chart-1)" },
  mealsCount: { label: "มื้อที่กิน (มื้อ)", color: "var(--chart-2)" },
  sweetDrinks: { label: "เครื่องดื่มหวาน (แก้ว)", color: "var(--chart-6)" },
  movementMinutes: { label: "นาทีเคลื่อนไหว", color: "var(--chart-3)" },
  energyRaw: { label: "ระดับพลังงาน", color: "var(--chart-4)" },
} satisfies ChartConfig;

const UNITS: Record<string, string> = {
  sleepHours: " ชม.",
  mealsCount: " มื้อ",
  sweetDrinks: " แก้ว",
  movementMinutes: " นาที",
};

type MetricKey = keyof typeof chartConfig;
type TabId = "sleep" | "eating" | "movement" | "energy";

const ENERGY_VALUE: Record<string, number> = { low: 1, medium: 2, high: 3 };

function energyLabel(value: number): string {
  if (value === 1) return ENERGY_LABELS.low;
  if (value === 2) return ENERGY_LABELS.medium;
  if (value === 3) return ENERGY_LABELS.high;
  return "";
}

const LEGEND_KEYS: Record<TabId, MetricKey[]> = {
  sleep: ["sleepHours"],
  eating: ["mealsCount", "sweetDrinks"],
  movement: ["movementMinutes"],
  energy: ["energyRaw"],
};

function ValueLegend({ keys }: { keys: MetricKey[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {keys.map((key) => (
        <div key={key} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-xs"
            style={{ backgroundColor: chartConfig[key].color }}
          />
          <span>{chartConfig[key].label}</span>
        </div>
      ))}
    </div>
  );
}

interface PillarPoint extends DisruptorPoint {
  sleepHours: number | null;
  mealsCount: number | null;
  sweetDrinks: number | null;
  movementMinutes: number | null;
  energyRaw: number | null;
}

interface TooltipItem {
  payload: PillarPoint;
  value: number;
  name: string;
  dataKey: string;
}

function PillarTooltip({ active, payload }: { active?: boolean; payload?: TooltipItem[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="grid min-w-36 items-start gap-1.5 rounded-lg border bg-background p-2.5 text-xs shadow-md">
      <div className="border-b pb-1 font-semibold text-muted-foreground">
        {formatThaiDate(point.date)}
      </div>
      <div className="grid gap-1 pt-0.5">
        {payload.map((item, idx) => {
          const config = chartConfig[item.dataKey as keyof typeof chartConfig];
          const isEnergy = item.dataKey === "energyRaw";
          return (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">{config?.label || item.name}</span>
              <span className="font-mono font-medium text-foreground">
                {isEnergy ? energyLabel(item.value) : `${item.value}${UNITS[item.dataKey] ?? ""}`}
              </span>
            </div>
          );
        })}
        <DisruptorTooltipRows disruptors={point.disruptors} />
      </div>
    </div>
  );
}

function getPastDates(daysCount: number): string[] {
  const dates: string[] = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    dates.push(daysAgo(i));
  }
  return dates;
}

export function PillarCharts({ checkins, period }: { checkins: Checkin[]; period: number }) {
  const [activeTab, setActiveTab] = React.useState<TabId>("sleep");
  const { activeDisruptor, setActiveDisruptor, handleMarkerHover, handleMarkerClick } =
    useDisruptorMarkers();

  const processedData = React.useMemo<PillarPoint[]>(() => {
    const dates = getPastDates(period);
    return dates.map((dateStr) => {
      const checkin = checkins.find((c) => c.checkinDate === dateStr);
      return {
        day: formatShortThaiDate(dateStr).split(" ")[0],
        date: dateStr,
        disruptors: (checkin?.disruptors ?? []) as Disruptor[],
        note: checkin?.note ?? null,
        sleepHours: checkin?.sleepHours ?? null,
        mealsCount: checkin?.mealsCount ?? null,
        sweetDrinks: checkin?.sweetDrinks ?? null,
        movementMinutes: checkin?.movementMinutes ?? null,
        energyRaw: checkin ? (ENERGY_VALUE[checkin.energyLevel] ?? null) : null,
      };
    });
  }, [checkins, period]);

  const categories = [
    { id: "sleep", label: "นอน" },
    { id: "eating", label: "กิน" },
    { id: "movement", label: "ขยับ" },
    { id: "energy", label: "พลังงาน" },
  ] as const;

  const changeTab = (tab: TabId) => {
    setActiveTab(tab);
    setActiveDisruptor(null);
  };

  return (
    <Card className="flex h-full flex-col justify-between">
      <CardHeader className="space-y-4 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-lg">แนวโน้มรายวัน</CardTitle>
          <CardDescription>ย้อนหลัง {period} วัน</CardDescription>
        </div>
        <div className="flex w-fit flex-wrap gap-1.5 rounded-full border bg-muted/40 p-1">
          {categories.map((cat) => {
            const active = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => changeTab(cat.id)}
                aria-pressed={active}
                className={cn(
                  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full px-3 text-sm font-medium transition-all select-none active:scale-95 sm:px-4",
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
      <CardContent>
        {categories.map((cat) => {
          if (activeTab !== cat.id) return null;
          return (
            <div key={cat.id} className="relative space-y-2">
              <ChartContainer config={chartConfig} className="h-60 w-full overflow-x-clip">
                <BarChart
                  data={processedData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 48 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    interval={period <= 14 ? 0 : undefined}
                    tick={
                      <DisruptorTick
                        processedData={processedData}
                        period={period}
                        activeDate={activeDisruptor?.date}
                        onMarkerHover={handleMarkerHover}
                        onMarkerClick={handleMarkerClick}
                      />
                    }
                  />
                  {cat.id === "energy" ? (
                    <YAxis
                      ticks={[1, 2, 3]}
                      tickFormatter={energyLabel}
                      domain={[0, 3.2]}
                      axisLine={false}
                      tickLine={false}
                    />
                  ) : (
                    <YAxis
                      domain={cat.id === "sleep" ? [0, 12] : [0, "auto"]}
                      axisLine={false}
                      tickLine={false}
                    />
                  )}
                  {cat.id === "sleep" && (
                    <ReferenceLine y={6} stroke="var(--muted-foreground)" strokeDasharray="3 3" />
                  )}
                  <ChartTooltip content={<PillarTooltip />} />
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
                        fill="var(--chart-6)"
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
                  {cat.id === "energy" && (
                    <Bar
                      dataKey="energyRaw"
                      name="energyRaw"
                      fill="var(--chart-4)"
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                </BarChart>
              </ChartContainer>

              <ValueLegend keys={LEGEND_KEYS[cat.id]} />

              {activeDisruptor && (
                <DisruptorPopover
                  active={activeDisruptor}
                  onClose={() => setActiveDisruptor(null)}
                />
              )}
            </div>
          );
        })}
        <DisruptorLegend />
      </CardContent>
    </Card>
  );
}
