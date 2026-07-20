# QA-05: Submission package + docs refresh

Status: done
Owner: A
Sprint: 3
Priority: M
Refs: docs/10, QA-01, QA-03, INFRA-23

## ปัญหา

เอกสารสถานะหลายไฟล์ค้างอยู่ที่กลางเดือน ก.ค. ขณะที่งานจริงวิ่งไปไกลกว่านั้นมาก ทำให้ทีมและกรรมการเห็นภาพผิด:

- `docs/10` บอกว่า F5-02 / F7-02 / QA-01 ยังไม่เสร็จ — ทั้งหมด merge แล้ว
- `.scratch/ai-safety-test/README.md` ชี้หลักฐานชุดเก่า (2.5-flash, 14–16 ก.ค.) ทั้งที่หลักฐานทางการคือชุด 19 ก.ค. บน `gemini-3.1-flash-lite` พร้อมลายเซ็นอิสระ
- `BOARD.md` นับวันเหลือผิด + ยังเขียนโควตา 20 ครั้ง/วัน (ปัจจุบัน 500/วัน หลัง INFRA-23)
- ยังไม่มีที่เก็บของนำเสนอ (deck / demo script / screenshot สำรอง)

## งาน

- [x] อัปเดต docs/10 ให้ตรงสถานะจริง + เพิ่มหมวด "แพ็กเกจส่งงาน"
- [x] จัด index `.scratch/ai-safety-test/README.md` — หลักฐานทางการ = ชุด 19 ก.ค. · ชุดเก่าเก็บเป็นประวัติ
- [x] อัปเดต BOARD.md (วันเหลือ · งานเหลือ · โควตาใหม่)
- [x] ปิดสถานะ QA-01 เป็น done
- [x] สร้าง `docs/pitch/` เป็นบ้านของ deck + demo script + screenshots
- [x] ลบไฟล์ขยะ local ที่ไม่อยู่ใน git (.DS_Store, test-results/)

## Acceptance criteria

- อ่าน docs/10 ไฟล์เดียวแล้วรู้ว่า deliverable 14 ข้ออยู่ไหน สถานะจริงเป็นอะไร และวันส่งต้องหยิบอะไรบ้าง
- ไม่มีเอกสารสองไฟล์ที่เล่าสถานะขัดกันเอง
