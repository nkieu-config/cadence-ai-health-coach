import type { BedTimeBucket, Checkin } from "@/lib/domain";

const BED_TIME_RANGES: Record<BedTimeBucket, [number, number]> = {
  before_23: [22, 23],
  "23_00": [23, 24],
  "00_01": [24, 25],
  "01_02": [25, 26],
  after_02: [26, 27],
};

function clockLabel(hour: number) {
  return `${String(Math.floor(hour) % 24).padStart(2, "0")}:00`;
}

export function wakeTimeRange(checkin: Pick<Checkin, "bedTimeBucket" | "sleepHours">) {
  const [start, end] = BED_TIME_RANGES[checkin.bedTimeBucket];
  return `${clockLabel(start + checkin.sleepHours)}–${clockLabel(end + checkin.sleepHours)}`;
}
