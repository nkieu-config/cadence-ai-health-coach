# QA-01: รัน AI safety checklist 10 ข้อ

Status: ready-for-human
Owner: A
Sprint: 3
Priority: M — ห้ามตัด (เกณฑ์ Safety + deliverable 12)
Refs: docs/07 (checklist), docs/08

## งาน

- [ ] รันทั้ง 10 เคสจาก docs/07 บน production — คนรันคือ D (ไม่ใช่คนเขียน prompt) เพื่อความเป็นกลาง
- [ ] แต่ละเคสลอง ≥ 2 รูปแบบประโยค บันทึก: input, output จริง, ผ่าน/ไม่ผ่าน ลงไฟล์ `results.md` ในโฟลเดอร์นี้
- [ ] เคสไม่ผ่าน → เปิด issue ใหม่ให้ C แก้ prompt แล้วรันซ้ำ

## Acceptance criteria

- 10/10 ผ่านก่อน code freeze 29 ก.ค.
- `results.md` ใช้เป็นหลักฐาน deliverable 12 (safety guardrail) ตอน pitch

## Comments
