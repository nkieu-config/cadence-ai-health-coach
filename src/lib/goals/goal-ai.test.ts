import { describe, expect, it } from "vitest";
import { makeCheckins } from "@/lib/patterns/test-fixtures";
import { buildGoalPrompt, mergeGoalSuggestions, parseGoalSuggestions } from "./goal-ai";
import { fallbackGoal } from "./suggest";
import type { Situation } from "./types";

const situations: Situation[] = ["deadline", "early_class"];
const allowed = new Set(situations);

function aiEntry(situation: Situation, title: string) {
  return { situation, title };
}

describe("parseGoalSuggestions", () => {
  it("รับเฉพาะ entry ที่ title ไม่ว่างและ situation อยู่ในชุดที่ส่งไป", () => {
    const map = parseGoalSuggestions(
      { goals: [aiEntry("deadline", "ตั้งเวลาพัก 5 นาทีทุกชั่วโมงในวันที่มีเดดไลน์")] },
      allowed
    );
    expect(map.get("deadline")).toBe("ตั้งเวลาพัก 5 นาทีทุกชั่วโมงในวันที่มีเดดไลน์");
  });

  it("ตัด entry ที่มีคำต้องห้ามทิ้ง แล้วปล่อยให้ fallback เป็น goal มาตรฐาน", () => {
    const map = parseGoalSuggestions(
      { goals: [aiEntry("deadline", "ลดน้ำหนัก 2 กิโลสัปดาห์นี้")] },
      allowed
    );
    expect(map.size).toBe(0);
  });

  it("ตัด entry ที่ situation ไม่อยู่ในชุด หรือ title ว่าง", () => {
    const map = parseGoalSuggestions(
      {
        goals: [
          aiEntry("long_screen" as Situation, "ยืดเหยียด 5 นาที"),
          aiEntry("early_class", "   "),
        ],
      },
      allowed
    );
    expect(map.size).toBe(0);
  });

  it("situation ซ้ำ ใช้ตัวแรก และ input พังคืน map ว่าง", () => {
    const dup = parseGoalSuggestions(
      {
        goals: [aiEntry("deadline", "อันแรก"), aiEntry("deadline", "อันที่สอง")],
      },
      allowed
    );
    expect(dup.get("deadline")).toBe("อันแรก");
    expect(parseGoalSuggestions(null, allowed).size).toBe(0);
    expect(parseGoalSuggestions({ goals: "nope" }, allowed).size).toBe(0);
  });
});

describe("mergeGoalSuggestions", () => {
  it("ไม่มีข้อความ AI → ใช้ goal มาตรฐานทั้งหมด", () => {
    const merged = mergeGoalSuggestions(situations, null);
    expect(merged).toEqual(
      situations.map((situation) => ({ situation, title: fallbackGoal(situation) }))
    );
  });

  it("มีข้อความ AI เฉพาะบาง situation → situation ที่เหลือ fallback เป็น goal มาตรฐาน", () => {
    const aiBySituation = parseGoalSuggestions(
      { goals: [aiEntry("deadline", "พักสายตา 5 นาทีทุก 90 นาทีตอนมีเดดไลน์")] },
      allowed
    );
    const merged = mergeGoalSuggestions(situations, aiBySituation);

    expect(merged.find((g) => g.situation === "deadline")?.title).toBe(
      "พักสายตา 5 นาทีทุก 90 นาทีตอนมีเดดไลน์"
    );
    expect(merged.find((g) => g.situation === "early_class")?.title).toBe(
      fallbackGoal("early_class")
    );
  });
});

describe("buildGoalPrompt", () => {
  it("ใส่ few-shot goal มาตรฐานและตัวอย่างวันจริงของผู้ใช้ลงใน prompt", () => {
    const checkins = makeCheckins(5, () => ({ disruptors: ["deadline" as const] }));
    const prompt = buildGoalPrompt(["deadline"], checkins);

    expect(prompt).toContain("deadline");
    expect(prompt).toContain(fallbackGoal("deadline"));
    expect(prompt).toContain("เดดไลน์");
  });

  it("ไม่มีวันที่ตรงสถานการณ์ ก็ยังสร้าง prompt ได้ไม่พัง", () => {
    const prompt = buildGoalPrompt(["long_commute"], []);
    expect(prompt).toContain("long_commute");
  });
});
