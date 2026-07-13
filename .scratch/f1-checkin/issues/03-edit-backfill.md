# F1-03: แก้ check-in ย้อนหลัง + บันทึกย้อนหลัง 1 วัน

Status: done
Owner: A
Sprint: 1
Priority: S
Refs: FR-1.3, FR-7.3
Blocked by: 02

## งาน

- [x] หน้า history รายการ check-in ย้อนหลัง → กดเข้าไปแก้/ลบรายรายการ
- [x] ปุ่ม "บันทึกของเมื่อวาน" ถ้าเมื่อวานยังว่าง (ลืมกรอกก่อนนอน)

## Acceptance criteria

- แก้แล้ว dashboard อัปเดตตาม
- ลบรายการได้จริง (เกณฑ์ privacy — แก้/ลบข้อมูลตัวเองได้)

## Comments

2026-07-13 (A): เสร็จแล้ว — branch `feat/f1-03-history-backfill` (ต่อยอดจาก branch ของ F1-04)

**URL ที่ล็อกไว้ (คีตะต้องลิงก์มาที่นี่ตาม FR-7.3):**

- `/checkin/history` — รายการย้อนหลัง 30 วัน แก้/ลบได้รายรายการ
- `/checkin/edit/[date]` — แก้หรือบันทึกย้อนหลังรายวัน
- ใช้ `/checkin/edit/[date]` แทน `/checkin/[date]` เพื่อไม่ให้ไปชนกับ `/checkin/history` (เอกสาร Next ไม่ได้รับประกันลำดับ static-vs-dynamic segment — เลี่ยงดีกว่าเดา)

**ของกลางที่เพิ่มเข้า data layer (เพิ่มอย่างเดียว ไม่แก้ของเดิม → ไม่กระทบใคร):**

- `deleteCheckin(date)` ใน `src/lib/checkins/actions.ts`
- `isCheckinDate()` / `isWithinBackfillWindow()` ใน `validate.ts` · `MAX_BACKFILL_DAYS = 30`

**จุดที่ตั้งใจทำต่างจากตอนอ่าน (บันทึกเหตุผลไว้):**

1. **ปลด midnight guard เฉพาะโหมดย้อนหลัง** — F1-01 มี guard `today() !== date` กันฟอร์มค้างข้ามเที่ยงคืน แต่หน้าแก้ย้อนหลัง `date` ไม่ใช่วันนี้เสมอ → guard จะบล็อกจนบันทึกไม่ได้เลย · แก้ด้วย prop `isBackfill` (หน้า `/checkin` derive วันเอง → ต้อง guard · หน้า edit วันมาจาก URL → ไม่ต้อง)
2. **จำกัดย้อนหลัง 30 วัน** — ไม่งั้นพิมพ์ URL `/checkin/edit/2020-01-01` แล้วสร้างแถวปี 2020 ได้ → ข้อมูลขยะปนเข้า pattern analysis
3. **`deleteCheckin` ใส่ `.eq("user_id", user.id)` ทั้งที่ RLS กรองให้อยู่แล้ว** — ต่างจากฝั่ง read ที่จงใจไม่ใส่ · สำหรับคำสั่งลบ การพึ่ง RLS ชั้นเดียวคือ single point of failure ยอมเขียนเกินดีกว่าลบข้อมูลผิดคน
4. **ยืนยันลบแบบ 2 จังหวะในการ์ด** ไม่ใช้ dialog — เลี่ยงการลง shadcn component เพิ่ม (จะไปแตะ `package.json` ซึ่งเป็นไฟล์ shared)
