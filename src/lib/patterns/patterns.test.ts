import { describe, expect, it } from "vitest";
import type { Checkin } from "@/lib/domain";
import {
  ACTIVE_MOVEMENT_MINUTES,
  MIN_DAYS_FOR_ANALYSIS,
  bedTimeHours,
  computePatternCandidates,
  hasEnoughData,
} from "./index";
import { makeCheckins, withMissingDays } from "@/test/fixtures";

const find = (checkins: Checkin[], id: string) =>
  computePatternCandidates(checkins).find((candidate) => candidate.id === id);

describe("hasEnoughData", () => {
  it("ข้อมูลน้อยกว่า 7 วัน = ยังวิเคราะห์ไม่ได้", () => {
    expect(hasEnoughData(makeCheckins(MIN_DAYS_FOR_ANALYSIS - 1))).toBe(false);
  });

  it("ข้อมูลครบ 7 วันขึ้นไป = วิเคราะห์ได้", () => {
    expect(hasEnoughData(makeCheckins(MIN_DAYS_FOR_ANALYSIS))).toBe(true);
  });
});

describe("makeCheckins", () => {
  it("ปรับค่าเฉพาะฟิลด์ที่สนใจได้ ที่เหลือใช้ค่า default", () => {
    const checkins = makeCheckins(10, (i) =>
      i % 3 === 0 ? { sleepHours: 5, skippedMeals: ["breakfast"], energyLevel: "low" } : {}
    );

    expect(checkins).toHaveLength(10);
    expect(checkins[0].sleepHours).toBe(5);
    expect(checkins[1].sleepHours).toBe(7);
    expect(checkins[1].skippedMeals).toEqual([]);
  });

  it("เรียงวันที่จากเก่าไปใหม่ ตรงกับที่ getCheckins() คืนมาจริง", () => {
    const dates = makeCheckins(5).map((checkin) => checkin.checkinDate);
    expect(dates).toEqual([...dates].sort());
  });
});

describe("bedTimeHours", () => {
  it("ยิ่งนอนดึก ตัวเลขยิ่งมาก — ห้ามวนกลับหลังเที่ยงคืน", () => {
    const scale = (["before_23", "23_00", "00_01", "01_02", "after_02"] as const).map(bedTimeHours);
    expect(scale).toEqual([...scale].sort((a, b) => a - b));
    expect(new Set(scale).size).toBe(scale.length);
  });
});

describe("computePatternCandidates", () => {
  it("ข้อมูลน้อยกว่า 7 วัน = ไม่คืน candidate เลย", () => {
    expect(computePatternCandidates(makeCheckins(6))).toEqual([]);
  });

  it("เจอ pattern นอนน้อย × ข้ามมื้อเช้า", () => {
    const checkins = makeCheckins(8, (i) =>
      i < 4 ? { sleepHours: 5, skippedMeals: ["breakfast"] } : { sleepHours: 7, skippedMeals: [] }
    );

    const candidate = find(checkins, "sleep-eating-skip-breakfast");
    expect(candidate).toBeDefined();
    expect(candidate!.groupA.value).toBe(1);
    expect(candidate!.groupB.value).toBe(0);
  });

  it("ทุกวันเหมือนกันหมด = ไม่มี pattern อะไรเลย", () => {
    expect(computePatternCandidates(makeCheckins(14))).toEqual([]);
  });

  it("ต่างกันน้อยกว่า 20% = ไม่นับเป็น pattern", () => {
    const checkins = makeCheckins(10, (i) => ({
      sleepHours: i < 5 ? 5 : 7,
      skippedMeals: i === 0 || i === 5 ? ["breakfast"] : [],
    }));

    expect(find(checkins, "sleep-eating-skip-breakfast")).toBeUndefined();
  });

  it("กลุ่มเล็กกว่า 3 วัน = ข้ามไป ไม่สรุปจากข้อมูลน้อย", () => {
    const checkins = makeCheckins(10, (i) => ({
      sleepHours: i < 2 ? 5 : 7,
      skippedMeals: i < 2 ? ["breakfast"] : [],
    }));

    expect(find(checkins, "sleep-eating-skip-breakfast")).toBeUndefined();
  });

  it("ส่งข้อมูลมาสลับลำดับ ก็ต้องได้ผลเท่าเดิม", () => {
    const checkins = makeCheckins(10, (i) => ({ sleepHours: i < 5 ? 5 : 7 }));
    expect(computePatternCandidates([...checkins].reverse())).toEqual(
      computePatternCandidates(checkins)
    );
  });
});

describe("นอนดึกข้ามเที่ยงคืน — ห้ามสรุปกลับด้าน", () => {
  it("วัน deadline นอนหลังตี 2 ทุกวัน ต้องถูกนับว่าดึกกว่าวันปกติ (ที่นอนก่อนเที่ยงคืนบ้าง หลังบ้าง)", () => {
    const checkins = makeCheckins(10, (i) => {
      if (i < 4) return { disruptors: ["deadline"], bedTimeBucket: "after_02" };
      if (i < 7) return { bedTimeBucket: "before_23" };
      return { bedTimeBucket: "00_01" };
    });

    const candidate = find(checkins, "deadline-sleep-bedtime");
    expect(candidate).toBeDefined();
    expect(candidate!.groupA.value).toBeGreaterThan(candidate!.groupB.value);
  });
});

describe("ข้อมูลขาดวัน — 'วันถัดไป' ต้องเป็นวันถัดไปตามปฏิทินจริง", () => {
  it("วันที่ไม่ติดกันห้ามถูกจับคู่เป็นคืนถัดไป", () => {
    const full = makeCheckins(12, (i) => ({
      movementMinutes: i <= 5 ? 30 : 0,
      sleepQuality: i <= 5 ? 5 : 2,
    }));
    const gapped = withMissingDays(full, 6, 7);

    const candidate = find(gapped, "movement-next-day-sleep");
    expect(candidate).toBeDefined();
    expect(candidate!.groupA.days).toBe(5);
    expect(candidate!.groupA.value).toBe(5);
    expect(candidate!.groupB.days).toBe(3);
    expect(candidate!.groupB.value).toBe(2);
  });

  it("ขาดวันจนไม่มีวันติดกันเลย = ไม่สรุปเรื่องวันถัดไป", () => {
    const everyOtherDay = makeCheckins(20, (i) => ({
      movementMinutes: i % 2 === 0 ? 30 : 0,
    })).filter((_, index) => index % 2 === 0);

    expect(find(everyOtherDay, "movement-next-day-sleep")).toBeUndefined();
    expect(find(everyOtherDay, "movement-next-day-energy")).toBeUndefined();
  });
});

describe("ครบทุก metric ตาม docs/07", () => {
  it("นอนน้อย × เครื่องดื่มหวาน · deadline × เคลื่อนไหว · ขยับ × พลังงานวันถัดไป", () => {
    const checkins = makeCheckins(12, (i) => {
      const pressured = i < 5;
      return {
        sleepHours: pressured ? 5 : 7,
        sweetDrinks: pressured ? 3 : 0,
        disruptors: pressured ? ["deadline"] : [],
        movementMinutes: pressured ? 0 : ACTIVE_MOVEMENT_MINUTES + 5,
        energyLevel: pressured ? "low" : "high",
      };
    });

    const ids = computePatternCandidates(checkins).map((candidate) => candidate.id);
    expect(ids).toContain("sleep-eating-sweet-drinks");
    expect(ids).toContain("deadline-movement-minutes");
    expect(ids).toContain("movement-next-day-energy");
  });
});
