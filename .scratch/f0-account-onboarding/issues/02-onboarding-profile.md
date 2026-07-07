# F0-02: Onboarding เก็บบริบทชีวิต

Status: ready-for-human
Owner: A
Sprint: 1
Priority: M
Refs: FR-0.2, docs/05 (ตาราง profiles)
Blocked by: 01

## งาน

- [ ] ฟอร์ม 3 ขั้นสั้น ๆ: (1) ชื่อเล่น + สถานะ นักศึกษา/first jobber (2) วันไหนมีเรียน/งานเช้า (เลือกวัน) (3) ข้อจำกัดทั่วไป (ไม่มีเวลา/ไม่มีสถานที่/งบจำกัด/พักผ่อนไม่พอ)
- [ ] บันทึกลง `profiles`
- [ ] แก้ไขภายหลังได้จากหน้า settings

## Acceptance criteria

- จบ onboarding ใน < 1 นาที ทุกคำถามเป็นตัวเลือก
- ข้อมูลโผล่ใน context ของ coach (ประสานกับ F4-02)

## Comments

2026-07-07 (kickoff → A จาก D): F0-01 วาง stub + โครงไว้ให้แล้ว — อ่านก่อนลงมือ กันทำซ้ำ/พัง contract:

1. **แทนทั้งไฟล์** `src/app/onboarding/page.tsx` — ตอนนี้เป็น stub (สร้าง profile ขั้นต่ำ `status='student'` + fake disclaimer) เอา form 3 ขั้นจริงมาแทน
2. **contract "onboarded = มีแถวใน `profiles`"** อยู่ที่ `src/lib/auth/onboarding.ts` (`hasCompletedOnboarding`) — guard ใน signIn/signUp + หน้า `/` พึ่งฟังก์ชันนี้ ถ้าจะเปลี่ยนนิยาม (เช่น เช็ค `disclaimer_accepted_at`) แก้ที่ helper ที่เดียว ทุกจุดตามไปเอง
3. signIn/signUp redirect ผู้ใช้ใหม่มา `/onboarding` ให้แล้ว — A ทำแค่ตอน "จบ onboarding" เขียน `profiles` ครบ (`display_name` + `status` เป็น NOT NULL ดู docs/05) แล้ว redirect ไป `/`
4. Google OAuth ก็เข้ามาที่ `/onboarding` เหมือนกัน (ผ่าน `/auth/callback`) — ไม่ต้องทำอะไรเพิ่ม
