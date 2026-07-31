# INFRA-02: Supabase project + schema + RLS

Status: done
Owner: D
Sprint: 0
Priority: M
Refs: FR-7.1, docs/05, docs/08 Part 2

## งาน

- [x] สร้าง Supabase project (free tier) + แชร์ access ให้ทีม (invite ทีมเป็น dashboard action ของ D ยืนยันเองอีกที)
- [x] รัน schema จาก docs/05: `profiles`, `checkins`, `goals`, `chat_messages`, `ai_outputs`
- [x] เปิด RLS ทุกตาราง: select/insert/update/delete เฉพาะ `user_id = auth.uid()`
- [x] ตั้ง Supabase client ใน `lib/supabase` (server + browser)
- [x] ทดสอบ RLS: user A ต้อง query ข้อมูล user B ไม่ได้

## Acceptance criteria

- ตารางครบ 5 ตาราง ตรง docs/05 ทุกฟิลด์ — ✓ verify แล้ว
- มีหลักฐานทดสอบ RLS (บันทึกผลใน Comments) — ✓ ด้านล่าง

## Comments

2026-07-06 (AI scaffold): SQL พร้อมรันอยู่ที่ `supabase/migrations/0001_init.sql` (5 ตาราง + RLS ครบ) · เหลือ: สร้าง Supabase project จริง, รัน SQL, เติม `.env.local`, ทดสอบ RLS

2026-07-07 (verify): D สร้าง project + รัน schema + เติม env เสร็จ → `npm run verify:db` ผ่านทั้งหมด (ตารางครบ 5/5 · RLS กัน anon และกันข้าม user)
หลักฐานนี้ใช้อ้างเกณฑ์ Privacy ตอน pitch ได้ · รันซ้ำได้ทุกครั้งที่แก้ schema
