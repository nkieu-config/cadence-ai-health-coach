# F7-02: ลบข้อมูลทั้งหมด / ลบบัญชี

Status: ready-for-human
Owner: 🟨 สิทธิ์+เป้าหมาย
Sprint: 1
Priority: M — ห้ามตัด (เกณฑ์ Privacy)
Refs: FR-7.2, docs/05 (on delete cascade)
Blocked by: 01

## งาน

- [ ] ปุ่ม "ลบข้อมูลทั้งหมด" (เหลือบัญชี) และ "ลบบัญชีถาวร" — confirm 2 ชั้นพิมพ์ยืนยัน
- [ ] ลบบัญชีผ่าน service role ฝั่ง server → cascade ลบทุกตาราง
- [ ] ทดสอบว่าไม่เหลือข้อมูลตกค้างตารางไหนเลย

## Acceptance criteria

- ลบบัญชีแล้ว query ทุกตารางด้วย user_id เดิม = 0 แถว (บันทึกหลักฐานใน Comments)

## Comments

---

15 ก.ค. (A) — kickoff

**ไฟล์**

- แก้ `src/app/(app)/settings/privacy/page.tsx` — เพิ่ม section ลบข้อมูลท้ายหน้า (แตก component ในโฟลเดอร์เดียวกันได้)

**เรียกใช้** — ส่วนที่แตะ service role เขียนให้หมดแล้ว คุณทำแค่ UI + confirm

- `deleteAllData()` — `@/lib/account/actions` → ลบข้อมูลทุกตาราง **เหลือบัญชี** → ผู้ใช้เริ่ม onboarding ใหม่
- `deleteAccount()` — `@/lib/account/actions` → **ลบบัญชีถาวร** cascade ทุกตาราง + sign out → `/login`
- ทั้งคู่คืน `{ error }` เมื่อไม่สำเร็จ — แสดงข้อความนั้นตรง ๆ ได้เลย

**ระวัง**

1. ปุ่ม "ลบบัญชี" บนเครื่องคุณจะขึ้นว่า *เครื่องนี้ไม่มี service role key* — **ปกติ ไม่ใช่โค้ดคุณผิด** (key อยู่กับ A คนเดียว) · UI + confirm ทดสอบได้ครบทั้งเส้น ส่วน "ลบข้อมูลทั้งหมด" ทดสอบได้เต็ม
2. ทดสอบกับ**บัญชีสมัครใหม่ทิ้ง ๆ เท่านั้น** — ห้ามใช้บัญชีตัวเอง เพื่อน หรือปาล์ม
3. ปิด AC (0 แถวทุกตาราง): A รัน `npm run verify:user` บน production ให้ แล้วแปะผลใต้คอมเม้นนี้

---

16 ก.ค. (A) — ⚠️ **หน้า privacy ถูก polish แล้ว (INFRA-18)** — โครงเปลี่ยนนิดหน่อย ทำ F7-02 ต่อได้เลย ไม่ชนกัน

หน้าเป็น **คอลัมน์เดียว** แล้ว: `<PageContainer width="content">` → `<div className="mx-auto max-w-3xl space-y-6">` → การ์ดเรียงลงมา · **เอา section ลบมาต่อเป็น `<Card>` ตัวสุดท้ายใน div `max-w-3xl` นั้น** (ท้ายสุด ใต้การ์ด "สิทธิ์การจัดการข้อมูล") · แตก component ไว้ `src/components/settings/` หรือข้างเคียงได้ · การ์ดลบควรใช้ `border-destructive/30` ให้เด่นว่าเป็นโซนอันตราย
