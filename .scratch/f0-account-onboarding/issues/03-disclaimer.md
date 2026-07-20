# F0-03: Safety disclaimer บังคับรับทราบ

Status: done
Owner: A
Sprint: 1
Priority: M — ห้ามตัด (เกณฑ์ Safety)
Refs: FR-0.3, docs/08 Part 1
Blocked by: 02

## งาน

- [x] ขั้นสุดท้ายของ onboarding: แสดง disclaimer "wellness coach ไม่ใช่แพทย์ ไม่วินิจฉัย ไม่แนะนำยา หากมีอาการผิดปกติควรพบผู้เชี่ยวชาญ" + ต้องกดรับทราบก่อนเข้าแอป
- [x] บันทึก `disclaimer_accepted_at`
- [x] ข้อความกำกับถาวร: component `SafetyNotice` พร้อม + ใส่หน้า home แล้ว; coach/dashboard ยังไม่มี → F2/F4 import เพิ่มตอนสร้าง

## Acceptance criteria

- เข้าแอปโดยไม่กดรับทราบไม่ได้
- ข้อความกำกับเห็นได้จริงทั้งมือถือ/desktop โดยไม่รบกวนการใช้งาน

## Comments

2026-07-07 (หมายเหตุจาก D): onboarding stub (F0-01) ตอนนี้ **fake-set `disclaimer_accepted_at = now()`** เพื่อให้ flow ผ่านชั่วคราว — F0-03 ต้องเอา fake ออก แล้วแทนด้วย disclaimer จริงที่ผู้ใช้กดรับทราบก่อน ค่อย set timestamp (ทำใน onboarding ขั้นสุดท้ายตาม task ข้อ 1)

2026-07-07 (implement เสร็จ — บทบาท A): ทำ disclaimer จริงใน onboarding ขั้นที่ 4 (เอา fake ของ stub ออก)
- ขั้นสุดท้ายแสดง disclaimer + checkbox "ฉันเข้าใจว่า...ไม่ใช่คำแนะนำทางการแพทย์" → ปุ่ม "รับทราบและเริ่มใช้งาน" disabled จนกว่าจะติ๊ก
- `disclaimer_accepted_at` เขียนตอน submit เท่านั้น → profile ไม่ถูกสร้างจนกว่าจะรับทราบ → **เข้าแอปโดยไม่รับทราบไม่ได้** (AC1: guard เด้งกลับ /onboarding จนกว่าจะมี profile row)
- `src/components/safety-notice.tsx` — ข้อความกำกับถาวร (reusable) ใส่ใต้ home แล้ว; F2/F4 import ตอนสร้าง coach/dashboard (AC2)
Verify: build + lint ผ่าน; เหลือ click-through เต็มบน preview

2026-07-07 (verified → resolved): เทสต์ B บน preview ผ่าน — ปุ่ม "รับทราบ" กดไม่ได้จนติ๊ก checkbox, พิมพ์ URL home ข้ามไม่ได้ (เด้งกลับ onboarding), จบแล้วเห็น SafetyNotice ที่ home → **เข้าแอปโดยไม่รับทราบไม่ได้** (AC1) + ข้อความกำกับเห็นจริง (AC2)
