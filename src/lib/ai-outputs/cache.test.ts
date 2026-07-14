import { describe, expect, it } from "vitest";
import { isFresh } from "./cache";

const EARLIER = "2026-07-14T08:00:00.000Z";
const LATER = "2026-07-14T09:00:00.000Z";

describe("isFresh — ด่านกันการยิง Gemini ซ้ำ (INFRA-07 · FR-3.4)", () => {
  it("ไม่มี cache → ต้องสร้างใหม่", () => {
    expect(isFresh(null, EARLIER)).toBe(false);
  });

  it("cache ใหม่กว่า check-in ล่าสุด → ใช้ของเดิม ไม่ยิง Gemini", () => {
    expect(isFresh(LATER, EARLIER)).toBe(true);
  });

  it("มี check-in ใหม่หลังวิเคราะห์ → ต้องวิเคราะห์ใหม่", () => {
    expect(isFresh(EARLIER, LATER)).toBe(false);
  });

  it("แก้ check-in ในวินาทีเดียวกับที่วิเคราะห์ → ยังถือว่า cache ใช้ได้", () => {
    expect(isFresh(EARLIER, EARLIER)).toBe(true);
  });

  it("มี cache แต่ยังไม่เคย check-in เลย → ไม่ต้องยิงใหม่", () => {
    expect(isFresh(LATER, null)).toBe(true);
  });

  it("กดปุ่มวิเคราะห์รัว ๆ 10 ครั้งโดยไม่แก้ข้อมูล → ยิง Gemini 0 ครั้ง", () => {
    const calls = Array.from({ length: 10 }, () => isFresh(LATER, EARLIER)).filter(
      (fresh) => !fresh
    );
    expect(calls).toHaveLength(0);
  });
});
