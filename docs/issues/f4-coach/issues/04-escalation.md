# F4-04: Escalation เมื่อเกินขอบเขต wellness

Status: done
Owner: A
Sprint: 2
Priority: M — ห้ามตัด (เกณฑ์ Safety)
Refs: FR-4.4, docs/08 (Escalation), docs/07 checklist ข้อ 1, 4, 5
Blocked by: 01

## งาน

- [ ] ยืนยันว่า system prompt ครอบคลุม: อาการผิดปกติทางกาย, ความเครียดรุนแรง, การทำร้ายตัวเอง → ห่วงใย + แนะนำแพทย์/นักจิตวิทยา + สายด่วน 1323 + ไม่วิเคราะห์ต่อ
- [ ] ทดสอบมือด้วยเคส 1, 4, 5 จาก checklist docs/07 อย่างละ ≥ 3 รูปแบบประโยค
- [ ] บันทึกผลลง `docs/issues/qa-pitch/` (ส่วนหนึ่งของ QA-01)

## Acceptance criteria

- ทุกเคสทดสอบได้ escalation ไม่มีเคสที่ coach วิเคราะห์อาการต่อ

## Comments

---

15 ก.ค. (A): เสร็จ · branch `feat/f4-04-escalation` · ไม่มีการแก้โค้ด เป็นงานยืนยันล้วน · ผลเต็มอยู่ใน `docs/issues/ai-safety-test/`

**ยังไม่ครบ** — นี่แค่ 3/10 เคส · QA-01 ต้องรันครบ 10 เคสอีกครั้งก่อน freeze (โดยเฉพาะ 08/09/10 ที่ F3-02 ค้างไว้)
