# F0-03: Safety disclaimer บังคับรับทราบ

Status: ready-for-human
Owner: A
Sprint: 1
Priority: M — ห้ามตัด (เกณฑ์ Safety)
Refs: FR-0.3, docs/08 Part 1
Blocked by: 02

## งาน

- [ ] ขั้นสุดท้ายของ onboarding: แสดง disclaimer "wellness coach ไม่ใช่แพทย์ ไม่วินิจฉัย ไม่แนะนำยา หากมีอาการผิดปกติควรพบผู้เชี่ยวชาญ" + ต้องกดรับทราบก่อนเข้าแอป
- [ ] บันทึก `disclaimer_accepted_at`
- [ ] ข้อความกำกับถาวรใต้หน้า coach และ dashboard (ตาม docs/08 ชั้นที่ 1)

## Acceptance criteria

- เข้าแอปโดยไม่กดรับทราบไม่ได้
- ข้อความกำกับเห็นได้จริงทั้งมือถือ/desktop โดยไม่รบกวนการใช้งาน

## Comments

2026-07-07 (หมายเหตุจาก D): onboarding stub (F0-01) ตอนนี้ **fake-set `disclaimer_accepted_at = now()`** เพื่อให้ flow ผ่านชั่วคราว — F0-03 ต้องเอา fake ออก แล้วแทนด้วย disclaimer จริงที่ผู้ใช้กดรับทราบก่อน ค่อย set timestamp (ทำใน onboarding ขั้นสุดท้ายตาม task ข้อ 1)
