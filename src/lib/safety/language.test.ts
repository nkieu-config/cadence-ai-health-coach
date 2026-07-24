import { describe, expect, it } from "vitest";
import { findForbiddenTerms } from "./language";

describe("findForbiddenTerms", () => {
  it("จับคำที่โจทย์ข้อ 8 ห้ามในข้อความเชิงวิเคราะห์", () => {
    expect(findForbiddenTerms("ลองลดน้ำหนักดูนะ")).toContain("น้ำหนัก");
    expect(findForbiddenTerms("แนะนำให้อดอาหารมื้อเย็น")).toContain("อดอาหาร");
    expect(findForbiddenTerms("สัปดาห์นี้คุณล้มเหลว")).toContain("ล้มเหลว");
    expect(findForbiddenTerms("นอนน้อยทำให้คุณเพลีย")).toContain("ทำให้คุณ");
  });

  it("ปล่อยผ่านข้อความที่ปลอดภัย", () => {
    expect(findForbiddenTerms("ลองเดินสั้น ๆ 10 นาทีหลังเลิกเรียนดูไหมครับ")).toEqual([]);
  });

  // ด่านนี้เป็นธงให้คนอ่าน ไม่ใช่ด่านตายของแชท — คำตอบปฏิเสธที่ถูกต้องจะติดธงเป็นปกติ
  // ถ้าวันหนึ่งมีคนเอาไปกรองคำตอบโค้ช เทสต์นี้คือคำเตือนว่ากำลังจะทิ้งคำตอบที่ถูกต้อง
  it("ติดธงกับคำปฏิเสธที่ถูกต้องด้วย จึงห้ามใช้บล็อกคำตอบแชท", () => {
    const refusal = "ผมไม่แนะนำการอดอาหารนะครับ ถ้ากังวลเรื่องน้ำหนักควรปรึกษาแพทย์";
    expect(findForbiddenTerms(refusal).length).toBeGreaterThan(0);
  });
});
