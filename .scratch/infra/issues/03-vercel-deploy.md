# INFRA-03: Vercel deploy pipeline

Status: done
Owner: D
Sprint: 0
Priority: M
Refs: ADR-0002, docs/06 (Environments)
Blocked by: 01

## งาน

- [x] เชื่อม repo กับ Vercel — merge เข้า `main` = deploy production อัตโนมัติ
- [x] ตั้ง env vars: `GEMINI_API_KEY`, Supabase URL/keys (service role ฝั่ง server เท่านั้น)
- [x] ยืนยันว่าไม่มี secret หลุดใน client bundle (NFR-4)

## Acceptance criteria

- URL production เปิดได้จากมือถือและ desktop — D ยืนยันเปิดจากมือถือแล้ว
- Preview deploy ต่อ PR ทำงาน — D ยืนยัน PR→preview, merge→redeploy แล้ว

## Comments

2026-07-07 (verify): D deploy บน Vercel + ตั้ง env 5 ตัวเสร็จ ทดสอบ manual (มือถือ, PR preview, merge redeploy) ผ่านแล้ว ฝั่ง AI ตรวจเพิ่ม:

- **`npm run build` ผ่าน** บน working tree ปัจจุบัน → deploy ถัดไป (ตอน push ของค้าง) จะไม่พัง; typecheck ครอบ scripts ใหม่ด้วย
- **NFR-4 (secret ไม่หลุด client) ผ่าน** — static check: `SUPABASE_SERVICE_ROLE_KEY`/`GEMINI_API_KEY` ใช้แค่ใน `lib/supabase/admin.ts`, `lib/ai`, scripts (ฝั่ง server ล้วน) ไม่มี client component import และไม่มี prefix `NEXT_PUBLIC_` → Next.js ไม่ส่งไป browser (anon key เป็น `NEXT_PUBLIC_` โดยตั้งใจ ปลอดภัยด้วย RLS ที่ verify แล้วใน INFRA-02)

Production URL: https://personal-healthcoach.vercel.app/ — 2026-07-07 เช็คสด (WebFetch): เปิดได้ 200, ยังเป็นหน้า Next.js starter (real app มา Sprint 1), ไม่มี secret หลุดในหน้า

หมายเหตุ: Vercel deploy จาก GitHub `main` ซึ่งตอนนี้ = commit แรก (scaffold) หน้าแรกยังเป็น Next.js starter — real app มาใน Sprint 1 (F0/F1). ของค้างใน local (verify/test scripts + ปิด INFRA-01) ต้อง push ขึ้น main ก่อน Vercel ถึงจะ deploy เวอร์ชันล่าสุด
