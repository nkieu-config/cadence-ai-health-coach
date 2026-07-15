# F4-05: ลบประวัติแชท

Status: ready-for-human
Owner: 🟩 โค้ช
Sprint: 2
Priority: S
Refs: FR-4.5, FR-7.x
Blocked by: 01

## งาน

- [ ] ปุ่มลบประวัติแชททั้งหมดในหน้าแชท (มี confirm)
- [ ] ลบจริงจาก `chat_messages` ไม่ใช่ซ่อน

## Acceptance criteria

- ลบแล้ว query DB ไม่เหลือแถวของ user นั้น

## Comments

---

15 ก.ค. (A) — kickoff (ทำต่อจาก F4-01)

**ไฟล์:** ปุ่ม + confirm ใน `src/components/coach/` แล้ววางในหน้าแชท

**เรียกใช้:** `clearChatHistory()` — `@/lib/chat/actions` · "ลบจริงไม่ใช่ซ่อน" action จัดการแล้ว (ลบแถวจาก DB ผ่าน RLS) · คืน `{ error }` เมื่อพลาด — แสดงตรง ๆ

**ปิด AC:** ลบแล้ว `getChatHistory()` ต้องว่าง + รีเฟรชหน้าก็ยังว่าง
