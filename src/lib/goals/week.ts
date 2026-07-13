import { today } from "@/lib/checkins/date";

const DAY_MS = 86_400_000;

export function weekStart(isoDate = today()): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  const weekday = date.getUTCDay();
  const daysSinceMonday = (weekday + 6) % 7;
  return new Date(date.getTime() - daysSinceMonday * DAY_MS).toISOString().slice(0, 10);
}

export function weekDates(start = weekStart()): string[] {
  const base = Date.parse(`${start}T00:00:00Z`);
  return Array.from({ length: 7 }, (_, index) =>
    new Date(base + index * DAY_MS).toISOString().slice(0, 10)
  );
}
