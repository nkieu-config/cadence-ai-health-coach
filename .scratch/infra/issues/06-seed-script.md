# INFRA-06: Seed script — demo account "ปาล์ม"

Status: done
Owner: A
Sprint: 2
Priority: M
Refs: ADR-0004, docs/03, docs/05
Blocked by: 02

## งาน

- [x] `scripts/seed.ts` สร้าง demo account + check-in ย้อนหลัง 4 สัปดาห์
- [x] ฝัง pattern 3 เรื่องให้ชัด: นอนดึกคืนก่อน deadline, ข้ามมื้อเช้าวันเรียนเช้า (จันทร์/พุธ), เดินน้อยวันเรียน online
- [x] ข้อมูลต้องสมจริง: มีวันขาดบันทึก ~2 วัน/สัปดาห์, มี note ภาษาไทยแบบปาล์มพิมพ์เอง
- [x] รันซ้ำได้ (ลบของเก่าก่อน insert)

## Acceptance criteria

- รัน seed แล้วเปิด dashboard เห็น pattern ทั้ง 3 เรื่องใน pattern table
- Weekly reflection generate ได้อย่างน้อย 2 สัปดาห์

## Comments

2026-07-14 (A): **เสร็จแล้ว** — แต่ต้องแก้ `lib/patterns` ก่อน เพราะ ADR-0004 สัญญา pattern 3 เรื่อง แต่คำนวณได้แค่ 1 → เพิ่ม `online_class` เข้า enum disruptors + candidate `early-class-skip-breakfast` / `online-class-movement` (ไม่ต้อง migration)
บั๊กที่เจอ: candidate ที่ไม่มี template ถูกกรองทิ้งเงียบ ๆ (`eating-on-time-energy` จาก F1-05 ไม่เคยขึ้นหน้าจอ) → เขียนเทสต์คุมถาวรแล้วว่า candidate ทุกตัวต้องแปลงเป็น InsightPattern ได้

บัญชี demo `palm@example.com` / `palmcadence123` · `npm run seed` รันซ้ำได้ (ล้างของเก่าก่อนเสมอ) · demo beat: กด 7 วันเห็นน้อย → 14/30 วันเห็นครบ = พิสูจน์สดว่าระบบไม่สรุปมั่วเมื่อข้อมูลน้อย

⚠️ **ก่อน pitch:** ต้อง generate insight + reflection ของบัญชีนี้เข้า cache ล่วงหน้า (INFRA-07 + QA-03) — โควตา Gemini มีแค่ 20 ครั้ง/วัน
