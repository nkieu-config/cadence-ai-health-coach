import Link from "next/link";
import { cn } from "@/lib/utils";
import { PendingBar } from "@/components/nav-pending";

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
    <nav
      aria-label="เลือกช่วงเวลา"
      className="flex w-full gap-1 rounded-full border bg-muted/40 p-1 lg:w-auto"
    >
      {DASHBOARD_PERIODS.map((days) => {
        const active = days === period;
        return (
          <Link
            key={days}
            href={`/dashboard?days=${days}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative inline-flex min-h-11 flex-1 items-center justify-center rounded-full px-6 text-sm font-medium transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:opacity-70 lg:min-w-24 lg:flex-none",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-background hover:text-foreground"
            )}
          >
            {days} วัน
            <PendingBar />
          </Link>
        );
      })}
    </nav>
  );
}
