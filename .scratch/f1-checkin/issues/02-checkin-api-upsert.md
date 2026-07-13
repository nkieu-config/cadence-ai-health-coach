# F1-02: Check-in API — upsert รายวัน

Status: done
Owner: A
Sprint: 1
Priority: M — เส้นตาย 12 ก.ค.
Refs: FR-1.1, docs/05 (unique user_id + checkin_date)
Blocked by: 01

## งาน

- [x] Server action/route บันทึก check-in — upsert ด้วย unique (user_id, checkin_date)
- [x] Validation ฝั่ง server ตาม check constraints ใน docs/05
- [x] วันนี้บันทึกแล้ว → เปิดหน้า check-in เห็นค่าเดิม แก้ได้ (ไม่สร้างซ้ำ)

## Acceptance criteria

- กดบันทึกซ้ำหลายครั้งในวันเดียว → มีแถวเดียวใน DB
- ค่านอกช่วง (เช่น sleep_quality 9) ถูก reject

## Comments

2026-07-13 (A): เสร็จแล้ว

- `saveCheckin()` ใน `src/lib/checkins/actions.ts` — upsert `onConflict: "user_id,checkin_date"`
- `validateCheckin()` ใน `src/lib/checkins/validate.ts` — กันค่านอกช่วง + note เกิน 200 + บันทึกล่วงหน้า (มี test)
- หน้า `/checkin` ดึงบันทึกวันนี้ด้วย `getCheckinByDate()` มาเติมในฟอร์มให้อัตโนมัติ → กดบันทึกซ้ำ = แก้ของเดิม
