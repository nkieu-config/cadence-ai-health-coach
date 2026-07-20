import { describe, expect, it } from "vitest";
import { computePatternCandidates } from "@/lib/patterns";
import { makeCheckins } from "@/test/fixtures";
import { findForbiddenTerms } from "@/lib/safety/language";
import { formatBedTime, formatMetric } from "./format";
import { toInsightPattern } from "./templates";

const REVEALING_DAYS = makeCheckins(14, (i) => {
  const hard = i % 3 === 0;
  return {
    sleepHours: hard ? 5 : 7,
    skippedMeals: hard ? (["breakfast"] as const) : [],
    sweetDrinks: hard ? 3 : 0,
    bedTimeBucket: hard ? ("after_02" as const) : ("23_00" as const),
    sleepQuality: hard ? (2 as const) : (4 as const),
    movementTypes: hard ? (["none"] as const) : (["walk"] as const),
    movementMinutes: hard ? 0 : 25,
    energyLevel: hard ? ("low" as const) : ("high" as const),
    disruptors: hard ? (["deadline"] as const) : [],
  };
});

describe("formatBedTime", () => {
  it("แปลงสเกล 'ชั่วโมงหลัง 20:00' กลับเป็นเวลานาฬิกาที่คนอ่านรู้เรื่อง", () => {
    expect(formatBedTime(2.5)).toBe("22:30");
    expect(formatBedTime(3.5)).toBe("23:30");
    expect(formatBedTime(4.5)).toBe("00:30");
    expect(formatBedTime(7)).toBe("03:00");
  });
});

describe("formatMetric", () => {
  it("อัตราส่วนแสดงเป็นเปอร์เซ็นต์ ค่าเฉลี่ยแสดงพร้อมหน่วย", () => {
    expect(formatMetric("skip_breakfast_rate", 0.75)).toBe("75%");
    expect(formatMetric("sweet_drinks_avg", 2.5)).toBe("2.5 แก้ว/วัน");
    expect(formatMetric("movement_minutes_avg", 24.6)).toBe("25 นาที/วัน");
    expect(formatMetric("sleep_quality_next_day", 4)).toBe("4/5");
  });
});

describe("toInsightPattern — สะพานจาก lib/patterns มาเป็นสิ่งที่ UI วาดได้", () => {
  it("candidate ทุกตัวที่ lib/patterns ผลิตได้ ต้องมี template รองรับ (ไม่หล่นหาย)", () => {
    const candidates = computePatternCandidates(REVEALING_DAYS);
    expect(candidates.length).toBeGreaterThan(0);

    const dropped = candidates.filter((candidate) => toInsightPattern(candidate) === null);
    expect(dropped.map((candidate) => candidate.id)).toEqual([]);
  });

  it("evidence ต้องเป็นตัวเลขจริงจาก lib/patterns — AI มโนไม่ได้", () => {
    const candidate = computePatternCandidates(REVEALING_DAYS)[0];
    const pattern = toInsightPattern(candidate)!;

    expect(pattern.evidence.groupA).toEqual(candidate.groupA);
    expect(pattern.evidence.groupB).toEqual(candidate.groupB);
  });

  it("ข้อความทุกบรรทัดต้องไม่มีคำต้องห้าม และต้องพูดแบบ 'สัญญาณ' ไม่ใช่ 'ข้อสรุป'", () => {
    for (const candidate of computePatternCandidates(REVEALING_DAYS)) {
      const pattern = toInsightPattern(candidate)!;
      const text = [pattern.observation, pattern.meaning, pattern.nextStep].join(" ");

      expect(findForbiddenTerms(text)).toEqual([]);
      expect(pattern.meaning).toContain("สัญญาณ");
    }
  });
});
