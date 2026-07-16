import { describe, expect, it } from "vitest";
import type { Goal } from "@/lib/goals/types";
import { findForbiddenTerms } from "@/lib/safety/language";
import { makeCheckins } from "@/lib/patterns/test-fixtures";
import {
  buildWeekComparison,
  buildWeekFacts,
  MIN_DAYS_FOR_REFLECTION,
  REFLECTION_DAYS,
  shortReflection,
  templateReflection,
} from "./reflection-facts";

const goals: Goal[] = [
  {
    id: "g1",
    weekStart: "2026-07-13",
    title: "เตรียมมื้อเช้าคืนก่อนวันเรียนเช้า",
    situation: "early_class",
    status: "active",
    progressDates: ["2026-07-13", "2026-07-14"],
  },
  {
    id: "g2",
    weekStart: "2026-07-13",
    title: "เป้าหมายที่พับไปแล้ว",
    situation: null,
    status: "dropped",
    progressDates: [],
  },
];

describe("buildWeekFacts", () => {
  it("แยกสถิติวันมี/ไม่มีสิ่งรบกวนตารางถูกต้อง", () => {
    const checkins = makeCheckins(4, (index) =>
      index < 2
        ? { disruptors: ["deadline" as const], sleepHours: 4, movementMinutes: 0 }
        : { disruptors: ["none" as const], sleepHours: 8, movementMinutes: 30 }
    );

    const facts = buildWeekFacts(checkins, [], 7);

    expect(facts.daysRecorded).toBe(4);
    expect(facts.eating.disruptorDays).toBe(2);
    expect(facts.eating.calmDays).toBe(2);
    expect(facts.sleep.avgHoursDisruptor).toBe(4);
    expect(facts.sleep.avgHoursCalm).toBe(8);
    expect(facts.movement.avgMinutesDisruptor).toBe(0);
    expect(facts.movement.avgMinutesCalm).toBe(30);
  });

  it("แปลง goal เป็น fact พร้อมป้ายไทยของสถานการณ์ และ dropped ก็ยังโผล่ (ไม่กรองทิ้ง)", () => {
    const facts = buildWeekFacts(makeCheckins(3), goals, 7);

    expect(facts.goals).toHaveLength(2);
    expect(facts.goals[0]).toEqual({
      title: "เตรียมมื้อเช้าคืนก่อนวันเรียนเช้า",
      situation: "มีเรียนหรือทำงานเช้า",
      status: "active",
      daysTicked: 2,
    });
    expect(facts.goals[1].status).toBe("dropped");
  });

  it("ไม่มี checkin เลย ไม่พัง (divide by zero) และคืน 0 ทุกอัตรา", () => {
    const facts = buildWeekFacts([], [], 7);
    expect(facts.eating.skipRateDisruptor).toBe(0);
    expect(facts.sleep.avgHoursCalm).toBe(0);
  });
});

describe("templateReflection", () => {
  it("ไม่มีคำต้องห้ามสักคำในทุกฟิลด์ (fallback ต้องปลอดภัยเสมอ)", () => {
    const facts = buildWeekFacts(makeCheckins(7), goals, 7);
    const text = templateReflection(facts);
    const combined = `${text.eating} ${text.sleep} ${text.movement} ${text.strengths} ${text.nextWeek}`;
    expect(findForbiddenTerms(combined)).toEqual([]);
  });

  it("ใช้ตัวเลขจริงจาก facts ไม่ใช่ค่าคงที่", () => {
    const facts = buildWeekFacts(makeCheckins(5), goals, 7);
    const text = templateReflection(facts);
    expect(text.eating).toContain(String(facts.eating.completeDays));
    expect(text.strengths).toContain(String(facts.daysRecorded));
  });
});

describe("shortReflection", () => {
  it("ใช้เมื่อบันทึกน้อยกว่าเกณฑ์ และไม่มีคำต้องห้าม", () => {
    expect(MIN_DAYS_FOR_REFLECTION).toBe(3);
    const reflection = shortReflection(1, 7);
    expect(reflection.daysRecorded).toBe(1);
    expect(reflection.pillars).toHaveLength(3);

    const combined = [
      ...reflection.pillars.map((p) => p.summary),
      reflection.strengths,
      reflection.nextWeek,
    ].join(" ");
    expect(findForbiddenTerms(combined)).toEqual([]);
  });
});

describe("buildWeekComparison", () => {
  const facts = (checkins: Parameters<typeof buildWeekFacts>[0]) =>
    buildWeekFacts(checkins, [], REFLECTION_DAYS);

  it("บอกส่วนต่างของค่าที่เทียบกันได้จริง (เกณฑ์ Reflection and Improvement)", () => {
    const previous = facts(
      makeCheckins(4, () => ({ sleepHours: 5, movementMinutes: 10, skippedMeals: ["breakfast"] }))
    );
    const current = facts(makeCheckins(6, () => ({ sleepHours: 7, movementMinutes: 25 })));

    const comparison = buildWeekComparison(current, previous, "2026-07-03", "2026-07-09");
    const by = (metric: string) => comparison?.changes.find((c) => c.metric === metric);

    expect(comparison?.previousStart).toBe("2026-07-03");
    expect(comparison?.daysRecordedPrevious).toBe(4);
    expect(by("daysRecorded")).toMatchObject({ current: 6, previous: 4, delta: 2 });
    expect(by("sleepHours")).toMatchObject({ current: 7, previous: 5, delta: 2 });
    expect(by("movementMinutes")).toMatchObject({ current: 25, previous: 10, delta: 15 });
    expect(by("completeMealRate")).toMatchObject({ current: 1, previous: 0, delta: 1 });
  });

  it("สัปดาห์ก่อนไม่มีบันทึกเลย → คืน null ไม่หารศูนย์ ไม่โชว์ส่วนต่างมั่ว", () => {
    const current = facts(makeCheckins(5));
    expect(buildWeekComparison(current, facts([]), "2026-07-03", "2026-07-09")).toBeNull();
  });

  it("เทียบเป็นค่าเฉลี่ยต่อวัน ไม่ใช่ผลรวม — จำนวนวันบันทึกต่างกันจึงไม่หลอกตา", () => {
    const previous = facts(makeCheckins(2, () => ({ movementMinutes: 30 })));
    const current = facts(makeCheckins(7, () => ({ movementMinutes: 30 })));

    const comparison = buildWeekComparison(current, previous, "2026-07-03", "2026-07-09");
    const movement = comparison?.changes.find((c) => c.metric === "movementMinutes");

    expect(movement?.delta).toBe(0);
  });

  it("ปัดเศษให้อ่านง่าย ไม่หลุดทศนิยมยาว", () => {
    const previous = facts(makeCheckins(3, (i) => ({ sleepHours: [5, 6, 8][i] })));
    const current = facts(makeCheckins(3, (i) => ({ sleepHours: [7, 7, 8][i] })));

    const sleep = buildWeekComparison(current, previous, "2026-07-03", "2026-07-09")?.changes.find(
      (c) => c.metric === "sleepHours"
    );

    expect(sleep).toMatchObject({ current: 7.3, previous: 6.3, delta: 1 });
  });
});
