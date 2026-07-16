import { describe, expect, it } from "vitest";
import { DEFAULT_MODEL } from "./model";

const PINNED = "gemini-2.5-flash";

const WHY = [
  `โมเดลถูกล็อกไว้ที่ ${PINNED} — หลักฐานความปลอดภัยทั้งหมดของโปรเจกต์รันบนโมเดลนี้`,
  "(F3-02 safety checklist 10/10 · F4-04 escalation 9/9 · INFRA-16 backfill)",
  "เปลี่ยนโมเดล = หลักฐานเดิมใช้ไม่ได้ ต้องรัน QA-01 ใหม่ทั้ง 10 เคส = 20 calls = โควตาทั้งวัน",
  "ถ้าจะเปลี่ยนจริง คุยกับ A ก่อน แล้วแก้ค่า PINNED ในเทสนี้พร้อมกัน",
  "อยากลองโมเดลอื่นชั่วคราวบนเครื่องตัวเอง ใช้ตัวแปรแวดล้อม AI_MODEL แทน ไม่ต้องแก้โค้ด",
].join("\n");

describe("DEFAULT_MODEL", () => {
  it(`ถูกล็อกไว้ที่ ${PINNED}`, () => {
    expect(DEFAULT_MODEL, WHY).toBe(PINNED);
  });
});
