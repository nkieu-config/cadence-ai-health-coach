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

15 ก.ค. (A) — เสร็จ · branch `feat/f3-04-insufficient-data` · "< 7 วัน" เป็น state ของตัวเอง (`notEnoughData`) ไม่ใช่ error สีแดงอีกแล้ว

**ที่ยังจริงอยู่:** early-return อยู่ก่อนเรียก AI ทุกกรณี และ `computePatternCandidates` คืน `[]` เมื่อ < 7 วัน → pattern มโนเกิดไม่ได้ · dashboard เรียก `checkDataSufficiency` ได้เองจาก `checkins` ที่มีอยู่ ไม่ต้องมีปุ่มหรือยิง AI

**อัปเดต contract ให้ 🟦 แล้ว:** วิธีใช้เขียนไว้ใน kickoff ของ F2-04
