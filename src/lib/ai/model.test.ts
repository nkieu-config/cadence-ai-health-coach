import { describe, expect, it } from "vitest";
import { DEFAULT_MODEL } from "./model";

const PINNED = "gemini-3.1-flash-lite";

const WHY = [
  `โมเดลถูกล็อกไว้ที่ ${PINNED} — หลักฐานความปลอดภัยทั้งหมดของโปรเจกต์ต้องรันบนโมเดลนี้`,
  "เลือกรุ่นนี้เพราะ free tier ให้ 500 req/วัน + 15 req/นาที (2.5-flash ให้แค่ 20/วัน + 5/นาที) — ดู INFRA-23",
  "เปลี่ยนโมเดล = หลักฐานเดิมใช้ไม่ได้ ต้องรัน QA-01 ใหม่ทั้ง 10 เคส × 2 ประโยค บนโมเดลใหม่",
  "ถ้าจะเปลี่ยนจริง คุยกับ A ก่อน แล้วแก้ค่า PINNED ในเทสนี้พร้อมกัน",
  "อยากลองโมเดลอื่นชั่วคราวบนเครื่องตัวเอง ใช้ตัวแปรแวดล้อม AI_MODEL แทน ไม่ต้องแก้โค้ด",
].join("\n");

describe("DEFAULT_MODEL", () => {
  it(`ถูกล็อกไว้ที่ ${PINNED}`, () => {
    expect(DEFAULT_MODEL, WHY).toBe(PINNED);
  });
});
