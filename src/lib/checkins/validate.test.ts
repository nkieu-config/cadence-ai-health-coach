import { describe, expect, it } from "vitest";
import { makeCheckin } from "@/test/fixtures";
import type { Checkin } from "@/lib/domain";
import { daysAgo, today } from "./date";
import { MAX_BACKFILL_DAYS, isWithinBackfillWindow, validateCheckin } from "./validate";

const TODAY = "2026-07-14";

describe("validateCheckin", () => {
  it("ผ่านเมื่อค่าถูกต้องครบ", () => {
    expect(validateCheckin(makeCheckin(), TODAY)).toBeNull();
  });

  it("กันบันทึกล่วงหน้า", () => {
    const future = makeCheckin({ checkinDate: "2026-07-15" });
    expect(validateCheckin(future, TODAY)).toBe("บันทึกล่วงหน้าไม่ได้");
  });

  it("กันบันทึกย้อนหลังเกินช่วงที่อนุญาต (พิมพ์ URL มั่ว)", () => {
    expect(validateCheckin(makeCheckin({ checkinDate: "2026-06-15" }), TODAY)).toBeNull();
    expect(validateCheckin(makeCheckin({ checkinDate: "2026-06-14" }), TODAY)).toContain(
      "ย้อนหลัง"
    );
    expect(validateCheckin(makeCheckin({ checkinDate: "2020-01-01" }), TODAY)).toContain(
      "ย้อนหลัง"
    );
  });

  it("ช่วงที่แก้ไขได้ ต้องเท่ากับช่วงที่หน้าประวัติแสดงเป๊ะ ๆ — ไม่งั้นจะมีบันทึกที่ลบไม่ได้", () => {
    const listed = Array.from({ length: MAX_BACKFILL_DAYS }, (_, index) => {
      const date = new Date(`${TODAY}T00:00:00Z`);
      date.setUTCDate(date.getUTCDate() - index);
      return date.toISOString().slice(0, 10);
    });

    const oldest = listed[listed.length - 1];
    const justOutside = new Date(`${oldest}T00:00:00Z`);
    justOutside.setUTCDate(justOutside.getUTCDate() - 1);

    for (const date of listed) {
      expect(isWithinBackfillWindow(date, TODAY)).toBe(true);
    }
    expect(isWithinBackfillWindow(justOutside.toISOString().slice(0, 10), TODAY)).toBe(false);
  });

  it("กันค่าที่ DB จะ reject (sleep_quality นอกช่วง 1–5)", () => {
    const bad = makeCheckin({ sleepQuality: 9 as 1 });
    expect(validateCheckin(bad, TODAY)).not.toBeNull();
  });

  it("กัน note ยาวเกิน 200 ตัวอักษร", () => {
    const bad = makeCheckin({ note: "ก".repeat(201) });
    expect(validateCheckin(bad, TODAY)).toContain("200");
  });
});

describe("validateCheckin — คอลัมน์ที่ DB ไม่มี check constraint", () => {
  it("กันค่าแปลกปลอมใน array (DB เป็น text[] เปล่า ๆ รับหมด)", () => {
    expect(
      validateCheckin(makeCheckin({ disruptors: ["ฟิชชิ่ง" as "exam"] }), TODAY)
    ).not.toBeNull();
    expect(
      validateCheckin(makeCheckin({ movementTypes: ["brunch" as "walk"] }), TODAY)
    ).not.toBeNull();
    expect(
      validateCheckin(makeCheckin({ skippedMeals: ["brunch" as "lunch"] }), TODAY)
    ).not.toBeNull();
  });

  it("กันค่าแปลกปลอมในฟิลด์ที่เว้นว่างได้", () => {
    expect(
      validateCheckin(makeCheckin({ mealFeeling: "great" as "sleepy" }), TODAY)
    ).not.toBeNull();
    expect(validateCheckin(makeCheckin({ lateReason: "netflix" as "work" }), TODAY)).not.toBeNull();
    expect(
      validateCheckin(makeCheckin({ movementBlocker: "lazy" as "tired" }), TODAY)
    ).not.toBeNull();
  });

  it("ยอมให้ฟิลด์ที่เว้นว่างได้เป็น null", () => {
    const skipped = makeCheckin({ mealFeeling: null, lateReason: null, movementBlocker: null });
    expect(validateCheckin(skipped, TODAY)).toBeNull();
  });

  it("กันค่าซ้ำใน array", () => {
    const dup = makeCheckin({ disruptors: ["exam", "exam"] });
    expect(validateCheckin(dup, TODAY)).not.toBeNull();
  });
});

describe("validateCheckin — ความขัดแย้งข้ามฟิลด์", () => {
  it("กินครบ 3 มื้อ แต่บอกว่าข้ามมื้อเช้า = ขัดแย้ง", () => {
    const contradictory = makeCheckin({ mealsCount: 3, skippedMeals: ["breakfast"] });
    expect(validateCheckin(contradictory, TODAY)).toContain("ขัดแย้ง");
  });

  it("กิน 2 มื้อ ข้าม 1 มื้อ = ผ่าน · ข้าม 2 มื้อ = ขัดแย้ง", () => {
    expect(
      validateCheckin(makeCheckin({ mealsCount: 2, skippedMeals: ["breakfast"] }), TODAY)
    ).toBeNull();
    expect(
      validateCheckin(makeCheckin({ mealsCount: 2, skippedMeals: ["breakfast", "lunch"] }), TODAY)
    ).not.toBeNull();
  });

  it("บอกว่าไม่ได้ขยับเลย แต่มีนาทีเคลื่อนไหว = ขัดแย้ง", () => {
    const contradictory = makeCheckin({ movementTypes: ["none"], movementMinutes: 30 });
    expect(validateCheckin(contradictory, TODAY)).not.toBeNull();
  });

  it("ไม่เลือกการเคลื่อนไหวเลย แต่มีนาที = ขัดแย้ง (ฟอร์มกันไว้ แต่ server ต้องกันด้วย)", () => {
    const contradictory = makeCheckin({ movementTypes: [], movementMinutes: 20 });
    expect(validateCheckin(contradictory, TODAY)).not.toBeNull();
  });

  it("เลือก none พร้อมตัวเลือกอื่นไม่ได้", () => {
    expect(
      validateCheckin(makeCheckin({ movementTypes: ["none", "walk"], movementMinutes: 0 }), TODAY)
    ).not.toBeNull();
    expect(validateCheckin(makeCheckin({ disruptors: ["none", "exam"] }), TODAY)).not.toBeNull();
  });

  it("ไม่ได้กินเลย แต่มีเวลามื้อแรก/ความรู้สึกหลังกิน = ขัดแย้ง", () => {
    const noMeals: Partial<Checkin> = {
      mealsCount: 0,
      skippedMeals: ["breakfast", "lunch", "dinner"],
    };
    expect(
      validateCheckin(makeCheckin({ ...noMeals, firstMealTime: null, mealFeeling: null }), TODAY)
    ).toBeNull();
    expect(
      validateCheckin(makeCheckin({ ...noMeals, firstMealTime: "before_9" }), TODAY)
    ).not.toBeNull();
    expect(
      validateCheckin(
        makeCheckin({ ...noMeals, firstMealTime: null, mealFeeling: "sleepy" }),
        TODAY
      )
    ).not.toBeNull();
  });

  it("ไม่ได้ขยับ แต่มีความรู้สึกหลังขยับ = ขัดแย้ง", () => {
    const still: Partial<Checkin> = { movementTypes: ["none"], movementMinutes: 0 };
    expect(validateCheckin(makeCheckin({ ...still, movementFeeling: null }), TODAY)).toBeNull();
    expect(
      validateCheckin(makeCheckin({ ...still, movementFeeling: "refreshed" }), TODAY)
    ).not.toBeNull();
  });

  it("ค่านอกรายการของฟิลด์ใหม่ ถูก reject (ยิง API ตรงก็ไม่ผ่าน)", () => {
    const badMealTime = makeCheckin({ firstMealTime: "midnight" as never });
    expect(validateCheckin(badMealTime, TODAY)).not.toBeNull();

    const badFood = makeCheckin({ foodTypes: ["pizza"] as never });
    expect(validateCheckin(badFood, TODAY)).not.toBeNull();

    const badFeeling = makeCheckin({ movementFeeling: "amazing" as never });
    expect(validateCheckin(badFeeling, TODAY)).not.toBeNull();
  });
});

describe("date", () => {
  it("today() คืนรูปแบบ YYYY-MM-DD", () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("daysAgo(0) คือวันนี้ และย้อนหลังได้ถูกวัน", () => {
    expect(daysAgo(0)).toBe(today());
    const [start, end] = [daysAgo(6), daysAgo(0)];
    const diffDays =
      (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000;
    expect(diffDays).toBe(6);
  });
});
