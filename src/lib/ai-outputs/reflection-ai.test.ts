import { describe, expect, it } from "vitest";
import { makeCheckins } from "@/lib/patterns/test-fixtures";
import { buildWeekFacts } from "./reflection-facts";
import { buildReflectionPrompt, mergeReflectionText, parseReflectionText } from "./reflection-ai";

const facts = buildWeekFacts(makeCheckins(7), [], 7);

function aiText(overrides: Partial<Record<string, string>> = {}) {
  return {
    eating: "กินครบทุกมื้อเกือบทุกวัน",
    sleep: "นอนเฉลี่ย 7 ชม.",
    movement: "ขยับทุกวัน",
    strengths: "บันทึกต่อเนื่องทั้งสัปดาห์",
    nextWeek: "ลองเตรียมมื้อเช้าไว้ล่วงหน้า 2 วัน",
    ...overrides,
  };
}

describe("parseReflectionText", () => {
  it("รับ object ที่ครบทุกฟิลด์และไม่มีคำต้องห้าม", () => {
    const parsed = parseReflectionText(aiText());
    expect(parsed?.eating).toBe("กินครบทุกมื้อเกือบทุกวัน");
  });

  it("ปฏิเสธทั้งชุดถ้ามีฟิลด์ไหนว่างหรือหาย", () => {
    expect(parseReflectionText(aiText({ nextWeek: "" }))).toBeNull();
    expect(parseReflectionText({ eating: "x" })).toBeNull();
  });

  it("ปฏิเสธทั้งชุดถ้ามีคำต้องห้ามในฟิลด์ใดฟิลด์หนึ่ง", () => {
    expect(parseReflectionText(aiText({ strengths: "ลดน้ำหนักได้ดี" }))).toBeNull();
    expect(parseReflectionText(aiText({ movement: "ขยับเพราะอยากผอม" }))).toBeNull();
  });

  it("input พังคืน null", () => {
    expect(parseReflectionText(null)).toBeNull();
    expect(parseReflectionText("nope")).toBeNull();
  });
});

describe("mergeReflectionText", () => {
  it("ไม่มีข้อความ AI → ใช้ template", () => {
    const merged = mergeReflectionText(facts, null);
    expect(merged.pillars).toHaveLength(3);
    expect(merged.pillars.map((p) => p.pillar)).toEqual(["eating", "sleep", "movement"]);
  });

  it("มีข้อความ AI → ใช้ข้อความ AI ทั้งหมด", () => {
    const merged = mergeReflectionText(facts, aiText());
    expect(merged.pillars.find((p) => p.pillar === "eating")?.summary).toBe(
      "กินครบทุกมื้อเกือบทุกวัน"
    );
    expect(merged.strengths).toBe("บันทึกต่อเนื่องทั้งสัปดาห์");
    expect(merged.nextWeek).toBe("ลองเตรียมมื้อเช้าไว้ล่วงหน้า 2 วัน");
  });
});

describe("buildReflectionPrompt", () => {
  it("ใส่ตัวเลขสถิติและผลเป้าหมายจริงลงใน prompt", () => {
    const withGoal = buildWeekFacts(
      makeCheckins(7),
      [
        {
          id: "g1",
          weekStart: "2026-07-13",
          title: "เตรียมมื้อเช้า",
          situation: "early_class",
          status: "active",
          progressDates: ["2026-07-13"],
        },
      ],
      7
    );
    const prompt = buildReflectionPrompt(withGoal);

    expect(prompt).toContain("เตรียมมื้อเช้า");
    expect(prompt).toContain("มีเรียนหรือทำงานเช้า");
    expect(prompt).toContain("กำลังทำ");
    expect(prompt).toContain(`${withGoal.daysRecorded}/${withGoal.totalDays} วัน`);
  });
});
