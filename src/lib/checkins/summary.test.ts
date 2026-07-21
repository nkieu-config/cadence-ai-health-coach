import { describe, expect, it } from "vitest";
import { makeCheckin } from "@/test/fixtures";
import type {
  BedTimeBucket,
  Checkin,
  Disruptor,
  EnergyLevel,
  FirstMealTime,
  FoodType,
  MovementFeeling,
  MovementType,
} from "@/lib/domain";
import { findForbiddenTerms } from "@/lib/safety/language";
import { buildCheckinSummary } from "./summary";

const WORST_DAY = makeCheckin({
  mealsCount: 0,
  skippedMeals: ["breakfast", "lunch", "dinner"],
  firstMealTime: null,
  foodTypes: [],
  sweetDrinks: 4,
  mealFeeling: null,
  sleepHours: 3,
  bedTimeBucket: "after_02",
  sleepQuality: 1,
  lateReason: "work",
  movementTypes: ["none"],
  movementMinutes: 0,
  movementBlocker: "tired",
  movementFeeling: null,
  energyLevel: "low",
  disruptors: ["deadline", "exam"],
});

function everyCheckin(): Checkin[] {
  const buckets: BedTimeBucket[] = ["before_23", "23_00", "00_01", "01_02", "after_02"];
  const energies: EnergyLevel[] = ["low", "medium", "high"];
  const movements: MovementType[][] = [["none"], ["walk"], ["stretch", "stairs"]];
  const disruptorSets: Disruptor[][] = [[], ["none"], ["deadline"], ["exam", "commute"]];
  const mealTimes: (FirstMealTime | null)[] = [null, "before_9", "9_12", "after_12"];
  const foodTypeSets: FoodType[][] = [[], ["snack"], ["veg_fruit"], ["snack", "veg_fruit"]];
  const movementFeelings: (MovementFeeling | null)[] = [
    null,
    "refreshed",
    "relaxed",
    "tired",
    "no_change",
  ];

  const checkins: Checkin[] = [];
  for (const bedTimeBucket of buckets) {
    for (const energyLevel of energies) {
      for (const movementTypes of movements) {
        for (const disruptors of disruptorSets) {
          for (let mealsCount = 0; mealsCount <= 3; mealsCount++) {
            for (const firstMealTime of mealTimes) {
              for (const foodTypes of foodTypeSets) {
                for (const movementFeeling of movementFeelings) {
                  const didNotMove = movementTypes.includes("none");
                  checkins.push(
                    makeCheckin({
                      mealsCount,
                      skippedMeals: ["breakfast", "lunch", "dinner"].slice(
                        0,
                        3 - mealsCount
                      ) as Checkin["skippedMeals"],
                      firstMealTime: mealsCount === 0 ? null : firstMealTime,
                      foodTypes,
                      bedTimeBucket,
                      energyLevel,
                      movementTypes,
                      movementMinutes: didNotMove ? 0 : 20,
                      movementBlocker: didNotMove ? "no_time" : null,
                      movementFeeling: didNotMove ? null : movementFeeling,
                      disruptors,
                    })
                  );
                }
              }
            }
          }
        }
      }
    }
  }
  return checkins;
}

describe("buildCheckinSummary", () => {
  it("สรุป 3 บรรทัด: กิน / นอน / เคลื่อนไหว", () => {
    const summary = buildCheckinSummary(
      makeCheckin({
        mealsCount: 2,
        skippedMeals: ["breakfast"],
        firstMealTime: "after_12",
        foodTypes: ["veg_fruit"],
        sweetDrinks: 2,
        sleepHours: 5.5,
        bedTimeBucket: "after_02",
        sleepQuality: 2,
        movementTypes: ["walk"],
        movementMinutes: 20,
        movementFeeling: "refreshed",
      })
    );

    expect(summary.lines).toEqual([
      "กิน 2 มื้อ · มื้อแรก หลัง 12:00 · ข้ามเช้า · ผัก / ผลไม้ · เครื่องดื่มหวาน 2 แก้ว",
      "นอน 5.5 ชม. · เข้านอน หลัง 02:00 · ตื่นราว 07:00–08:00 · คุณภาพ 2/5",
      "เดิน 20 นาที · หลังขยับรู้สึกสดชื่นขึ้น",
    ]);

    expect(summary.entries.map((entry) => entry.pillar)).toEqual(["eating", "sleep", "movement"]);
  });

  it("เวลาตื่นนอน (โจทย์ 5.3) คำนวณจากเวลาเข้านอน + ชั่วโมงนอน ไม่ต้องถามซ้ำ", () => {
    const early = buildCheckinSummary(makeCheckin({ bedTimeBucket: "before_23", sleepHours: 8 }));
    expect(early.lines[1]).toContain("ตื่นราว 06:00–07:00");

    const late = buildCheckinSummary(makeCheckin({ bedTimeBucket: "00_01", sleepHours: 7 }));
    expect(late.lines[1]).toContain("ตื่นราว 07:00–08:00");
  });

  it("วันที่ไม่ได้ขยับ บอกอุปสรรคแทน ไม่ตำหนิ", () => {
    const summary = buildCheckinSummary(
      makeCheckin({ movementTypes: ["none"], movementMinutes: 0, movementBlocker: "tired" })
    );
    expect(summary.lines[2]).toBe("ไม่ได้ขยับ (เหนื่อยเกิน)");
  });

  it("ข้อมูลเก่าที่ไม่มีชนิดการเคลื่อนไหว ไม่ทำให้ขึ้นบรรทัดว่าง ๆ", () => {
    const summary = buildCheckinSummary(
      makeCheckin({ movementTypes: [], movementMinutes: 20, movementBlocker: null })
    );
    expect(summary.lines[2]).toBe("ไม่ได้ขยับ");
  });

  it("มี disruptor → ให้กำลังใจโดยอ้างถึงวันที่ยาก ไม่ใช่โทษผู้ใช้", () => {
    const summary = buildCheckinSummary(makeCheckin({ disruptors: ["deadline"] }));
    expect(summary.encouragement).toContain("เดดไลน์");
    expect(summary.encouragement).toContain("ขอบคุณ");
  });

  it("พลังงานต่ำ → ยอมรับว่าเป็นเรื่องปกติ", () => {
    const summary = buildCheckinSummary(makeCheckin({ energyLevel: "low" }));
    expect(summary.encouragement).toContain("เป็นเรื่องปกติ");
  });
});

describe("หลักภาษาใน CONTEXT.md — บังคับด้วย CI ไม่ใช่ด้วยสายตา", () => {
  it("วันที่ข้อมูลแย่ที่สุด ก็ยังไม่มีคำตัดสิน", () => {
    const summary = buildCheckinSummary(WORST_DAY);
    const text = [...summary.lines, summary.encouragement].join(" ");
    expect(findForbiddenTerms(text)).toEqual([]);
    expect(summary.encouragement).toContain("ขอบคุณ");
  });

  it("ทุกชุดข้อมูลที่เป็นไปได้ ไม่มีคำต้องห้ามหลุดออกมาสักคำ", () => {
    const offenders = everyCheckin()
      .map((checkin) => {
        const summary = buildCheckinSummary(checkin);
        const text = [...summary.lines, summary.encouragement].join(" ");
        return { text, terms: findForbiddenTerms(text) };
      })
      .filter((result) => result.terms.length > 0);

    expect(offenders).toEqual([]);
  });

  it("ทุกชุดข้อมูล ต้องมีข้อความให้กำลังใจเสมอ — แม้วันที่ขาดทุกอย่าง", () => {
    const missing = everyCheckin().filter(
      (checkin) => buildCheckinSummary(checkin).encouragement.trim().length === 0
    );
    expect(missing).toEqual([]);
  });
});

describe("findForbiddenTerms", () => {
  it("จับคำต้องห้ามตาม CONTEXT.md", () => {
    expect(findForbiddenTerms("ลองลดน้ำหนักดูนะ")).toContain("น้ำหนัก");
    expect(findForbiddenTerms("วันนี้คุณล้มเหลว")).toContain("ล้มเหลว");
    expect(findForbiddenTerms("กินน้อยไปทำให้คุณเพลีย")).toContain("ทำให้คุณ");
  });

  it("ข้อความที่ปลอดภัยผ่านฉลุย", () => {
    expect(findForbiddenTerms("ขอบคุณที่บันทึกวันนี้")).toEqual([]);
  });
});
