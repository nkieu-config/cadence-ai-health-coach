# F7-01: หน้า Privacy

Status: ready-for-human
Owner: D
Sprint: 1
Priority: M — ห้ามตัด (เกณฑ์ Privacy)
Refs: FR-7.2, docs/08 Part 2 (มีร่างข้อความให้แล้ว)

## งาน

- [ ] หน้า settings/privacy: ข้อความอธิบายจากร่างใน docs/08 — เก็บอะไร ใช้อย่างไร ไม่แชร์ให้ใคร แก้/ลบได้ทุกเมื่อ
- [ ] ตารางสรุป: ข้อมูลแต่ละชนิด + เก็บเพื่ออะไร (จากตาราง docs/08)
- [ ] ลิงก์ไปหน้า history (แก้/ลบรายรายการ)

## Acceptance criteria

- อ่านเข้าใจโดยคนไม่ใช่สายเทคนิค
- ตอบคำถามโจทย์ข้อ 9 ได้ครบจากหน้านี้หน้าเดียว (ใช้โชว์ตอน pitch)

## Comments

2026-07-12 (kickoff → D): **สาย Privacy + Seed — อิสระจากทุกสาย ไม่ต้องรอใคร**

**โซนไฟล์ของคุณ:** `src/app/settings/`, `scripts/seed.ts`
อย่าแตะ: `app/dashboard` = B · `lib/patterns` + `lib/ai` = C · `app/checkin` = A
**Branch:** `feat/f7-privacy`

**เริ่มได้ทันทีเพราะ:** ข้อความทั้งหน้า **ร่างไว้ให้แล้วใน docs/08 Part 2** — ก๊อปมาใช้ได้เลย (ตารางชนิดข้อมูล + ข้อความ privacy อยู่ในนั้นครบ)

**ของที่มีให้แล้ว — อย่าเขียนใหม่:**

- **Guard + เมนู + layout: มีให้จาก `src/app/(app)/layout.tsx` แล้ว** — เขียนแค่เนื้อหาหน้า ไม่ต้องเขียน auth guard เอง
- **หน้ามี placeholder อยู่แล้ว** ที่ `src/app/(app)/settings/privacy/page.tsx` → **แทนที่เนื้อหาในไฟล์นี้**
- **`src/lib/supabase/admin.ts`** — service role client (ไว้ใช้ตอน F7-02 ลบบัญชี)
- **`scripts/verify-db.ts`** — มีตัวอย่าง `auth.admin.createUser()` / `deleteUser()` ให้ดูเป็นแบบ
- **`npm run verify:db`** — รันซ้ำได้หลังทำ F7-02 เพื่อพิสูจน์ว่าลบแล้วไม่มีแถวตกค้าง (ใช้เป็นหลักฐานปิด AC)

**ลำดับงานของคุณ:** F7-01 (หน้านี้) → F7-02 (ลบข้อมูล/บัญชี) → **INFRA-06 seed script**
⚠️ ตัวสุดท้ายสำคัญที่สุดต่อทีม — ปลดล็อก (1) กราฟของ B (2) ข้อมูลเทสต์ของ C (3) demo account ตอน pitch → ถ้าทำ F7 เสร็จเร็ว ให้รีบขยับไป seed

**Starter step:** ทำ `/settings/privacy` ให้เปิดได้ (guard + วางข้อความจาก docs/08) → PR เล็ก merge เลย

**ก่อนลงงานจริง:** เปิด PR จิ๋ว 1 อันลองระบบก่อน (ดูกติกาใน `.scratch/BOARD.md`)
