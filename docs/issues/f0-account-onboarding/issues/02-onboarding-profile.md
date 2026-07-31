# F0-02: Onboarding เก็บบริบทชีวิต

Status: done
Owner: A
Sprint: 1
Priority: M
Refs: FR-0.2, docs/05 (ตาราง profiles)
Blocked by: 01

## งาน

- [x] ฟอร์ม 3 ขั้นสั้น ๆ: (1) ชื่อเล่น + สถานะ นักศึกษา/first jobber (2) วันไหนมีเรียน/งานเช้า (เลือกวัน) (3) ข้อจำกัดทั่วไป (ไม่มีเวลา/ไม่มีสถานที่/งบจำกัด/พักผ่อนไม่พอ)
- [x] บันทึกลง `profiles`
- [ ] แก้ไขภายหลังได้จากหน้า settings — เลื่อนไป F7 (settings page ยังไม่มี)

## Acceptance criteria

- จบ onboarding ใน < 1 นาที ทุกคำถามเป็นตัวเลือก
- ข้อมูลโผล่ใน context ของ coach (ประสานกับ F4-02)

## Comments

2026-07-07 (kickoff → A จาก D): F0-01 วาง stub + โครงไว้ให้แล้ว — **แทนทั้งไฟล์** `src/app/onboarding/page.tsx` ด้วยฟอร์มจริง
**contract "onboarded = มีแถวใน `profiles`"** อยู่ที่ `src/lib/auth/onboarding.ts` — ถ้าจะเปลี่ยนนิยาม แก้ที่ helper ที่เดียว

2026-07-07 (implement เสร็จ — บทบาท A): แทน stub ด้วย onboarding 4 ขั้นจริง (ชื่อ+สถานะ / วันเรียนเช้า / ข้อจำกัด / disclaimer) · **contract คงเดิม ไม่แตะ helper**
task "แก้จาก settings" เลื่อนไป F7

2026-07-07 (verified → resolved): เทสต์บน preview ผ่าน (AC1+AC2 ครบ) · เหลือเฉพาะ task settings ที่เลื่อนไป F7
