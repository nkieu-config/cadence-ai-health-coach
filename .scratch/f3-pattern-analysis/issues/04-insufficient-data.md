# F3-04: เคสข้อมูลไม่พอ (< 7 วัน)

Status: done
Owner: A
Sprint: 2
Priority: M — ห้ามตัด (เกณฑ์ Safety: แยก pattern จากข้อสรุปที่ไม่แน่ชัด)
Refs: FR-3.3
Blocked by: 03

## งาน

- [ ] ข้อมูล < 7 วัน → ไม่เรียก Gemini เลย คืนสถานะ "ข้อมูลยังไม่พอ" + จำนวนวันที่บันทึกแล้ว
- [ ] ข้อความฝั่ง UI: ชวนบันทึกต่ออย่างเป็นมิตร บอกว่าอีกกี่วันจะเริ่มวิเคราะห์ได้

## Acceptance criteria

- บัญชีใหม่บันทึก 3 วัน → เห็นข้อความชวน ไม่เห็น pattern มโน
- ไม่มี Gemini call เกิดขึ้น (เช็คจาก log)

## Comments

---

15 ก.ค. (A) — เสร็จ · branch `feat/f3-04-insufficient-data`

**ทำอะไร:** เดิม < 7 วันคืน `{ error: "..." }` ธรรมดา (UI โชว์เหมือน error สีแดง) → ตอนนี้เป็น state ของตัวเอง `{ notEnoughData: true, daysRecorded, daysNeeded, message }`

**pure helper** `checkDataSufficiency(daysRecorded)` ที่ `lib/ai-outputs/sufficiency.ts`:

- `enough: false` พร้อม `daysNeeded` + `message` ที่เป็นมิตร ("บันทึกแล้ว 3 วัน · อีก 4 วันก็เริ่มดูรูปแบบได้แล้ว")
- daysRecorded = 0 ใช้ข้อความชวนเริ่มวันแรก ไม่พูดคำว่า "0 วัน"
- **dashboard เรียกได้เองจาก `checkins` ที่มีอยู่แล้ว** → โชว์ข้อความชวนได้ทันทีโดยไม่ต้องมีปุ่มหรือยิง AI

**ไม่ยิง Gemini แน่นอน (AC ข้อ 2):**

- early-return อยู่**ก่อน** `generateInsightText` ทุกกรณี
- และ `computePatternCandidates` เองก็คืน `[]` เมื่อ < 7 วัน → pattern มโนเกิดไม่ได้แม้แต่ทางเดียว (AC ข้อ 1)

**เทสต์:** 4 เคส — 7/30 วันพอ · 3 วัน (เหลือ 4) · 0 วัน (ข้อความวันแรก) · **ทุกข้อความชวนผ่าน `findForbiddenTerms` = ไม่มีคำตัดสิน**

**อัปเดต contract ให้ 🟦:** kickoff F2-04 เขียนวิธีใช้ `checkDataSufficiency` + `generateInsight` คืน 3 แบบแล้ว
