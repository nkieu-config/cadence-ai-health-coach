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

2026-07-07 (kickoff → D): เริ่มได้เลย ไม่ต้องรอ wireframe (login/register เป็นหน้ามาตรฐาน) infra พร้อมแล้ว — นี่คือ keystone ของ critical path สู่ 12 ก.ค. ทำก่อน F7 privacy

Heads-up ก่อนลงมือ:

1. **เช็ค Supabase ปิด "Confirm email" ก่อน** (Authentication → Sign In/Up → Email) — ถ้ายังเปิด สมัครแล้วล็อกอินไม่ได้จนกว่าจะยืนยันเมล → acceptance "สมัครใหม่ → เข้าแอปจบเส้น" จะไม่ผ่าน (จุดนี้พลาดกันบ่อย)
2. **proxy กันหน้าทำไว้แล้ว** ที่ `src/proxy.ts` — guard + public paths (`/login`, `/register`, `/auth`) ครบ → สร้างแค่**หน้า + auth action** พอ ไม่ต้องเขียน middleware ใหม่ (task ข้อ 2 เกือบเสร็จ) ใช้ helper ที่มีอยู่: `src/lib/supabase/client.ts` (browser) และ `server.ts` (server action)
3. **task ข้อ 3 (redirect → onboarding) ผูกกับ F0-02** — sync กับ A ก่อนเรื่องวิธีเช็ค "ยังไม่ onboard" แนะนำ: ไม่มีแถวใน `profiles` หรือ `disclaimer_accepted_at` เป็น null → เด้งไป `/onboarding`

2026-07-07 (implement เสร็จ — บทบาท D): เขียนครบ + verify แล้ว

ไฟล์ที่เพิ่ม: `src/lib/auth/actions.ts` (signIn/signUp/signOut), `src/lib/auth/onboarding.ts`, `src/components/auth/{login,register}-form.tsx`, `src/app/(auth)/{login,register}/page.tsx` + layout, `src/app/page.tsx` (landing/authed home + logout), `src/app/onboarding/page.tsx` (**STUB** — A แทนด้วย F0-02+F0-03 จริง; นิยาม onboarded = มีแถวใน `profiles`)

Verify: `npm run build` + `lint` ผ่าน; smoke test dev — `/login` `/register` `/` = 200 มีฟอร์ม, `/onboarding` + route ที่ไม่มี (เช่น `/dashboard`) แบบไม่ล็อกอิน → 307 เด้ง `/login` (proxy guard = AC ข้อ 2 ผ่าน)

ยังเหลือ (ทำบน Vercel preview ของ PR): click-through จริงในเบราว์เซอร์ สมัคร→onboarding→home→logout (AC ข้อ 1 "จบเส้นบน production") — server action POST เทสต์ curl ไม่ได้ ⚠️ ก่อนเทส ยืนยัน Supabase ปิด "Confirm email" (ไม่งั้น signUp ไม่ได้ session)

2026-07-07 (เพิ่ม Google OAuth — ตามที่ A ขอ): เปิด **ทั้ง Google + email/password** (ADR-0005) ไฟล์เพิ่ม: `signInWithGoogle` ใน actions.ts, `components/auth/google-button.tsx`, `app/auth/callback/route.ts`; หน้า login/register มีปุ่ม "ดำเนินการต่อด้วย Google" + ตัวคั่น
Verify: build + lint ผ่าน; smoke test — ปุ่ม Google เรนเดอร์ทั้ง login/register, `/auth/callback` ไม่มี code → redirect `/login?error=oauth` (dev ใช้ http://localhost ถูกต้อง)
⚠️ **ยังใช้ Google ล็อกอินจริงไม่ได้จนกว่าจะ config** (นอกโค้ด — ทำไม่ได้จาก repo): Google Cloud OAuth client + Supabase enable Google provider + Redirect URLs allowlist ดูขั้นตอนใน ADR-0005 / คอมเมนต์ของ A ในกลุ่ม

2026-07-07 (resolved): config Google OAuth เสร็จ (Google Cloud + Supabase provider + Redirect URLs) — เทสต์บน preview ผ่านทั้ง **Google และ email/password** → onboarding → home → logout; AC2 ผ่านตั้งแต่ smoke test; merge PR #2 เข้า main แล้ว prod deploy live
บทเรียน setup OAuth (Vercel project name ≠ prod domain, Supabase fallback เงียบ ฯลฯ) บันทึกไว้ใน ADR-0005 § Gotchas
เหลือ: A แทน onboarding stub ด้วย F0-02/F0-03 จริง
