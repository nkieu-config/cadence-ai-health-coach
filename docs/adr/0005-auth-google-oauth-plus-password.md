# ADR-0005: Auth ด้วย Google OAuth + email/password

- **Status:** Accepted
- **Date:** 2026-07-07
- **Supersedes:** ส่วน auth ของ FR-0.1 (เดิม email/password อย่างเดียว)

## Context

F0-01 เดิมทำ email/password (Supabase Auth) แต่ทีมต้องการ **Google login** เพราะเข้ากับหลัก low-burden (ไม่ต้องตั้งรหัส กดปุ่มเดียว เร็วตอน demo) อย่างไรก็ตามมีข้อจำกัด 2 อย่าง:

- **demo/seed account (ADR-0004)** ต้องล็อกอินได้ด้วยรหัส — seed script สร้างบัญชีผ่าน password ไม่ใช่ Google จริง
- ต้องมี **fallback** เผื่อ OAuth มีปัญหาวัน pitch (redirect/consent screen/เน็ต)

## Decision

เปิด **ทั้งสองทาง**:

- **Google OAuth** — ผ่าน Supabase Google provider, flow PKCE: ปุ่ม → `signInWithOAuth({ provider: 'google', redirectTo: <origin>/auth/callback })` → Google → Supabase → `/auth/callback` route แลก code เป็น session แล้ว redirect ตาม onboarding status
- **email/password** — คงไว้สำหรับ demo/seed account + fallback

## Consequences

- ผู้ใช้ทั่วไป (รวมกรรมการ) กดปุ่ม Google ปุ่มเดียวจบ — low-burden
- **ต้อง config นอกโค้ด** (ทำจาก repo ไม่ได้): Google Cloud OAuth client (Client ID/Secret) + Supabase enable Google provider + Redirect URLs allowlist
- **Redirect URLs allowlist** (Supabase → Authentication → URL Configuration) — ค่าจริงที่ใช้ได้ (โปรเจกต์ `kiznhpgxpewhlxwnnito`):
  - `https://personal-healthcoach.vercel.app/**` — prod
  - `https://healthcoach-*-nkieus-projects.vercel.app/**` — preview ทุก branch (⚠️ ขึ้นต้น `healthcoach-` ไม่ใช่ `personal-healthcoach-` ดู gotcha #1)
  - `http://localhost:3002/auth/callback` — dev (ระวังพอร์ต ดู gotcha #4)
  - **Site URL:** `https://personal-healthcoach.vercel.app`
- **OAuth consent screen**: scope พื้นฐาน (email/profile) ไม่ต้อง verify; ถ้าอยากให้คนนอกทีม (กรรมการ) ล็อกอิน Google ได้ ต้อง publish app — หรือให้กรรมการใช้ **demo account (email/password)** แทน ซึ่งเป็นเหตุผลหนึ่งที่คง password ไว้
- demo/seed account ใช้ email/password → **seed script (INFRA-06) ไม่ต้องแก้**
- callback origin: dev ใช้ `http://localhost` (special-case `NODE_ENV==='development'`), prod/preview ใช้ `x-forwarded-host` (https)
- ความเสี่ยง OAuth ล่มวัน pitch — บรรเทาด้วย email/password + demo account ที่ทำงานโดยไม่พึ่ง Google

## Gotchas (เจอจริงตอน setup Google OAuth — 2026-07-07)

Setup เสียเวลาหลายรอบเพราะ Redirect URLs ไม่ match origin จริง จดไว้กันซ้ำ (โค้ดถูกตั้งแต่แรก — ปัญหาอยู่ที่ config ล้วน):

1. **Vercel project ชื่อ `healthcoach` แต่ prod domain เป็น `personal-healthcoach.vercel.app` — คนละชื่อ**
   - preview URL = `healthcoach-git-<branch>-nkieus-projects.vercel.app` (ขึ้นต้น `healthcoach-`)
   - prod = `personal-healthcoach.vercel.app`
   - เดา wildcard preview ต้องใช้ `healthcoach-*` **ไม่ใช่** `personal-healthcoach-*`

2. **Supabase fallback ไป Site URL แบบเงียบ ๆ** — ถ้า `redirect_to` ไม่ match บรรทัดไหนใน allowlist Supabase ไม่ error แต่โยน `?code=` ไปที่ **Site URL** แทน
   - **อาการ:** หลัง login Google ไปโผล่ `https://personal-healthcoach.vercel.app/?code=...` (prod = main = หน้า Next starter ไม่มี handler) → ดูเหมือน "ไม่ทำงาน" ทั้งที่ auth สำเร็จแล้ว
   - **แปลว่า:** redirect_to ไม่ match → ไปแก้ allowlist ไม่ใช่แก้โค้ด

3. **ใส่ค่าจริง อย่าทิ้ง placeholder** — เคยพลาดเพราะก๊อป `https://*-<scope>.vercel.app/**` มาวางโดยไม่แทน `<scope>` → ไม่ match อะไรเลย

4. **dev port** — โค้ดใช้ origin จริงของ request; ถ้า `npm run dev` ขึ้น 3002 (เพราะ 3000 ถูกจอง) allowlist ต้องมี `localhost:3002` ให้ตรง — แนะนำเคลียร์พอร์ต 3000 ให้ว่างแล้วใช้ `http://localhost:3000/**` ทั้งทีมจะได้พอร์ตเดียวกัน

5. **แก้ allowlist ในโปรเจกต์ที่แอปคุยด้วยเท่านั้น:** ref `kiznhpgxpewhlxwnnito` (จาก `NEXT_PUBLIC_SUPABASE_URL`) — ไม่ใช่โปรเจกต์อื่น

**วิธี debug ที่ได้ผล:** ดู `redirect_to` จริงที่โค้ดส่ง — ทำ temporary route ที่เรียก `signInWithOAuth({ skipBrowserRedirect: true })` แล้วอ่าน `data.url` (ต้องวางใต้ `/auth/*` เพราะ proxy กัน path อื่น) เทียบกับ allowlist ตรง ๆ
