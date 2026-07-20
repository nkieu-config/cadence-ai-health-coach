"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import type { Checkin, Disruptor } from "@/lib/domain";
import { daysAgo, formatShortThaiDate, formatThaiDate } from "@/lib/checkins/date";
import { ENERGY_LABELS } from "@/lib/checkins/labels";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import {
  DisruptorTick,
  DisruptorPopover,
  DisruptorLegend,
  DisruptorTooltipRows,
  useDisruptorMarkers,
  type DisruptorPoint,
} from "@/components/dashboard/disruptor-overlay";

const chartConfig = {
  energy: { label: "ระดับพลังงาน", color: "var(--chart-4)" },
} satisfies ChartConfig;

const ENERGY_VALUE: Record<string, number> = { low: 1, medium: 2, high: 3 };

function energyLabel(value: number): string {
  if (value === 1) return ENERGY_LABELS.low;
  if (value === 2) return ENERGY_LABELS.medium;
  if (value === 3) return ENERGY_LABELS.high;
  return "";
}

interface EnergyPoint extends DisruptorPoint {
  energyRaw: number | null;
}

interface TooltipItem {
  payload: EnergyPoint;
  value: number;
}

function EnergyTooltip({ active, payload }: { active?: boolean; payload?: TooltipItem[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="grid min-w-36 items-start gap-1.5 rounded-lg border bg-background p-2.5 text-xs shadow-md">
      <div className="border-b pb-1 font-semibold text-muted-foreground">
        {formatThaiDate(point.date)}
      </div>
      <div className="grid gap-1 pt-0.5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">ระดับพลังงาน</span>
          <span className="font-medium text-foreground">{energyLabel(payload[0].value)}</span>
        </div>
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

export function EnergyChart({ checkins, period }: { checkins: Checkin[]; period: number }) {
  const { activeDisruptor, setActiveDisruptor, handleMarkerHover, handleMarkerClick } =
    useDisruptorMarkers();

  const processedData = React.useMemo<EnergyPoint[]>(() => {
    const dates = getPastDates(period);
    return dates.map((dateStr) => {
      const checkin = checkins.find((c) => c.checkinDate === dateStr);
      return {
        day: formatShortThaiDate(dateStr).split(" ")[0],
        date: dateStr,
        disruptors: (checkin?.disruptors ?? []) as Disruptor[],
        note: checkin?.note ?? null,
        energyRaw: checkin ? (ENERGY_VALUE[checkin.energyLevel] ?? null) : null,
      };
    });
  }, [checkins, period]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">ระดับพลังงานร่างกาย (Energy Level Trend)</CardTitle>
        <CardDescription>ระดับพลังงานรายวัน ย้อนหลัง {period} วัน</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-2">
          <ChartContainer config={chartConfig} className="h-44 w-full overflow-x-clip">
            <BarChart data={processedData} margin={{ top: 10, right: 10, left: -25, bottom: 48 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
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
              <YAxis
                ticks={[1, 2, 3]}
                tickFormatter={energyLabel}
                domain={[0, 3.2]}
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip content={<EnergyTooltip />} />
              <Bar dataKey="energyRaw" name="energy" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>

          {activeDisruptor && (
            <DisruptorPopover active={activeDisruptor} onClose={() => setActiveDisruptor(null)} />
          )}
        </div>
        <DisruptorLegend />
      </CardContent>
    </Card>
  );
}
