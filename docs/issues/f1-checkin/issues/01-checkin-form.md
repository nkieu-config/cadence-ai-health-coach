# F1-01: Check-in form UI

Status: done
Owner: A
Sprint: 1
Priority: M — เส้นตาย 12 ก.ค.
Refs: FR-1.1, FR-1.2, FR-1.4, docs/05 (ฟิลด์ + ค่า)

## งาน

- [x] ฟอร์ม 4 กลุ่ม: กิน / นอน / เคลื่อนไหว / บริบทวัน — ทุกคำถามเป็นปุ่ม/ชิป ไม่มีพิมพ์ ยกเว้น note
- [x] คำถามเสริม (meal_feeling, late_reason, movement_blocker) แสดงเฉพาะเมื่อเกี่ยวข้อง และข้ามได้
- [x] Note จำกัด 200 ตัวอักษร
- [x] Mobile-first — dogfooding ส่วนใหญ่จะกรอกจากมือถือก่อนนอน

## Acceptance criteria

- กรอกจบจริง ≤ 3 นาที (จับเวลากับคนนอกทีม 1 คน)
- ค่าที่เลือกได้ตรง docs/05 ทุกฟิลด์

## Comments

2026-07-12 (kickoff → ผู้รับสาย Check-in): **⚠️ critical path — เลย deadline (12 ก.ค.) แล้ว ทีมรอเริ่ม dogfooding** · **Branch:** `feat/f1-checkin`

**โซนไฟล์ของสายนี้:** `src/app/checkin/`, `src/components/checkin/`, `src/lib/checkins/` — อย่าแตะโซนอื่น (`app/dashboard` = สาย Dashboard · `lib/patterns` + `lib/ai` = สาย AI · `app/settings` + `scripts/seed.ts` = สาย Privacy)

**Contract:** type `Checkin` ที่ `src/lib/patterns/types.ts` เป็นตัวกลางกับสาย AI — **import มาใช้ อย่านิยามซ้ำ** · ตาราง `checkins` มี `unique (user_id, checkin_date)` → **ใช้ `upsert` ไม่ใช่ `insert`**

---

2026-07-13 (A): เสร็จแล้ว — branch `feat/f1-checkin`

- **ของกลางที่ทีมใช้ต่อได้:** `src/lib/checkins/labels.ts` (ชื่อภาษาไทยของทุกค่า — Dashboard/ประวัติ ใช้ตัวนี้ อย่าตั้งชื่อเอง) และ `src/components/ui/chip.tsx` (Chip กลาง)
- วันที่ทั้งหมดอิง Asia/Bangkok ผ่าน `src/lib/checkins/date.ts` — **ห้ามใช้ `new Date().toISOString()` หาวันที่เองอีก**
