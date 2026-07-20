import { describe, expect, it } from "vitest";
import type { Insight } from "@/lib/ai-outputs/types";
import type { Goal } from "@/lib/goals/types";
import { makeCheckins } from "@/test/fixtures";
import { type CoachContextData, formatCoachContext } from "./context-format";

const checkins = makeCheckins(2, (index) =>
  index === 0
    ? {
        sleepHours: 4,
        mealsCount: 2,
        skippedMeals: ["breakfast"],
        movementMinutes: 0,
        energyLevel: "low",
        disruptors: ["deadline"],
      }
    : {
        sleepHours: 7.5,
        mealsCount: 3,
        skippedMeals: [],
        movementMinutes: 30,
        energyLevel: "high",
        disruptors: ["none"],
      }
);

const insight: Insight = {
  periodStart: "2026-07-01",
  periodEnd: "2026-07-14",
  createdAt: "2026-07-14T00:00:00Z",
  patterns: [
    {
      pillars: ["sleep", "eating"],
      observation: "วันที่นอนน้อย มักเป็นวันที่ข้ามมื้อเช้าด้วย",
      meaning: "เป็นสัญญาณที่น่าติดตาม",
      nextStep: "เตรียมมื้อเช้าไว้ล่วงหน้า",
      evidence: {
        metric: "อัตราการข้ามมื้อเช้า",
        groupA: { label: "นอนน้อย", days: 5, value: 0.8 },
        groupB: { label: "นอนพอ", days: 9, value: 0.2 },
      },
    },
  ],
};

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

const profile: CoachContextData["profile"] = {
  status: "student",
  earlyDays: ["mon", "wed"],
  busyPeriods: ["exam"],
  constraints: ["no_time"],
};

describe("formatCoachContext", () => {
  it("อ้างตัวเลข check-in จริง + โปรไฟล์ (ป้ายไทย) + goal ที่กำลังทำ", () => {
    const context = formatCoachContext({ profile, checkins, insight, goals });
    expect(context).not.toBeNull();
    const text = context ?? "";

    expect(text).toContain("นอน 4 ชม.");
    expect(text).toContain("ข้ามมื้อเช้า");
    expect(text).toContain("นักศึกษา");
    expect(text).toContain("ช่วงสอบ");
    expect(text).toContain("เตรียมมื้อเช้าคืนก่อนวันเรียนเช้า");
    expect(text).toContain("ทำไปแล้ว 2 วัน");
    expect(text).toContain("วันที่นอนน้อย มักเป็นวันที่ข้ามมื้อเช้าด้วย");
  });

  it("goal ที่ dropped ไม่โผล่ในบริบท", () => {
    const context = formatCoachContext({ profile, checkins, insight, goals }) ?? "";
    expect(context).not.toContain("เป้าหมายที่พับไปแล้ว");
  });

  it("มีแต่ check-in (ไม่มีโปรไฟล์/insight/goal) → ยังได้บริบท", () => {
    const context = formatCoachContext({ profile: null, checkins, insight: null, goals: [] });
    expect(context).not.toBeNull();
    expect(context).toContain("บันทึก 2 วันล่าสุด");
    expect(context).not.toContain("โปรไฟล์");
  });

  it("ไม่มีข้อมูลอะไรเลย → คืน null (โค้ชใช้ system prompt เดิม)", () => {
    expect(
      formatCoachContext({ profile: null, checkins: [], insight: null, goals: [] })
    ).toBeNull();
  });
});
