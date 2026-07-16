import { describe, expect, it } from "vitest";
import { makeCheckins } from "@/lib/patterns/test-fixtures";
import { findForbiddenTerms } from "@/lib/safety/language";
import { fallbackGoal, suggestGoals, validateGoalTitle } from "./suggest";
import { MAX_ACTIVE_GOALS, SITUATIONS, SITUATION_LABELS } from "./types";
import { weekDates, weekStart } from "./week";

describe("weekStart", () => {
  it("คืนวันจันทร์ของสัปดาห์นั้นเสมอ", () => {
    expect(weekStart("2026-07-14")).toBe("2026-07-13");
    expect(weekStart("2026-07-13")).toBe("2026-07-13");
    expect(weekStart("2026-07-19")).toBe("2026-07-13");
    expect(weekStart("2026-07-20")).toBe("2026-07-20");
  });

  it("weekDates คืน 7 วันเรียงจากจันทร์", () => {
    const dates = weekDates("2026-07-13");
    expect(dates).toHaveLength(7);
    expect(dates[0]).toBe("2026-07-13");
    expect(dates[6]).toBe("2026-07-19");
  });
});

describe("suggestGoals", () => {
  it("วันที่มีเดดไลน์เยอะ ต้องได้ goal คนละแบบกับวันที่นั่งหน้าจอนาน (เกณฑ์ Personalization)", () => {
    const deadlineDays = makeCheckins(10, () => ({ disruptors: ["deadline" as const] }));
    const screenDays = makeCheckins(10, () => ({
      disruptors: ["long_meeting" as const],
      movementBlocker: "long_sitting" as const,
    }));

    const a = suggestGoals(deadlineDays, MAX_ACTIVE_GOALS).map((goal) => goal.situation);
    const b = suggestGoals(screenDays, MAX_ACTIVE_GOALS).map((goal) => goal.situation);

    expect(a).toContain("deadline");
    expect(b).toContain("long_screen");
    expect(a).not.toEqual(b);
  });

  it("เสนอไม่เกินจำนวนที่กำหนด", () => {
    const busy = makeCheckins(14, () => ({
      disruptors: ["deadline" as const, "commute" as const],
      skippedMeals: ["breakfast" as const],
      lateReason: "phone" as const,
      movementMinutes: 0,
      movementBlocker: "no_time" as const,
    }));
    expect(suggestGoals(busy, MAX_ACTIVE_GOALS).length).toBeLessThanOrEqual(MAX_ACTIVE_GOALS);
  });

  it("ไม่มีสัญญาณอะไรเลย ก็ยังเสนอ goal ได้ ไม่คืนค่าว่าง", () => {
    const calm = makeCheckins(10, () => ({ movementMinutes: 30, movementBlocker: null }));
    expect(suggestGoals(calm, MAX_ACTIVE_GOALS).length).toBeGreaterThan(0);
  });
});

describe("goal ทุกข้อต้องปลอดคำต้องห้าม (เกณฑ์ Safety — บังคับด้วย CI)", () => {
  it("goal สำรองของทุกสถานการณ์ ไม่มีคำต้องห้ามสักคำ", () => {
    const offenders = SITUATIONS.map((situation) => ({
      situation,
      terms: findForbiddenTerms(fallbackGoal(situation)),
    })).filter((result) => result.terms.length > 0);

    expect(offenders).toEqual([]);
  });

  it("ทุกสถานการณ์มีทั้งชื่อไทยและ goal สำรอง", () => {
    for (const situation of SITUATIONS) {
      expect(SITUATION_LABELS[situation]).toBeTruthy();
      expect(fallbackGoal(situation)).toBeTruthy();
    }
  });
});

describe("validateGoalTitle", () => {
  it("ปฏิเสธเป้าหมายที่พูดถึงน้ำหนัก/รูปร่าง/แคลอรี", () => {
    expect(validateGoalTitle("ลดน้ำหนัก 2 กิโลสัปดาห์นี้")).toContain("น้ำหนัก");
    expect(validateGoalTitle("กินไม่เกิน 1200 แคลอรีต่อวัน")).not.toBeNull();
  });

  it("ยอมรับก้าวเล็ก ๆ ที่ทำได้จริง", () => {
    expect(validateGoalTitle("เดินขึ้นบันไดแทนลิฟต์ 3 วัน")).toBeNull();
  });

  it("ปฏิเสธข้อความว่างและยาวเกิน", () => {
    expect(validateGoalTitle("   ")).not.toBeNull();
    expect(validateGoalTitle("ก".repeat(81))).toContain("ยาวเกิน");
  });

  it("ปฏิเสธเป้าหมายที่ให้อดอาหาร — FR-5.3 (เจอตอนรัน F3-02 ว่ารั่วจริง)", () => {
    expect(validateGoalTitle("อดข้าวเย็นทุกวัน")).not.toBeNull();
    expect(validateGoalTitle("อดอาหาร 16 ชั่วโมงต่อวัน")).not.toBeNull();
    expect(validateGoalTitle("อดมื้อเช้าเพื่อให้ผอมลง")).not.toBeNull();
    expect(validateGoalTitle("งดข้าวเย็น 3 วัน")).not.toBeNull();
    expect(validateGoalTitle("ลองทำคีโตสัปดาห์นี้")).not.toBeNull();
    expect(validateGoalTitle("ดีท็อกซ์ล้างพิษ 7 วัน")).not.toBeNull();
    expect(validateGoalTitle("เริ่ม intermittent fasting")).not.toBeNull();
  });

  it("คำต้องห้ามใหม่ต้องไม่เผลอปฏิเสธเป้าหมายที่ดี — 'อด' เดี่ยว ๆ อยู่ใน 'ตลอด' 'ปลอดภัย'", () => {
    expect(validateGoalTitle("เดินเล่นตลอดทางกลับบ้าน 10 นาที")).toBeNull();
    expect(validateGoalTitle("เลือกทางเดินที่ปลอดภัยตอนกลางคืน")).toBeNull();
    expect(validateGoalTitle("อดทนกับตัวเองในวันที่พลังงานน้อย")).toBeNull();
    expect(validateGoalTitle("กินข้าวเช้าให้ได้ 3 วัน")).toBeNull();
    expect(validateGoalTitle("ไม่ข้ามมื้อเช้าในวันที่เรียนเช้า")).toBeNull();
  });
});
