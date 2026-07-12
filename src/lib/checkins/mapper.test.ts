import { describe, expect, it } from "vitest";
import { makeCheckin } from "@/lib/patterns/test-fixtures";
import { toCheckin, toRow } from "./mapper";
import type { CheckinRow } from "./types";

const USER_ID = "00000000-0000-0000-0000-000000000001";

describe("toCheckin", () => {
  it("แปลง snake_case จาก DB เป็น camelCase ตาม type Checkin", () => {
    const row: CheckinRow = {
      checkin_date: "2026-07-12",
      meals_count: 2,
      skipped_meals: ["breakfast"],
      sweet_drinks: 2,
      meal_feeling: "hungry_fast",
      sleep_hours: 5.5,
      bed_time_bucket: "after_02",
      sleep_quality: 2,
      late_reason: "work",
      movement_types: ["walk"],
      movement_minutes: 15,
      movement_blocker: "no_time",
      energy_level: "low",
      disruptors: ["deadline"],
      note: "คืนก่อน deadline",
    };

    expect(toCheckin(row)).toEqual({
      checkinDate: "2026-07-12",
      mealsCount: 2,
      skippedMeals: ["breakfast"],
      sweetDrinks: 2,
      mealFeeling: "hungry_fast",
      sleepHours: 5.5,
      bedTimeBucket: "after_02",
      sleepQuality: 2,
      lateReason: "work",
      movementTypes: ["walk"],
      movementMinutes: 15,
      movementBlocker: "no_time",
      energyLevel: "low",
      disruptors: ["deadline"],
      note: "คืนก่อน deadline",
    });
  });

  it("null จาก DB กลายเป็น array ว่าง / 0 ไม่ใช่ null", () => {
    const row = {
      ...({} as CheckinRow),
      checkin_date: "2026-07-12",
      meals_count: 3,
      skipped_meals: null,
      sweet_drinks: null,
      meal_feeling: null,
      sleep_hours: 7,
      bed_time_bucket: "23_00",
      sleep_quality: 4,
      late_reason: null,
      movement_types: null,
      movement_minutes: null,
      movement_blocker: null,
      energy_level: "high",
      disruptors: null,
      note: null,
    } satisfies CheckinRow;

    const checkin = toCheckin(row);
    expect(checkin.skippedMeals).toEqual([]);
    expect(checkin.movementTypes).toEqual([]);
    expect(checkin.disruptors).toEqual([]);
    expect(checkin.sweetDrinks).toBe(0);
    expect(checkin.movementMinutes).toBe(0);
  });

  it("sleep_hours ที่ Postgres ส่งมาเป็น string ถูกแปลงเป็นตัวเลข", () => {
    const row = { ...({} as CheckinRow), sleep_hours: "6.5" } as CheckinRow;
    expect(toCheckin(row).sleepHours).toBe(6.5);
  });
});

describe("toRow", () => {
  it("แปลงกลับเป็น snake_case + แนบ user_id", () => {
    const row = toRow(makeCheckin({ sleepHours: 5, energyLevel: "low" }), USER_ID);
    expect(row.user_id).toBe(USER_ID);
    expect(row.sleep_hours).toBe(5);
    expect(row.energy_level).toBe("low");
    expect(row.checkin_date).toBe(makeCheckin().checkinDate);
  });
});

describe("round-trip", () => {
  it("toCheckin(toRow(x)) ต้องได้ x กลับมาเป๊ะ — กันลืมแก้ mapper ตอนเพิ่มฟิลด์", () => {
    const original = makeCheckin({
      mealsCount: 2,
      skippedMeals: ["breakfast", "lunch"],
      sweetDrinks: 3,
      mealFeeling: "sleepy",
      sleepHours: 5.5,
      bedTimeBucket: "01_02",
      sleepQuality: 2,
      lateReason: "exam",
      movementTypes: ["stretch", "stairs"],
      movementMinutes: 30,
      movementBlocker: "tired",
      energyLevel: "medium",
      disruptors: ["exam", "commute"],
      note: "อ่านสอบถึงตี 1",
    });

    const row = toRow(original, USER_ID) as unknown as CheckinRow;
    expect(toCheckin(row)).toEqual(original);
  });
});
