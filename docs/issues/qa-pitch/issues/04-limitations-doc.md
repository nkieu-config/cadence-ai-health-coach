# QA-04: เขียน Limitations & Future Improvement Plan

Status: done
Owner: A
Sprint: 3
Priority: M — deliverable 14
Refs: docs/01 (out of scope), docs/08 (หลักการเผื่ออนาคต)

## งาน

- [x] เขียน `docs/11-limitations-future.md`
- [x] Limitations ขั้นต่ำ: self-reported data, ไม่มี push notification, pattern เป็น correlation ไม่ใช่ causation, ข้อมูลสั้น, persona เดียว, พึ่ง Gemini free tier
- [x] Future ขั้นต่ำ: LINE/notification, wearable, multi-persona (เฟิร์น), aggregate dashboard องค์กรแบบ ≥ 20 คน, ประเมินผลกับผู้ใช้จริง
- [x] เพิ่มสิ่งที่เจอจริงจาก dogfooding — ส่วนนี้แหละที่กรรมการให้ค่า
- [x] อัปเดตแถว 14 ใน docs/10 เป็นเสร็จ

## Acceptance criteria

- ทุก limitation มี mitigation หรือ future plan รองรับ ไม่ใช่แค่ลิสต์ข้อแก้ตัว

## Comments

---

17 ก.ค. (A) — เสร็จ · `docs/11-limitations-future.md` · ครบตามที่ issue สั่ง + future 7 ข้อ + บทเรียนจาก dogfooding 5 ข้อ + ข้อจำกัดที่เจอเพิ่มระหว่างสร้าง (INFRA-20 โควตารีเซ็ต · cache เก่ากว่าบันทึกล่าสุด · guided flow เป็นบทเขียนไว้ ฯลฯ)

**อัปเดตต่อเนื่อง:** `docs/10` แถว 14 → ✅ · `docs/README.md` สารบัญเพิ่มบรรทัด 11

**ยังต้องเติมก่อน pitch:** ถ้า INFRA-20 หรือ F4-06 ไม่ทัน freeze ให้คงข้อจำกัดไว้ในเอกสารตามที่เขียน — **อย่าลบทิ้งเพื่อให้ดูดี** · เติมเวลากรอกจริงจาก QA-02 ลงหัวข้อ 11.2 เมื่อได้ตัวเลข
