import { describe, expect, it } from "vitest";
import type { PatternCandidate } from "@/lib/patterns/types";
import { buildInsightPrompt, mergeInsightPatterns, parseInsightText } from "./insight-ai";
import { toInsightPattern } from "./templates";

const skipBreakfast: PatternCandidate = {
  id: "sleep-eating-skip-breakfast",
  pillars: ["sleep", "eating"],
  metric: "skip_breakfast_rate",
  groupA: { label: "นอนน้อยกว่า 6 ชม.", days: 5, value: 0.8 },
  groupB: { label: "นอน 6 ชม. ขึ้นไป", days: 12, value: 0.25 },
};

const eatingEnergy: PatternCandidate = {
  id: "eating-energy",
  pillars: ["eating"],
  metric: "high_energy_rate",
  groupA: { label: "วันที่กินครบทุกมื้อ", days: 10, value: 0.6 },
  groupB: { label: "วันที่ข้ามมื้อ", days: 7, value: 0.2 },
};

const allowed = new Set([skipBreakfast.id, eatingEnergy.id]);

function aiEntry(id: string) {
  return {
    id,
    observation: "วันที่นอนน้อย มักเป็นวันที่ข้ามมื้อเช้าด้วย",
    meaning: "เป็นสัญญาณที่น่าติดตาม ยังสรุปเป็นเหตุและผลไม่ได้",
    next_step: "เตรียมมื้อเช้าง่าย ๆ ไว้ล่วงหน้า",
  };
}

describe("parseInsightText", () => {
  it("รับเฉพาะ entry ที่ครบทุกฟิลด์และ id อยู่ในชุดที่ส่งไป", () => {
    const map = parseInsightText({ patterns: [aiEntry("sleep-eating-skip-breakfast")] }, allowed);
    expect(map.get("sleep-eating-skip-breakfast")?.observation).toContain("ข้ามมื้อเช้า");
    expect(map.get("sleep-eating-skip-breakfast")?.nextStep).toBe(
      "เตรียมมื้อเช้าง่าย ๆ ไว้ล่วงหน้า"
    );
  });

  it("ตัด entry ที่มีภาษาเชิงเหตุผลหรือคำต้องห้ามทิ้ง แล้วปล่อยให้ fallback เป็น template", () => {
    const causal = {
      ...aiEntry("sleep-eating-skip-breakfast"),
      meaning: "การนอนน้อยทำให้คุณข้ามมื้อเช้า",
    };
    const body = { ...aiEntry("eating-energy"), next_step: "คุมน้ำหนักด้วยการงดมื้อเย็น" };
    const map = parseInsightText({ patterns: [causal, body] }, allowed);
    expect(map.size).toBe(0);
  });

  it("ตัด entry ที่ id ไม่อยู่ในชุด หรือฟิลด์ขาด", () => {
    const unknownId = aiEntry("not-a-real-pattern");
    const missingField = { id: "eating-energy", observation: "", meaning: "x", next_step: "y" };
    const map = parseInsightText({ patterns: [unknownId, missingField] }, allowed);
    expect(map.size).toBe(0);
  });

  it("id ซ้ำ ใช้ตัวแรก และ input พังคืน map ว่าง", () => {
    const dup = parseInsightText(
      {
        patterns: [
          aiEntry("eating-energy"),
          { ...aiEntry("eating-energy"), observation: "อันที่สอง" },
        ],
      },
      allowed
    );
    expect(dup.get("eating-energy")?.observation).not.toBe("อันที่สอง");
    expect(parseInsightText(null, allowed).size).toBe(0);
    expect(parseInsightText({ patterns: "nope" }, allowed).size).toBe(0);
  });
});

describe("mergeInsightPatterns", () => {
  const candidates = [skipBreakfast, eatingEnergy];

  it("ไม่มีข้อความ AI → ใช้ template ทั้งหมด", () => {
    const merged = mergeInsightPatterns(candidates, null);
    expect(merged).toEqual(candidates.map(toInsightPattern));
  });

  it("มีข้อความ AI → ทับ observation/meaning/nextStep แต่ evidence ยังมาจากสถิติจริง", () => {
    const aiById = parseInsightText(
      { patterns: [aiEntry("sleep-eating-skip-breakfast")] },
      allowed
    );
    const merged = mergeInsightPatterns(candidates, aiById);

    const first = merged[0];
    expect(first.observation).toBe("วันที่นอนน้อย มักเป็นวันที่ข้ามมื้อเช้าด้วย");
    expect(first.evidence.groupA).toEqual(skipBreakfast.groupA);
    expect(first.pillars).toEqual(skipBreakfast.pillars);

    expect(merged[1]).toEqual(toInsightPattern(eatingEnergy));
  });
});

describe("buildInsightPrompt", () => {
  it("ใส่ id และตัวเลขจริงที่ผ่าน formatMetric ลงใน prompt", () => {
    const prompt = buildInsightPrompt([skipBreakfast]);
    expect(prompt).toContain("sleep-eating-skip-breakfast");
    expect(prompt).toContain("80%");
    expect(prompt).toContain("25%");
    expect(prompt).toContain("นอนน้อยกว่า 6 ชม.");
  });
});
