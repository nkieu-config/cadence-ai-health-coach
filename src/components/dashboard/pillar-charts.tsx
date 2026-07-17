"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts";
import type { Checkin } from "@/lib/domain";
import { daysAgo, formatShortThaiDate } from "@/lib/checkins/date";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

// 7/14/30 Days Chart Config
const chartConfig = {
  sleepHours: { label: "ชั่วโมงนอน (ชม.)", color: "var(--chart-1)" },
  mealsCount: { label: "มื้อที่กิน (มื้อ)", color: "var(--chart-2)" },
  sweetDrinks: { label: "เครื่องดื่มหวาน (แก้ว)", color: "var(--chart-5)" },
  movementMinutes: { label: "นาทีเคลื่อนไหว", color: "var(--chart-3)" },
} satisfies ChartConfig;

function getPastDates(daysCount: number): string[] {
  const dates: string[] = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    dates.push(daysAgo(i));
  }
  return dates;
}

export function PillarCharts({ checkins, period }: { checkins: Checkin[]; period: number }) {
  const [activeTab, setActiveTab] = React.useState<"sleep" | "eating" | "movement">("sleep");

  const processedData = React.useMemo(() => {
    const dates = getPastDates(period);
    return dates.map((dateStr) => {
      const checkin = checkins.find((c) => c.checkinDate === dateStr);
      const formattedDay = formatShortThaiDate(dateStr).split(" ")[0]; // Get only day number to keep X-axis clean

      if (!checkin) {
        return {
          day: formattedDay,
          sleepHours: null,
          mealsCount: null,
          sweetDrinks: null,
          movementMinutes: null,
        };
      }

      return {
        day: formattedDay,
        sleepHours: checkin.sleepHours,
        mealsCount: checkin.mealsCount,
        sweetDrinks: checkin.sweetDrinks,
        movementMinutes: checkin.movementMinutes,
      };
    });
  }, [checkins, period]);

  const categories = [
    { id: "sleep", label: "ชั่วโมงนอน" },
    { id: "eating", label: "การกิน" },
    { id: "movement", label: "การเคลื่อนไหว" },
  ] as const;

  return (
    <Card className="h-full flex flex-col justify-between">
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
                onClick={() => setActiveTab(cat.id)}
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
      <CardContent>
        {/* Sleep Chart */}
        {activeTab === "sleep" && (
          <div className="space-y-2">
            <ChartContainer config={chartConfig} className="h-44 w-full">
              <BarChart data={processedData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis domain={[0, 12]} axisLine={false} tickLine={false} />
                <ReferenceLine y={6} stroke="var(--destructive)" strokeDasharray="3 3" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="sleepHours"
                  name="sleepHours"
                  fill="var(--chart-1)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </div>
        )}

        {/* Eating Chart */}
        {activeTab === "eating" && (
          <div className="space-y-2">
            <ChartContainer config={chartConfig} className="h-44 w-full">
              <BarChart data={processedData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis domain={[0, "auto"]} axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
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
              </BarChart>
            </ChartContainer>
          </div>
        )}

        {/* Movement Chart */}
        {activeTab === "movement" && (
          <div className="space-y-2">
            <ChartContainer config={chartConfig} className="h-44 w-full">
              <BarChart data={processedData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis domain={[0, "auto"]} axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="movementMinutes"
                  name="movementMinutes"
                  fill="var(--chart-3)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
