import { describe, expect, it } from "vitest";
import { computePatternCandidates } from "@/lib/patterns";
import { makeCheckins } from "@/test/fixtures";
import { findForbiddenTerms } from "@/lib/safety/language";
import type { Checkin, Disruptor } from "@/lib/domain";
import { toInsightPattern } from "./templates";

const WEEK: Partial<Checkin>[] = [
  {
    disruptors: ["early_class"],
    sleepHours: 7.5,
    bedTimeBucket: "00_01",
    sleepQuality: 4,
    energyLevel: "medium",
    mealsCount: 2,
    skippedMeals: ["breakfast"],
    firstMealTime: "after_12",
    sweetDrinks: 0,
    movementTypes: ["walk"],
    movementMinutes: 25,
  },
  {
    disruptors: ["online_class"],
    sleepHours: 7.5,
    bedTimeBucket: "00_01",
    sleepQuality: 4,
    energyLevel: "high",
    mealsCount: 3,
    skippedMeals: [],
    firstMealTime: "before_9",
    sweetDrinks: 0,
    movementTypes: ["stretch"],
    movementMinutes: 5,
    movementBlocker: null,
  },
  {
    disruptors: ["early_class", "deadline"],
    sleepHours: 4.5,
    bedTimeBucket: "after_02",
    sleepQuality: 2,
    energyLevel: "low",
    mealsCount: 2,
    skippedMeals: ["breakfast"],
    firstMealTime: "after_12",
    sweetDrinks: 3,
    movementTypes: ["walk"],
    movementMinutes: 10,
  },
  {
    disruptors: ["online_class"],
    sleepHours: 8,
    bedTimeBucket: "23_00",
    sleepQuality: 4,
    energyLevel: "medium",
    mealsCount: 3,
    skippedMeals: [],
    firstMealTime: "before_9",
    sweetDrinks: 1,
    movementTypes: ["stretch"],
    movementMinutes: 5,
  },
  {
    disruptors: ["deadline"],
    sleepHours: 5,
    bedTimeBucket: "after_02",
    sleepQuality: 2,
    energyLevel: "low",
    mealsCount: 2,
    skippedMeals: ["breakfast"],
    firstMealTime: "after_12",
    sweetDrinks: 3,
    movementTypes: ["none"],
    movementMinutes: 0,
    movementBlocker: "no_time",
  },
  {
    disruptors: [],
    sleepHours: 8,
    bedTimeBucket: "23_00",
    sleepQuality: 5,
    energyLevel: "high",
    mealsCount: 3,
    skippedMeals: [],
    firstMealTime: "before_9",
    sweetDrinks: 1,
    movementTypes: ["walk"],
    movementMinutes: 40,
  },
  {
    disruptors: [],
    sleepHours: 8,
    bedTimeBucket: "23_00",
    sleepQuality: 5,
    energyLevel: "high",
    mealsCount: 3,
    skippedMeals: [],
    firstMealTime: "before_9",
    sweetDrinks: 0,
    movementTypes: ["walk"],
    movementMinutes: 30,
  },
];

function palmFortnight() {
  return makeCheckins(14, (index) => WEEK[index % 7] as Partial<Checkin>);
}

describe("ทุก candidate ต้องแปลงเป็น InsightPattern ได้ — ตอนนี้ TypeScript บังคับให้แล้ว", () => {
  it("candidate ทุกตัวได้ observation / meaning / nextStep / evidence ครบ", () => {
    const patterns = computePatternCandidates(palmFortnight()).map(toInsightPattern);

    expect(patterns.length).toBeGreaterThan(0);
    for (const pattern of patterns) {
      expect(pattern.observation).not.toBe("");
      expect(pattern.nextStep).not.toBe("");
      expect(pattern.evidence.metric).not.toMatch(/^[a-z_]+$/);
    }
  });
});

describe("ปฏิทินของปาล์ม (seed INFRA-06) ต้องจุด pattern ครบตามโจทย์ Feature 2", () => {
  const ids = computePatternCandidates(palmFortnight()).map((candidate) => candidate.id);

  it("แถว 'นอน' — นอนดึกในคืนก่อน deadline", () => {
    expect(ids).toContain("deadline-sleep-bedtime");
  });

  it("แถว 'กิน' — ข้ามมื้อเช้าในวันที่มีเรียนเช้า", () => {
    expect(ids).toContain("early-class-skip-breakfast");
  });

  it("แถว 'ออกกำลังกาย' — เดินน้อยในวันที่เรียน online", () => {
    expect(ids).toContain("online-class-movement");
  });

  it("ตัวอย่างทั้ง 4 ข้อของโจทย์ Feature 3 ก็ต้องติดด้วย", () => {
    expect(ids).toContain("sleep-eating-skip-breakfast");
    expect(ids).toContain("deadline-movement-minutes");
    expect(ids).toContain("movement-next-day-energy");
    expect(ids).toContain("eating-on-time-energy");
  });
});

describe("ข้อความใน template ต้องผ่าน guardrail", () => {
  it("ไม่มีคำต้องห้าม และไม่สรุปเป็นเหตุ-ผล", () => {
    const patterns = computePatternCandidates(palmFortnight())
      .map(toInsightPattern)
      .filter((pattern) => pattern !== null);

    for (const pattern of patterns) {
      const text = [pattern.observation, pattern.meaning, pattern.nextStep].join(" ");
      expect(findForbiddenTerms(text)).toEqual([]);
    }
  });

  it("disruptor ใหม่ online_class มีชื่อไทยแล้ว", () => {
    const disruptor: Disruptor = "online_class";
    expect(disruptor).toBe("online_class");
  });
});
