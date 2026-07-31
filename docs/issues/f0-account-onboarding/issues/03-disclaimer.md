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

2026-07-07 (หมายเหตุจาก D): onboarding stub (F0-01) **fake-set `disclaimer_accepted_at`** ไว้ชั่วคราว — F0-03 ต้องเอา fake ออก แล้วแทนด้วย disclaimer จริง

2026-07-07 (implement เสร็จ — บทบาท A): ทำ disclaimer จริงใน onboarding ขั้นที่ 4 (เอา fake ของ stub ออก) · profile row สร้างตอนรับทราบเท่านั้น
`src/components/safety-notice.tsx` เป็นข้อความกำกับถาวรตัวกลาง — ใส่ที่ home แล้ว **F2/F4 import ตอนสร้าง coach/dashboard เอง**

2026-07-07 (verified → resolved): เทสต์ B บน preview ผ่าน — AC1 (เข้าแอปโดยไม่รับทราบไม่ได้) + AC2 ครบ
