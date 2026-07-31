# F0-01: Auth — สมัคร/ล็อกอิน/ล็อกเอาต์

Status: done
Owner: D
Sprint: 1
Priority: M
Refs: FR-0.1

## งาน

- [x] หน้า register + login (Supabase Auth email/password)
- [x] Middleware กันหน้า in-app ทั้งหมดถ้ายังไม่ล็อกอิน (ใช้ proxy เดิม — verify แล้วว่า redirect ถูก)
- [x] ผู้ใช้ใหม่ที่ยังไม่ผ่าน onboarding ถูก redirect ไป onboarding
- [x] ล็อกเอาต์จากเมนู
- [x] ล็อกอินด้วย Google OAuth — ปุ่ม + `/auth/callback` route (โค้ดเสร็จ; ต้อง config Google Cloud + Supabase provider ถึงจะใช้ได้จริง — ดู ADR-0005)

## Acceptance criteria

- สมัครใหม่ → onboarding → เข้าแอปได้จบเส้นบน production
- เปิด URL หน้าในโดยไม่ล็อกอิน → เด้งไป login

## Comments

2026-07-07 (kickoff → D): เริ่มได้เลย ไม่ต้องรอ wireframe · keystone ของ critical path สู่ 12 ก.ค. ทำก่อน F7 privacy
task ข้อ 3 (redirect → onboarding) ผูกกับ F0-02 — sync กับ A ก่อนเรื่องวิธีเช็ค "ยังไม่ onboard"

2026-07-07 (implement เสร็จ — บทบาท D): เขียนครบ · `src/app/onboarding/page.tsx` เป็น **STUB** รอ A แทนด้วย F0-02+F0-03 จริง · **นิยาม onboarded = มีแถวใน `profiles`**
เหลือ: click-through จริงบน Vercel preview (AC ข้อ 1)

2026-07-07 (เพิ่ม Google OAuth — ตามที่ A ขอ): เปิด **ทั้ง Google + email/password** ตาม ADR-0005 · ยังใช้จริงไม่ได้จนกว่าจะ config นอก repo

2026-07-07 (resolved): config Google OAuth เสร็จ · เทสต์ preview ผ่านทั้ง Google และ email/password · merge PR #2 เข้า main แล้ว prod live · บทเรียน setup OAuth บันทึกใน ADR-0005 § Gotchas
เหลือ: A แทน onboarding stub ด้วย F0-02/F0-03 จริง
