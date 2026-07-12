import { describe, expect, it } from "vitest";
import { MIN_DAYS_FOR_ANALYSIS, hasEnoughData } from "./index";
import { makeCheckins } from "./test-fixtures";

describe("hasEnoughData", () => {
  it("ข้อมูลน้อยกว่า 7 วัน = ยังวิเคราะห์ไม่ได้", () => {
    expect(hasEnoughData(makeCheckins(MIN_DAYS_FOR_ANALYSIS - 1))).toBe(false);
  });

  it("ข้อมูลครบ 7 วันขึ้นไป = วิเคราะห์ได้", () => {
    expect(hasEnoughData(makeCheckins(MIN_DAYS_FOR_ANALYSIS))).toBe(true);
  });
});

describe("makeCheckins (ตัวอย่างการสร้างข้อมูลเทสต์)", () => {
  it("ปรับค่าเฉพาะฟิลด์ที่สนใจได้ ที่เหลือใช้ค่า default", () => {
    const checkins = makeCheckins(10, (i) =>
      i % 3 === 0 ? { sleepHours: 5, skippedMeals: ["breakfast"], energyLevel: "low" } : {}
    );

    expect(checkins).toHaveLength(10);
    expect(checkins[0].sleepHours).toBe(5);
    expect(checkins[0].energyLevel).toBe("low");
    expect(checkins[1].sleepHours).toBe(7);
    expect(checkins[1].skippedMeals).toEqual([]);
  });
});
