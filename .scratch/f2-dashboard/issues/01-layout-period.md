# F2-01: Dashboard layout + ตัวเลือกช่วง 7/14/30 วัน

Status: done
Owner: B
Sprint: 1
Priority: M
Refs: FR-2.1

## งาน

- [x] โครงหน้า dashboard: การ์ดสรุปวันนี้, ส่วนกราฟ 3 pillars, ส่วน pattern table (placeholder ก่อน)
- [x] Toggle ช่วงเวลา 7/14/30 วัน มีผลกับทุกส่วน
- [x] Empty state เมื่อยังไม่มีข้อมูล → ชวนไป check-in
- [x] ข้อความกำกับ safety ถาวรท้ายหน้า (ประสาน F0-03)

## Acceptance criteria

- Responsive ทั้งมือถือ/desktop
- ผู้ใช้ใหม่ไม่เจอหน้าว่างเปล่า — เจอคำชวนที่เป็นมิตร

## Comments

2026-07-12 (kickoff → B): **สาย Dashboard — ทำขนานได้เลย ไม่ต้องรอ F1 check-in ของ A**

**ไฟล์ที่คุณแก้:** `src/app/(app)/dashboard/page.tsx` (มี placeholder อยู่แล้ว — **แทนที่เนื้อหาในไฟล์นี้**) + สร้าง component เพิ่มใน `src/components/dashboard/`
อย่าแตะโซนคนอื่น: `lib/**` = A · `app/(app)/coach` = 🟩 · `app/(app)/settings` `goals` `reflection` = 🟨 · `app/(app)/checkin` = A (zone เต็มใน BOARD)
**Branch:** `feat/f2-dashboard`

**ปลดล็อกข้อมูล (ตาราง `checkins` ยังว่าง) — 1 นาทีจบ:**
เปิด Supabase → **SQL Editor** → วางไฟล์ **`supabase/seed-dev.sql`** → แก้อีเมลเป็นของตัวเอง → Run
→ ได้ข้อมูล 14 วันพร้อมทำกราฟทันที (ฝัง pattern ไว้: ทุกวันที่ 3 = วัน deadline → นอนน้อย ข้ามมื้อเช้า พลังงานต่ำ)

**ของที่มีให้แล้ว — อย่าเขียนใหม่:**

- **Guard + เมนู + layout: มีให้จาก `src/app/(app)/layout.tsx` แล้ว** — ไม่ต้องเขียน auth guard เอง เขียนแค่เนื้อหาหน้า
- **กราฟ: ติดตั้งให้แล้ว** — ใช้ `Chart*` จาก `@/components/ui/chart` (recharts + ผูกกับสี `--chart-1` ถึง `--chart-5` ใน theme อัตโนมัติ) **ไม่ต้อง `npm i` อะไรเพิ่ม และห้าม hardcode สี**
- **ดึงข้อมูล: `getCheckins(7)` จาก `@/lib/checkins/queries`** → คืน `Checkin[]` ตรง type พร้อมใช้ (RLS กรอง user ให้เอง)
  ⛔ **ห้าม `supabase.from("checkins")` เอง** — ชื่อคอลัมน์ใน DB เป็น snake_case แต่ type เป็น camelCase ถ้า query เองจะไม่ตรง type
- **type `Checkin`** มีแล้วที่ `src/lib/patterns/types.ts` — import มาใช้ อย่านิยามซ้ำ
- **`SafetyNotice`** — layout ใส่ให้ทุกหน้าแล้ว (task ข้อ 4 เสร็จอัตโนมัติ)

**Starter step:** แทน placeholder ด้วยโครงหน้าจริง (empty state + toggle 7/14/30) → เปิด PR เล็ก merge เลย → ค่อยต่อกราฟใน F2-02 เป็น PR ถัดไป

**ก่อนลงงานจริง:** เปิด PR จิ๋ว 1 อันลองระบบก่อน (ดูกติกาใน `.scratch/BOARD.md`) — ยังไม่มีใครในทีมเคย push เลย

2026-07-14 (A): ยืนยันปิดงาน — merge แล้ว (PR แพรรี่ `Feat/f2 layout period`)

ทุกข้อทำครบและใช้งานบน production แล้ว · ติ๊กกล่องย้อนหลังเพราะตอน merge ลืมติ๊ก (บอร์ดนับ done อยู่แล้ว แต่ไฟล์ยังดูเหมือนไม่ได้เริ่ม)

**สิ่งที่แก้เพิ่มหลัง review:** หน้าเป็น Server Component (เดิมเป็น `"use client"` ทำให้เรียก `getCheckins()` ไม่ได้ → empty state ซึ่งเป็น AC ข้อ 2 ไปไม่ถึง) · ตัด `<main>` ซ้อนและ `max-w-7xl` ที่ตายใต้ shell · period toggle ทำใหม่เป็น segmented control (ของเดิมสูง 36px ไม่ถึง 44px และยืดผิดบนมือถือ)
