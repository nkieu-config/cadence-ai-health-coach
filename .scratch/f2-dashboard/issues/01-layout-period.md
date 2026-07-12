# F2-01: Dashboard layout + ตัวเลือกช่วง 7/14/30 วัน

Status: ready-for-human
Owner: B
Sprint: 1
Priority: M
Refs: FR-2.1, wireframe (INFRA-05)

## งาน

- [ ] โครงหน้า dashboard: การ์ดสรุปวันนี้, ส่วนกราฟ 3 pillars, ส่วน pattern table (placeholder ก่อน)
- [ ] Toggle ช่วงเวลา 7/14/30 วัน มีผลกับทุกส่วน
- [ ] Empty state เมื่อยังไม่มีข้อมูล → ชวนไป check-in
- [ ] ข้อความกำกับ safety ถาวรท้ายหน้า (ประสาน F0-03)

## Acceptance criteria

- Responsive ทั้งมือถือ/desktop
- ผู้ใช้ใหม่ไม่เจอหน้าว่างเปล่า — เจอคำชวนที่เป็นมิตร

## Comments

2026-07-12 (kickoff → B): **สาย Dashboard — ทำขนานได้เลย ไม่ต้องรอ F1 check-in ของ A**

**ไฟล์ที่คุณแก้:** `src/app/(app)/dashboard/page.tsx` (มี placeholder อยู่แล้ว — **แทนที่เนื้อหาในไฟล์นี้**) + สร้าง component เพิ่มใน `src/components/dashboard/`
อย่าแตะโซนคนอื่น: `lib/patterns` + `lib/ai` = ไม้ · `app/(app)/settings` = คีตะ · `app/(app)/checkin` = A
**Branch:** `feat/f2-dashboard`

**ปลดล็อกข้อมูล (ตาราง `checkins` ยังว่าง) — 1 นาทีจบ:**
เปิด Supabase → **SQL Editor** → วางไฟล์ **`supabase/seed-dev.sql`** → แก้อีเมลเป็นของตัวเอง → Run
→ ได้ข้อมูล 14 วันพร้อมทำกราฟทันที (ฝัง pattern ไว้: ทุกวันที่ 3 = วัน deadline → นอนน้อย ข้ามมื้อเช้า พลังงานต่ำ)

**ของที่มีให้แล้ว — อย่าเขียนใหม่:**

- **Guard + เมนู + layout: มีให้จาก `src/app/(app)/layout.tsx` แล้ว** — ไม่ต้องเขียน auth guard เอง เขียนแค่เนื้อหาหน้า
- **กราฟ: ติดตั้งให้แล้ว** — ใช้ `Chart*` จาก `@/components/ui/chart` (recharts + ผูกกับสี `--chart-1` ถึง `--chart-5` ใน theme อัตโนมัติ) **ไม่ต้อง `npm i` อะไรเพิ่ม และห้าม hardcode สี**
- **`src/lib/supabase/server.ts`** — query ได้เลย **ไม่ต้องใส่ `.eq("user_id", ...)`** เพราะ RLS กรองให้อัตโนมัติ
- **type `Checkin`** มีแล้วที่ `src/lib/patterns/types.ts` — import มาใช้ อย่านิยามซ้ำ
- **`SafetyNotice`** — layout ใส่ให้ทุกหน้าแล้ว (task ข้อ 4 เสร็จอัตโนมัติ)

**Starter step:** แทน placeholder ด้วยโครงหน้าจริง (empty state + toggle 7/14/30) → เปิด PR เล็ก merge เลย → ค่อยต่อกราฟใน F2-02 เป็น PR ถัดไป

**ก่อนลงงานจริง:** เปิด PR จิ๋ว 1 อันลองระบบก่อน (ดูกติกาใน `.scratch/BOARD.md`) — ยังไม่มีใครในทีมเคย push เลย
