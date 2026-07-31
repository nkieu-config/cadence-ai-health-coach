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

2026-07-07 (verify): D deploy บน Vercel + ตั้ง env 5 ตัว ทดสอบ manual (มือถือ / PR preview / merge redeploy) ผ่าน · ฝั่ง AI ยืนยัน NFR-4 ไม่มี secret หลุด client — service role key กับ GEMINI key ใช้ฝั่ง server ล้วน ไม่มี prefix `NEXT_PUBLIC_` (anon key เป็น public โดยตั้งใจ ปลอดภัยด้วย RLS)

Production URL: https://personal-healthcoach.vercel.app/ — ยังเป็นหน้า Next.js starter เพราะ Vercel deploy จาก `main` ที่มีแค่ scaffold · real app มา Sprint 1 · ของค้างใน local ต้อง push ขึ้น main ก่อนถึงจะ deploy เวอร์ชันล่าสุด
