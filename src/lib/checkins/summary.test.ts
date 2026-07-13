import { describe, expect, it } from "vitest";
import { makeCheckin } from "@/lib/patterns/test-fixtures";
import type {
  BedTimeBucket,
  Checkin,
  Disruptor,
  EnergyLevel,
  MovementType,
} from "@/lib/patterns/types";
import { findForbiddenTerms } from "@/lib/safety/language";
import { buildCheckinSummary } from "./summary";

const WORST_DAY = makeCheckin({
  mealsCount: 0,
  skippedMeals: ["breakfast", "lunch", "dinner"],
  sweetDrinks: 4,
  sleepHours: 3,
  bedTimeBucket: "after_02",
  sleepQuality: 1,
  lateReason: "work",
  movementTypes: ["none"],
  movementMinutes: 0,
  movementBlocker: "tired",
  energyLevel: "low",
  disruptors: ["deadline", "exam"],
});

function everyCheckin(): Checkin[] {
  const buckets: BedTimeBucket[] = ["before_23", "23_00", "00_01", "01_02", "after_02"];
  const energies: EnergyLevel[] = ["low", "medium", "high"];
  const movements: MovementType[][] = [["none"], ["walk"], ["stretch", "stairs"]];
  const disruptorSets: Disruptor[][] = [[], ["none"], ["deadline"], ["exam", "commute"]];

  const checkins: Checkin[] = [];
  for (const bedTimeBucket of buckets) {
    for (const energyLevel of energies) {
      for (const movementTypes of movements) {
        for (const disruptors of disruptorSets) {
          for (let mealsCount = 0; mealsCount <= 3; mealsCount++) {
            checkins.push(
              makeCheckin({
                mealsCount,
                skippedMeals: ["breakfast", "lunch", "dinner"].slice(
                  0,
                  3 - mealsCount
                ) as Checkin["skippedMeals"],
                bedTimeBucket,
                energyLevel,
                movementTypes,
                movementMinutes: movementTypes.includes("none") ? 0 : 20,
                movementBlocker: movementTypes.includes("none") ? "no_time" : null,
                disruptors,
              })
            );
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
        sweetDrinks: 2,
        sleepHours: 5.5,
        bedTimeBucket: "after_02",
        sleepQuality: 2,
        movementTypes: ["walk"],
        movementMinutes: 20,
      })
    );

    expect(summary.lines).toEqual([
      "กิน 2 มื้อ · ข้ามเช้า · เครื่องดื่มหวาน 2 แก้ว",
      "นอน 5.5 ชม. · เข้านอน หลัง 02:00 · คุณภาพการนอนที่ประเมินเอง 2/5",
      "เดิน 20 นาที",
    ]);
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
