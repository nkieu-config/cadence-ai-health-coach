import type { Checkin } from "@/lib/domain";
import { formatThaiDate } from "@/lib/checkins/date";
import { DISRUPTOR_LABELS } from "@/lib/checkins/labels";

export type CoachOpener = {
  fact: string;
  question: string;
};

const MIN_DAYS_FOR_OPENER = 3;

const ENERGY_RANK = { low: 0, medium: 1, high: 2 } as const;

function namedDisruptors(checkin: Checkin): string[] {
  return (checkin.disruptors ?? [])
    .filter((d) => d && d !== "none")
    .map((d) => DISRUPTOR_LABELS[d])
    .filter(Boolean);
}

function lowestEnergyDay(checkins: Checkin[]): Checkin | null {
  let lowest: Checkin | null = null;
  for (const checkin of checkins) {
    if (!lowest || ENERGY_RANK[checkin.energyLevel] < ENERGY_RANK[lowest.energyLevel]) {
      lowest = checkin;
    }
  }
  return lowest && lowest.energyLevel !== "high" ? lowest : null;
}

function shortestSleepDay(checkins: Checkin[]): Checkin | null {
  let shortest: Checkin | null = null;
  for (const checkin of checkins) {
    if (!shortest || checkin.sleepHours < shortest.sleepHours) shortest = checkin;
  }
  return shortest;
}

export function buildCoachOpener(recent: Checkin[]): CoachOpener | null {
  if (recent.length < MIN_DAYS_FOR_OPENER) return null;

  const lowEnergy = lowestEnergyDay(recent);
  if (lowEnergy) {
    const disruptors = namedDisruptors(lowEnergy);
    return {
      fact: disruptors.length
        ? `${formatThaiDate(lowEnergy.checkinDate)} เป็นวันที่พลังงานต่ำที่สุดในช่วงนี้ และเป็นวันที่มี${disruptors.join(" · ")}ด้วย`
        : `${formatThaiDate(lowEnergy.checkinDate)} เป็นวันที่พลังงานต่ำที่สุดในช่วงนี้`,
      question: "วันนั้นเกิดอะไรขึ้นบ้าง",
    };
  }

  const shortSleep = shortestSleepDay(recent);
  if (shortSleep) {
    return {
      fact: `คืนที่นอนสั้นที่สุดช่วงนี้คือ ${formatThaiDate(shortSleep.checkinDate)} — นอน ${shortSleep.sleepHours} ชั่วโมง`,
      question: "คืนนั้นมีอะไรทำให้เข้านอนช้ากว่าปกติไหม",
    };
  }

  return null;
}
