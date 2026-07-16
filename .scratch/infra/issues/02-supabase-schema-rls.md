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

2026-07-06 (AI scaffold): SQL พร้อมรันอยู่ที่ `supabase/migrations/0001_init.sql` — ครบ 5 ตาราง + check constraints + indexes + trigger updated_at + RLS policy ทุกตาราง; clients อยู่ที่ `src/lib/supabase/` (client/server/admin)
เหลือ: สร้าง Supabase project จริง, รัน SQL ใน SQL Editor, เติมค่าใน `.env.local`, ทดสอบ RLS ด้วย user 2 คน

2026-07-07 (verify): D สร้าง project + รัน schema + เติม env เสร็จ → รัน `npm run verify:db` (สคริปต์ใหม่ `scripts/verify-db.ts`) **ผ่านทั้งหมด**:

- **ตารางครบ 5/5** — profiles, checkins, goals, chat_messages, ai_outputs เข้าถึงได้ด้วย service role
- **RLS ปฏิเสธ anon** — ยิง select ทั้ง 5 ตารางแบบไม่ล็อกอิน ได้ 0 แถวทุกตาราง (RLS เปิดจริง ไม่รั่ว)
- **RLS isolation (ข้อสุดท้าย)** — สร้าง user A/B ชั่วคราว, insert checkin คนละแถว → A เห็นเฉพาะของตัวเอง (1 แถว) และ A ขอข้อมูล B ตรง ๆ (`.eq('user_id', B.id)`) ได้ **0 แถว** → ยืนยัน user เห็นข้ามกันไม่ได้ (ลบ user ทดสอบอัตโนมัติแล้ว)

หลักฐานนี้ตอบเกณฑ์ Privacy ได้ตรง ๆ — ใช้โชว์/อ้างตอน pitch ได้ รันซ้ำได้ทุกเมื่อด้วย `npm run verify:db` (เช่นหลังแก้ schema)
