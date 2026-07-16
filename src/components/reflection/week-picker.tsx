import Link from "next/link";
import { PendingBar } from "@/components/nav-pending";
import { formatShortThaiDate } from "@/lib/checkins/date";
import { cn } from "@/lib/utils";

export type WeekOption = {
  periodStart: string;
  periodEnd: string;
};

export function pickWeek<T extends WeekOption>(
  weeks: T[],
  requested: string | undefined
): T | null {
  if (weeks.length === 0) return null;
  return weeks.find((week) => week.periodStart === requested) ?? weeks[0];
}

export function WeekPicker({ weeks, selected }: { weeks: WeekOption[]; selected: string }) {
  return (
    <nav aria-label="เลือกสัปดาห์" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
      <div className="flex w-max gap-1 rounded-full border bg-muted/40 p-1">
        {weeks.map((week, index) => {
          const active = week.periodStart === selected;
          return (
            <Link
              key={week.periodStart}
              href={`/reflection?week=${week.periodStart}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-medium whitespace-nowrap transition-colors active:opacity-70",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-background hover:text-foreground"
              )}
            >
              {index === 0 ? "สัปดาห์ล่าสุด" : formatShortThaiDate(week.periodStart)}
              <PendingBar />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
