# F4-02: Context assembly ให้ coach

Status: done
Owner: A
Sprint: 2
Priority: M
Refs: FR-4.1, docs/07 งานที่ 2
Blocked by: 01

## งาน

- [ ] ก่อนส่ง Gemini: แนบ check-in 7 วันล่าสุด (ย่อ), patterns ล่าสุดจาก cache, goal ปัจจุบัน, โปรไฟล์ (สถานะ, วันเรียนเช้า, ข้อจำกัด)
- [ ] ไม่แนบชื่อ/email (docs/08 — ส่งเฉพาะข้อมูลพฤติกรรม)
- [ ] จำกัดประวัติแชทที่แนบ ~20 ข้อความล่าสุด กัน context ยาวเกิน

## Acceptance criteria

- ถาม "สัปดาห์นี้ฉันเป็นไงบ้าง" → coach ตอบอ้างข้อมูลจริงของผู้ใช้ ไม่ใช่คำตอบกลาง ๆ
- ตัวเลขที่ coach อ้างตรงกับข้อมูลที่แนบ (สุ่มตรวจ 3 บทสนทนา)

## Comments

---

15 ก.ค. (A): เสร็จ · branch `feat/f4-02-coach-context` · **ปลดล็อกครึ่งแรกของ F4-03** · signature เดิมไม่แตะ 🟩 ไม่ต้องแก้ F4-01

อีกครึ่งของ F4-03 คือ F5-01 (goal AI + validation) — คิวถัดไปของ A
