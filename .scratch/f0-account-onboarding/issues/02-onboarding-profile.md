# F0-02: Onboarding เก็บบริบทชีวิต

Status: resolved
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

2026-07-07 (kickoff → A จาก D): F0-01 วาง stub + โครงไว้ให้แล้ว — อ่านก่อนลงมือ กันทำซ้ำ/พัง contract:

1. **แทนทั้งไฟล์** `src/app/onboarding/page.tsx` — ตอนนี้เป็น stub (สร้าง profile ขั้นต่ำ `status='student'` + fake disclaimer) เอา form 3 ขั้นจริงมาแทน
2. **contract "onboarded = มีแถวใน `profiles`"** อยู่ที่ `src/lib/auth/onboarding.ts` (`hasCompletedOnboarding`) — guard ใน signIn/signUp + หน้า `/` พึ่งฟังก์ชันนี้ ถ้าจะเปลี่ยนนิยาม (เช่น เช็ค `disclaimer_accepted_at`) แก้ที่ helper ที่เดียว ทุกจุดตามไปเอง
3. signIn/signUp redirect ผู้ใช้ใหม่มา `/onboarding` ให้แล้ว — A ทำแค่ตอน "จบ onboarding" เขียน `profiles` ครบ (`display_name` + `status` เป็น NOT NULL ดู docs/05) แล้ว redirect ไป `/`
4. Google OAuth ก็เข้ามาที่ `/onboarding` เหมือนกัน (ผ่าน `/auth/callback`) — ไม่ต้องทำอะไรเพิ่ม

2026-07-07 (implement เสร็จ — บทบาท A): แทน stub ด้วย onboarding 3 ขั้นจริง

ไฟล์: `src/app/onboarding/page.tsx` (แทน stub, prefill ชื่อจาก Google metadata/email), `src/components/onboarding/onboarding-form.tsx` (stepper 4 ขั้น: ชื่อ+สถานะ / วันเรียนเช้า / ข้อจำกัด / disclaimer), `src/lib/onboarding/actions.ts` (`completeOnboarding` upsert profiles + disclaimer_accepted_at → redirect `/`)
- ทุกคำถามเป็นปุ่ม/ชิป (ยกเว้นชื่อเล่นที่ prefill ให้แก้ได้) — ตอบเร็ว < 1 นาที (AC1)
- เก็บ `early_days` + `typical_constraints` เป็น text[] ตรง docs/05 → F4-02 (coach context) ดึงไปใช้ได้ (AC2)
- **contract คงเดิม:** profile row สร้างตอนจบ disclaimer เท่านั้น → `hasCompletedOnboarding` ยังใช้ได้ ไม่แตะ helper
Verify: build + lint ผ่าน; guard `/onboarding` unauth → 307 /login; คอลัมน์ตรง migration
เหลือ: click-through เต็มในเบราว์เซอร์บน preview (stepper → submit → home); task "แก้จาก settings" เลื่อนไป F7

2026-07-07 (verified → resolved): เทสต์บน preview ผ่าน — onboarding 4 ขั้นจบเร็ว, ข้อมูลเข้า `profiles` ครบ, จบแล้วเข้า home ไม่วน onboarding ซ้ำ (AC1+AC2 ครบ); เหลือเฉพาะ task settings ที่เลื่อนไป F7
