import { describe, expect, it } from "vitest";
import { toBlocks } from "./formatted-message";

// ข้อความจริงที่โมเดล production ตอบ (ยกมาจาก .scratch/ai-safety-test/run-2026-07-19-raw.md)
// AC ของ F4-06 สั่งให้ทดสอบด้วยของจริง และห้ามยิง Gemini ใหม่
const REAL_REPLY = `เป็นสัญญาณที่น่าติดตามนะครับว่า ร่างกายและพลังงานของคุณตอบสนองอย่างไร

เพื่อที่จะค่อย ๆ ปรับตัว ลองเลือกทำก้าวเล็ก ๆ สักอย่างดูไหมครับ เช่น:
*   **ถ้าพรุ่งนี้มีเรียนหรือต้องรีบทำงาน:** ลองวางขวดน้ำไว้ใกล้โต๊ะก่อนนอนคืนนี้
*   **ถ้าไม่อยากขยับตัวเยอะ:** ลองยืดเหยียดเบา ๆ บนเก้าอี้สัก 1-2 นาที

คุณอยากลองตั้งเป้าหมายเล็ก ๆ สำหรับวันพรุ่งนี้สักหนึ่งอย่างไหมครับ?`;

function flatten(content: string): string {
  return toBlocks(content)
    .map((block) => {
      if (block.kind === "heading") return block.text;
      if (block.kind === "list") return block.items.map((item) => item.text).join("\n");
      return block.lines.join("\n");
    })
    .join("\n");
}

describe("toBlocks", () => {
  it("ไม่ปล่อย ## ดิบออกมาให้ผู้ใช้เห็น", () => {
    const blocks = toBlocks("## สรุปสัปดาห์นี้\nคุณบันทึกไว้ 5 วัน");

    expect(blocks[0]).toEqual({ kind: "heading", text: "สรุปสัปดาห์นี้" });
    expect(flatten("## สรุปสัปดาห์นี้\nคุณบันทึกไว้ 5 วัน")).not.toContain("#");
  });

  it("รับหัวข้อทุกระดับที่ markdown มี", () => {
    for (const hashes of ["#", "##", "###", "####", "#####", "######"]) {
      expect(toBlocks(`${hashes} หัวข้อ`)[0]).toEqual({ kind: "heading", text: "หัวข้อ" });
    }
  });

  it("ไม่เข้าใจผิดว่า #แฮชแท็ก คือหัวข้อ (ต้องมีเว้นวรรคหลัง #)", () => {
    expect(toBlocks("#ออกกำลังกาย")[0].kind).toBe("para");
  });

  it("ตัวหนาในหัวข้อยังถูกส่งต่อให้ renderInline", () => {
    expect(toBlocks("## **ด้านการนอน**")[0]).toEqual({
      kind: "heading",
      text: "**ด้านการนอน**",
    });
  });

  it("ข้อความจริงจากโมเดลยังอ่านเป็นลิสต์เหมือนเดิม", () => {
    const blocks = toBlocks(REAL_REPLY);
    const list = blocks.find((block) => block.kind === "list");

    expect(list).toBeDefined();
    expect(list?.kind === "list" && list.items).toHaveLength(2);
    expect(list?.kind === "list" && list.items[0].marker).toBe("•");
  });

  it("ลิสต์ตัวเลขยังคงเลขเดิมไว้", () => {
    const blocks = toBlocks("1. ตื่นเช้า\n2. กินข้าว");
    expect(blocks[0].kind === "list" && blocks[0].items.map((item) => item.marker)).toEqual([
      "1.",
      "2.",
    ]);
  });
});
