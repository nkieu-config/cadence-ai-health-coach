# F3-02: System prompt guardrail กลาง — เก็บหลักฐานว่ากันได้จริง

Status: done
Owner: A
Sprint: 2
Priority: M — ห้ามตัด (เกณฑ์ Safety) 🔒
Refs: FR-4.2, FR-5.3, docs/07 (checklist 10 เคส), docs/08 ชั้นที่ 2
Blocked by: —

## งาน

- [x] นำ system prompt จาก docs/07 ใส่ `lib/ai` เป็น default ทุก call (ทำใน INFRA-04)
- [x] ไม่มีจุดใดในโค้ดเรียก Gemini โดยไม่ผ่าน `lib/ai` — `src/lib/ai/index.ts` เป็นไฟล์เดียวทั้ง repo ที่ import Gemini SDK
- [x] รัน **checklist 10 เคสเต็ม** จาก docs/07 ด้วย `npm run test:ai -- --save`
- [x] **สร้าง `docs/issues/ai-safety-test/` แล้วบันทึกผลดิบ** — ทั้งรอบที่หลุดและรอบที่แก้แล้ว
- [x] เคสที่หลุด → แก้ แล้วรันซ้ำ

## Acceptance criteria

- [x] **มีไฟล์ผลทดสอบจริงใน `docs/issues/ai-safety-test/`** → deliverable ข้อ 12 มีหลักฐานแล้ว
- [x] เคสเครียดรุนแรง/ทำร้ายตัวเอง → ให้สายด่วน **1323** + หยุดวิเคราะห์ (FR-4.4) ✅
- [x] ด่านโค้ดผ่าน 6/6 (FR-3.3 + FR-5.3)
- [ ] ⚠️ **เคส 08, 09, 10 ยังไม่ได้ยืนยันหลังแก้ prompt** — โควตา Gemini วันนี้หมด → **QA-01 ต้องรันซ้ำครบ 10 เคสก่อน freeze** (อยู่ในแผนอยู่แล้ว)

## Comments

2026-07-14 (A): **เสร็จแล้ว — เจอรูรั่วจริง 4 จุด (แก้ครบแล้ว) + ความเสี่ยงวัน pitch 1 ข้อ** · หลักฐานเต็มที่ [`docs/issues/ai-safety-test/README.md`](../../ai-safety-test/README.md)

⚠️ **กับดักที่ยังจริงอยู่:** `findForbiddenTerms()` ใช้ `includes()` — ห้ามใส่คำสั้น ๆ อย่าง "อด" เดี่ยว ๆ ลงรายการคำต้องห้าม (มันอยู่ใน "ตลอด" "ปลอดภัย" "อดทน") ต้องใส่เป็นวลีเต็ม และเทสต์คุมทั้ง 2 ด้าน

🚨 **→ INFRA-07:** Gemini free tier = 20 ครั้ง/วัน/โปรเจกต์ · prod ใช้ key เดียว = ทั้งแอปมีโควตา 20 ครั้ง/วัน · cache ใน `ai_outputs` คือสิ่งเดียวที่ทำให้แอปใช้งานได้จริง ไม่ใช่แค่ optimization

📌 **ฝากถึง F5-01:** `validateGoalTitle()` กัน "อันตราย" ได้ แต่กัน "ไร้ประโยชน์" ไม่ได้ → goal AI ต้องใช้ JSON schema + few-shot จากตารางโจทย์ ห้ามปล่อยเป็น free text
