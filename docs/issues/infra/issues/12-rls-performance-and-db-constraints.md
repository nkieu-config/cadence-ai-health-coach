# INFRA-12: RLS เรียก auth.uid() ทุกแถว + DB ไม่มีด่านสุดท้าย

Status: done
Owner: A
Sprint: 2
Priority: M — 🔒 เกี่ยวกับ Privacy/Safety โดยตรง
Refs: FR-7.1, docs/05, docs/08, skill `supabase-postgres-best-practices`
Blocked by: —

## 🔴 1. RLS policy เขียนผิดแบบที่ Supabase เตือนไว้ตรง ๆ

```sql
-- ของเราตอนนี้ (migration 0001)
create policy "own_checkins" on checkins
  for all using (auth.uid() = user_id);      -- ❌ เรียก auth.uid() ทุกแถว
```

คู่มือ Supabase ระบุชัด: **ต้องห่อด้วย subquery** ไม่งั้น Postgres เรียกฟังก์ชันซ้ำทุกแถวที่สแกน

```sql
using ((select auth.uid()) = user_id)        -- ✅ เรียกครั้งเดียว แล้ว cache
```

> *"100x+ faster on large tables"* — [RLS Performance](https://supabase.com/docs/guides/database/postgres/row-level-security#rls-performance-recommendations)

**ผิดทั้ง 5 ตาราง** · ที่หนักสุดคือ `profiles` เพราะ `hasCompletedOnboarding()` ยิงทุกครั้งที่โหลดหน้า

**เพิ่ม `to authenticated` ด้วย** — ตอนนี้ policy ถูกประเมินให้ role `anon` ที่ยังไงก็ผ่านไม่ได้อยู่แล้ว เสียแรงเปล่า

## 🔴 2. DB ไม่มีด่านสุดท้าย — และมันหลุดจริง ไม่ใช่ทฤษฎี

`NEXT_PUBLIC_SUPABASE_ANON_KEY` เป็น **public โดยออกแบบ** → ใครที่ล็อกอินแล้วยิง PostgREST ตรงได้เลย
**RLS กันได้แค่ "ห้ามแตะแถวคนอื่น" แต่ไม่ได้กัน "เขียนค่าขยะลงแถวตัวเอง"** → `validateCheckin()` ถูกข้ามทั้งดุ้น

**รัน `npm run verify:rls` ก่อนแก้ (ยิงในนามผู้ใช้จริง ไม่ใช่ service role):**

```
── 1. RLS: แตะข้อมูลคนอื่นได้ไหม ──
  ✅ อ่านได้เฉพาะของตัวเอง (25 แถว)
  ✅ เขียนแถวให้คนอื่นถูกปฏิเสธ

── 2. CHECK: เขียนค่าขยะลงแถวตัวเองได้ไหม ──
  ❌ ผ่านเข้าไปได้! — disruptor ที่ไม่มีอยู่จริง → ทำให้ pattern analysis ของตัวเองเพี้ยน
  ❌ ผ่านเข้าไปได้! — bed_time_bucket มั่ว → ทำให้สเกลเวลานอนพัง
  ❌ ผ่านเข้าไปได้! — meals_count = 99
  ❌ ผ่านเข้าไปได้! — note ยาวเกิน 200 ตัวอักษร
  ❌ ผ่านเข้าไปได้! — goal ที่ situation ไม่มีในระบบ

❌ มี 5 จุดที่หลุด
```

**ความรุนแรง:** ผู้ใช้ทำลายข้อมูลได้แค่ของตัวเอง (RLS กันคนอื่นไว้แล้ว) → **ไม่ใช่ช่องโหว่ความเป็นส่วนตัว** แต่เป็นเรื่อง data integrity + defense in depth ซึ่งอยู่ในเกณฑ์ให้คะแนน

## 🟡 3. Index ที่ขาด

`latestCheckinAt()` (`order by updated_at desc limit 1`) ถูกเรียก**ทุกครั้งที่เช็คว่า cache ของ AI หมดอายุหรือยัง** (INFRA-07) แต่ index มีแค่ `(user_id, checkin_date)` → ต้อง sort เอา
*(ที่ 30 แถวยังไม่รู้สึก — แต่นี่คือ index ที่ถูกต้องของ query บนเส้นทางหลัก)*

## ✅ ที่ตรวจแล้วผ่าน

- `query-missing-indexes` — ทุกตารางมี index ที่ขึ้นต้นด้วย `user_id` (คอลัมน์ที่ RLS ใช้) ครบ
- `schema-foreign-key-indexes` — FK ทุกตัวอยู่บน `user_id` ซึ่งเป็นคอลัมน์นำของ index อยู่แล้ว
- `getCheckins()` ใช้ index ตรง ๆ ไม่ต้อง sort เพิ่ม (`(user_id, checkin_date desc)` scan ถอยหลังได้)
- `conn-*` — เราใช้ PostgREST (HTTP) ไม่ได้เปิด Postgres connection เอง → pooling เป็นเรื่องของ Supabase

## ⛔ ที่จงใจไม่ทำ

**`alter table ... force row level security`** — สกิลแนะนำ แต่**ไม่ทำ** เพราะ seed (`npm run seed`) และ `verify:user` ใช้ service role
ถ้ามันไปกระทบ bypass ของ service role โดยไม่ได้ตั้งใจ **seed จะพังวัน pitch** — ความเสี่ยงไม่คุ้มกับประโยชน์ (ไม่มีใครต่อ DB ในนาม table owner อยู่แล้ว)

## งาน

- [x] `supabase/migrations/0003_rls_performance_and_constraints.sql`
- [x] `npm run verify:rls` — ยิงค่าขยะในนามผู้ใช้จริงแล้วเช็คว่า DB ปฏิเสธ
- [x] ตรวจข้อมูล 30 แถวที่มีอยู่ก่อน → **ผ่าน CHECK ใหม่ทุกค่า** (note ยาวสุด 73/200 · goal title 66/80 · chat 0 แถว)
- [x] **A รัน migration 0003 บน Supabase SQL Editor**
- [x] รัน `npm run verify:rls` อีกรอบ → ผ่านทั้งหมด

## Acceptance criteria

- `verify:rls` ผ่าน 100% (RLS กันคนอื่น + CHECK กันค่าขยะ)
- แอปยังทำงานปกติทุกหน้า (เช็คอิน / dashboard / seed)

## Comments

---

2026-07-15 (A): **รัน migration แล้ว — ปิดครบทั้ง 5 รู และของถูกต้องยังผ่าน** · `verify:rls` ผ่านทั้ง RLS (กันคนอื่น) และ CHECK (กันค่าขยะ) · seed / verify:seed / เช็คอินจากหน้าเว็บจริงยังปกติ

เทสต์ต้องมี positive control ด้วยเสมอ — **CHECK ที่เข้มเกินจนบล็อกข้อมูลที่ถูกต้อง อันตรายกว่า CHECK ที่หลวม** · service role bypass ได้แค่ RLS ไม่ได้ bypass CHECK

หมายเหตุ agent-browser: ref ของ element หมดอายุตอน React re-render → ถ้าจะ automate ฟอร์มหลายขั้น ต้องรอ re-render จบก่อน snapshot รอบถัดไป (ไม่ใช่บั๊กแอป)
