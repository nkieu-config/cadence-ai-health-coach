# QA-06: ตรวจเอกสาร .md ทั้งหมด — แก้เนื้อผิด + ตัดส่วนบวม

Status: done
Owner: A
Sprint: 3
Priority: M — docs/11 เป็น deliverable ที่กรรมการอ่าน ห้ามมีข้อมูลผิด
Refs: INFRA-23, QA-05

## ผลตรวจ (115 ไฟล์)

**เนื้อผิด — โควตา/โมเดลตกยุคหลัง INFRA-23 (ย้าย 3.1-flash-lite, 20 → 500/วัน):**

- docs/11-limitations-future.md — deliverable ข้อ 14 · ยังเขียน "20 ครั้ง/วัน" 2 จุด + บอกว่า QA-01 ยังไม่ได้รัน
- docs/09-project-plan.md — risk register ยังระบุโควตา 20/วัน เป็นความเสี่ยงสูงที่ยังไม่แก้
- docs/adr/0003 — ADR เป็นบันทึกการตัดสินใจ ณ เวลานั้น ไม่ rewrite แต่เติม amendment ชี้ INFRA-23

**บวม:**

- DESIGN.md 688 บรรทัด — 199–666 เป็น Cohere design reference dump ที่ token ถูก map ลง `globals.css` หมดแล้ว (เอกสารบอกเอง "ไม่ต้องเปิดไฟล์นี้เทียบสีเอง") → ตัดออก เก็บกฎแอป + ส่วน "การนำไปใช้กับ HealthCoach" · ต้นฉบับดูได้จาก git history
- docs/pitch/ — checklist ก่อนขึ้นเวทีซ้ำ 3 ไฟล์ → demo-script เป็นเจ้าของเรื่อง "วันจริง" ที่เดียว

**จงใจไม่แตะ:**

- docs/00 (โจทย์อาจารย์) · หลักฐานดิบใน ai-safety-test + qa-pitch (แก้ = ทำลายความน่าเชื่อถือ) · issue ที่ปิดแล้ว (audit trail — ต้นทุนเก็บเป็นศูนย์ ลบแล้วเสีย process record)
