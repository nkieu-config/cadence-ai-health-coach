# QA-02: QA เต็มรอบตาม demo script

Status: ready-for-human
Owner: A
Sprint: 3
Priority: M
Refs: docs/03 (scenario ปาล์ม), docs/04 (FR ระดับ M ทั้งหมด)

## งาน

- [ ] เดิน scenario ปาล์มจบเส้นบน production: สมัครใหม่ → onboarding → check-in → dashboard → coach → goal → reflection
- [ ] ไล่เช็ค FR ระดับ M ทุกข้อใน docs/04 — ติ๊กผลลงไฟล์ `qa-results.md` ในโฟลเดอร์นี้
- [ ] **จับเวลา check-in จริง — หลักฐานของ FR-1.2 และเกณฑ์ Low Burden Design** (ดูรายละเอียดใน Comments)
- [ ] ทดสอบมือถือจริง ≥ 2 เครื่อง (iOS + Android) + จอโปรเจกเตอร์/จอใหญ่
- [ ] บั๊กที่เจอ → เปิด issue ใน feature โฟลเดอร์นั้น ๆ ระบุ severity

## Acceptance criteria

- Demo script เดินได้ 2 รอบติดโดยไม่เจอ blocker
- FR ระดับ M ผ่านครบ 100% ก่อน freeze
- **มีตัวเลขเวลา check-in จริง (มัธยฐาน + ช่วง) จากคนจริง ≥ 4 คน** — ไม่ใช่แค่เคลมว่า "≤ 3 นาที"

## Comments

2026-07-14 (A): **เพิ่มการจับเวลา check-in เข้าใบนี้** — FR-1.2 เขียนว่า "วัดจริงตอน dogfooding" แต่ไม่มีใครวัด · Low Burden Design เป็น 1 ใน 9 เกณฑ์ให้คะแนน

**ตกลงวิธีวัด:** ทุกคนในทีมจับเวลาตัวเองตอน check-in จริง 3 วันติด → บันทึกลง `qa-results.md` · วัดทั้งวันปกติและวันที่คำถามเสริมโผล่ครบ (เคสยาวสุด) · ถ้าเกิน 3 นาที → **ต้องตัดคำถาม ไม่ใช่แก้ตัวเลขในเอกสาร**

---

2026-07-15 (A): มี `npm run e2e` (Playwright smoke) เป็นโครงให้แล้ว — QA-02 ต่อยอดจากตรงนี้ · 📋 กรอกผลลงไฟล์ [`qa-results.md`](../qa-results.md) โครงพร้อมแล้ว

**ที่ QA-02 ต้องเติมเอง:** เดิน scenario ปาล์มจบเส้นบน production · จับเวลาเช็คอินจริง · เปิด Safari บน iPhone จริง ≥1 รอบ (Playwright ใช้ chromium จำลอง) · เทสต์ flow AI (โควตา **500 ครั้ง/วัน** หลัง INFRA-23 แต่อย่ากดรัว)

**ข้อควรรู้ตอนทดสอบ:** ฟอร์มเช็คอินเติมค่าเดิมจากบันทึกที่มีอยู่ → กดชิปที่เลือกอยู่แล้ว = **ปิดมันทิ้ง**
