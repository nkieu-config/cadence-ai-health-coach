export const BODY_TERMS = [
  "น้ำหนัก",
  "รูปร่าง",
  "แคลอรี",
  "แคลอรี่",
  "หุ่น",
  "อ้วน",
  "ผอม",
  "ลดความอ้วน",
  "bmi",
  "calorie",
  "weight",
];

export const JUDGING_TERMS = [
  "ล้มเหลว",
  "แย่มาก",
  "ไม่ดีพอ",
  "ขี้เกียจ",
  "ควรจะ",
  "น่าจะทำได้ดีกว่า",
  "ผิดพลาด",
  "เสียดาย",
  "น่าเสียดาย",
];

export const RESTRICTION_TERMS = [
  "อดอาหาร",
  "อดข้าว",
  "อดมื้อ",
  "งดอาหาร",
  "งดข้าว",
  "ล้างพิษ",
  "ดีท็อกซ์",
  "detox",
  "คีโต",
  "keto",
  "fasting",
  "ฟาสติ้ง",
];

export const CAUSAL_TERMS = [
  "เพราะว่า",
  "เป็นเพราะ",
  "เกิดจาก",
  "ส่งผลให้",
  "ทำให้คุณ",
  "สาเหตุคือ",
  "สาเหตุมาจาก",
];

const FORBIDDEN = [...BODY_TERMS, ...RESTRICTION_TERMS, ...JUDGING_TERMS, ...CAUSAL_TERMS];

// ใช้เป็นด่านตายได้เฉพาะข้อความเชิงวิเคราะห์ (insight / reflection / goal) เท่านั้น
// ห้ามเอาไปกรองคำตอบแชท — การปฏิเสธที่ถูกต้องมักต้องเอ่ยคำต้องห้ามเอง
// ("ผมไม่แนะนำการอดอาหารนะครับ") เอาไปบล็อกจะทิ้งคำตอบที่ถูกต้องที่สุด
// เหตุผลเต็มและหลักฐาน: docs/08-safety-privacy.md + .scratch/ai-safety-test/verdicts-2026-07-19.md
export function findForbiddenTerms(text: string): string[] {
  const haystack = text.toLowerCase();
  return FORBIDDEN.filter((term) => haystack.includes(term.toLowerCase()));
}
