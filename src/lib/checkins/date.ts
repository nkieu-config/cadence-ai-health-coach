const TIMEZONE = "Asia/Bangkok";

const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function today(): string {
  return formatter.format(new Date());
}

export function shiftDate(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function daysAgo(days: number): string {
  return shiftDate(today(), -days);
}

export function formatThaiDate(isoDate: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

export function formatShortThaiDate(isoDate: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

export function formatThaiDateLong(isoDate: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}
