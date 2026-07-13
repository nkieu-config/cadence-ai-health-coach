import Link from "next/link";
import { cn } from "@/lib/utils";

export const DASHBOARD_PERIODS = [7, 14, 30] as const;

export type DashboardPeriod = (typeof DASHBOARD_PERIODS)[number];

export const DEFAULT_PERIOD: DashboardPeriod = 14;
export const MAX_PERIOD: DashboardPeriod = 30;

export function parsePeriod(value: string | undefined): DashboardPeriod {
  const days = Number(value);
  return DASHBOARD_PERIODS.some((period) => period === days)
    ? (days as DashboardPeriod)
    : DEFAULT_PERIOD;
}

export function PeriodToggle({ period }: { period: DashboardPeriod }) {
  return (
    <nav aria-label="เลือกช่วงเวลา" className="inline-flex rounded-full border p-1">
      {DASHBOARD_PERIODS.map((days) => {
        const active = days === period;
        return (
          <Link
            key={days}
            href={`/dashboard?days=${days}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-9 items-center rounded-full px-4 text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {days} วัน
          </Link>
        );
      })}
    </nav>
  );
}
