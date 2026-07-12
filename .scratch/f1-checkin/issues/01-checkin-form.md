# F1-01: Check-in form UI

Status: ready-for-human
Owner: A
Sprint: 1
Priority: M — เส้นตาย 12 ก.ค.
Refs: FR-1.1, FR-1.2, FR-1.4, docs/05 (ฟิลด์ + ค่า)

## งาน

- [ ] ฟอร์ม 4 กลุ่ม: กิน / นอน / เคลื่อนไหว / บริบทวัน — ทุกคำถามเป็นปุ่ม/ชิป ไม่มีพิมพ์ ยกเว้น note
- [ ] คำถามเสริม (meal_feeling, late_reason, movement_blocker) แสดงเฉพาะเมื่อเกี่ยวข้อง และข้ามได้
- [ ] Note จำกัด 200 ตัวอักษร
- [ ] Mobile-first — dogfooding ส่วนใหญ่จะกรอกจากมือถือก่อนนอน

## Acceptance criteria

- กรอกจบจริง ≤ 3 นาที (จับเวลากับคนนอกทีม 1 คน)
- ค่าที่เลือกได้ตรง docs/05 ทุกฟิลด์

## Comments

2026-07-12 (kickoff → ผู้รับสาย Check-in): **⚠️ critical path — เลย deadline (12 ก.ค.) แล้ว ทีมรอเริ่ม dogfooding อยู่**

**โซนไฟล์ของสายนี้:** `src/app/checkin/`, `src/components/checkin/`, `src/lib/checkins/`
อย่าแตะโซนอื่น: `app/dashboard` = สาย Dashboard · `lib/patterns` + `lib/ai` = สาย AI · `app/settings` + `scripts/seed.ts` = สาย Privacy
**Branch:** `feat/f1-checkin`

**🎁 มีแม่แบบให้ก๊อปแล้ว — อย่าเขียนใหม่จากศูนย์:**

- **`src/components/onboarding/onboarding-form.tsx`** ← **ใกล้เคียงที่สุด ก๊อปโครงมาปรับได้เลย** มีครบ: multi-step stepper, `Chip` toggle (เลือกเดี่ยว + เลือกหลาย), `useTransition` + error state, ปุ่มถัดไป/ย้อนกลับ
- **`src/lib/onboarding/actions.ts`** ← แม่แบบ server action: getUser → validate → upsert → `revalidatePath` → `redirect` (F1-02 ใช้โครงเดียวกันเป๊ะ)
- **Guard + เมนู + layout: มีให้จาก `src/app/(app)/layout.tsx` แล้ว** — เขียนแค่เนื้อหาหน้า
- **หน้ามี placeholder อยู่แล้ว** ที่ `src/app/(app)/checkin/page.tsx` → **แทนที่เนื้อหาในไฟล์นี้**
- **`src/lib/supabase/server.ts`** — query/เขียนได้เลย **ไม่ต้องใส่ `.eq("user_id", ...)`** RLS กรองให้อัตโนมัติ
- shadcn: Card / Button / Input / Label / Textarea / Badge พร้อม

**📋 Contract — ห้ามเดาค่าเอง:**

- **type `Checkin`** ที่ `src/lib/patterns/types.ts` มีทุกฟิลด์ + ค่าที่รับได้ครบ (`energy_level` = low/medium/high · `sleep_quality` = 1–5 · `bed_time_bucket` = 5 ค่า · `disruptors`/`skipped_meals`/`movement_types` = array) — **import มาใช้ อย่านิยามซ้ำ** เพราะสาย AI (`lib/patterns`) อ่าน type ตัวเดียวกันนี้
- **ตาราง `checkins`** ใน `supabase/migrations/0001_init.sql` มี **`unique (user_id, checkin_date)`** → **ใช้ `upsert` ไม่ใช่ `insert`** (บันทึกซ้ำวันเดิม = แก้ของเดิม ไม่สร้างแถวใหม่) ← หัวใจของ F1-02
- DB มี check constraints (เช่น sleep_quality 1–5) → ค่าผิดจะถูก reject ให้ validate ฝั่ง server ด้วย

**⚠️ AC ที่โหดสุด — กรอกจบ ≤ 3 นาที:**

- ทุกคำถามเป็น**ปุ่ม/ชิป** ห้ามพิมพ์ (ยกเว้น `note`)
- คำถามเสริม (`meal_feeling` / `late_reason` / `movement_blocker`) **โผล่เฉพาะเมื่อเกี่ยวข้อง** เช่น `late_reason` แสดงต่อเมื่อ `bed_time_bucket` ดึก
- **Mobile-first** — dogfooding จะกรอกจากมือถือก่อนนอน ทดสอบบนจอมือถือจริง

**Starter step:**

1. ก๊อป `onboarding-form.tsx` → ปรับเป็น 4 กลุ่ม (กิน / นอน / เคลื่อนไหว / บริบทวัน)
2. ทำ `/checkin` page + guard ให้เปิดได้ + ฟอร์มแสดงครบ (ยังไม่ต้องบันทึกจริง) → **เปิด PR แรก merge เลย**
3. ต่อ F1-02 (server action upsert) เป็น PR ถัดไป — ให้ขึ้น prod เร็วที่สุด ทีมจะได้เริ่ม dogfooding

**ก่อนลงงานจริง:** ถ้ายังไม่เคย push ในโปรเจกต์นี้ ให้เปิด PR จิ๋ว 1 อันลองระบบก่อน (กติกาใน `.scratch/BOARD.md`)
