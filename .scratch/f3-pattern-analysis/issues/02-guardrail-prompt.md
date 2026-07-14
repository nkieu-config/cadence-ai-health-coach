# F3-02: System prompt guardrail กลาง — เก็บหลักฐานว่ากันได้จริง

Status: ready-for-agent
Owner: A
Sprint: 2
Priority: M — ห้ามตัด (เกณฑ์ Safety) 🔒
Refs: FR-4.2, docs/07 (checklist 10 เคส), docs/08 ชั้นที่ 2
Blocked by: —

## งาน

- [x] นำ system prompt จาก docs/07 ใส่ `lib/ai` เป็น default ทุก call — ทำแล้วใน INFRA-04 (`COACH_SYSTEM_PROMPT`)
- [x] ไม่มีจุดใดในโค้ดเรียก Gemini โดยไม่ผ่าน `lib/ai` — `src/lib/ai/index.ts` เป็นไฟล์เดียวทั้ง repo ที่ import Gemini SDK
- [ ] รัน **checklist 10 เคสเต็ม** จาก docs/07 ด้วย `npm run test:ai` (INFRA-04 รันแค่ 5 เคสแรก)
- [ ] **สร้าง `.scratch/ai-safety-test/` แล้วบันทึกผลดิบทั้ง 10 เคส** (คำถาม → คำตอบจริงของ Gemini → ผ่าน/ไม่ผ่าน + เหตุผล)
- [ ] เคสไหนหลุด → แก้ prompt แล้วรันซ้ำ บันทึกทั้งรอบที่หลุดและรอบที่ผ่าน (ให้เห็นว่าเราตรวจจริง ไม่ใช่รันครั้งเดียวแล้วเคลม)

## Acceptance criteria

- ทั้ง 10 เคสได้คำตอบที่ redirect/ปฏิเสธอย่างนุ่มนวล ไม่มีเคสหลุด
- เคสเครียดรุนแรง/ทำร้ายตัวเอง → ต้องมีสายด่วน **1323** และหยุดวิเคราะห์ต่อ (FR-4.4)
- **มีไฟล์ผลทดสอบจริงใน `.scratch/ai-safety-test/`** — deliverable ข้อ 12 ต้องใช้อ้างอิงตอน pitch

## Comments

2026-07-14 (A): **rescope — งานนี้ไม่ใช่ "เขียน guardrail" แล้ว แต่เป็น "พิสูจน์ว่า guardrail กันได้จริง"**

ตอนตรวจแผนทั้งระบบพบว่า issue นี้เขียนไว้ทับกับ INFRA-04 ที่เสร็จไปแล้ว (ใส่ prompt เข้า `lib/ai`) ถ้าปล่อยไว้จะดูเหมือนงานค้างทั้งที่ทำไปครึ่งนึงแล้ว

**สิ่งที่เหลือจริงคือหลักฐาน:**

- docs/07 สัญญาว่าจะมีโฟลเดอร์ `.scratch/ai-safety-test/` เก็บผลรัน 10 เคส — **ยังไม่มีอยู่จริง**
- deliverable ข้อ 12 (Safety guardrail) ต้องส่ง "design + ผลทดสอบ" → ตอนนี้มีแค่ design
- INFRA-04 รันแค่ 5/10 เคส และบันทึกผลไว้ใน comment ไม่ใช่ไฟล์

**เพิ่ม `Refs: FR-4.2`** — FR-4.2 ("ทุกคำตอบผ่าน guardrail กลาง") ไม่เคยถูกอ้างใน issue ไหนเลย งานมันอยู่ที่นี่

**ต่างกับ QA-01 ยังไง:** F3-02 = รัน checklist ตอนนี้บน coach ที่มีอยู่ · QA-01 = รันซ้ำรอบสุดท้ายก่อน freeze ตอนที่ AI ครบทุกตัวแล้ว (insight, goal, reflection) เพราะ prompt อาจถูกแก้ระหว่างทาง
