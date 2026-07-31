# F3-01: lib/patterns — คำนวณ pattern candidates

Status: done
Owner: C
Sprint: 1
Priority: M
Refs: FR-3.1, docs/07 (ตาราง candidates 4 ตัว)

## งาน

- [x] ฟังก์ชัน pure รับ `checkins[]` คืน candidates 4 ตัวตาม docs/07: นอนน้อย×ข้ามมื้อเช้า/เครื่องดื่มหวาน, deadline×นอนดึก+เคลื่อนไหวน้อย, เคลื่อนไหว×นอน/energy วันถัดไป, กินครบมื้อ×energy
- [x] Heuristic ความชัด: ต่างกัน ≥ 20% และ ≥ 3 วันต่อกลุ่ม จึงนับเป็น candidate
- [x] Unit tests: เคสมี pattern ชัด, ไม่มี pattern, ข้อมูลขาดวัน, กลุ่มเล็กเกิน

## Acceptance criteria

- Tests ผ่านทั้งหมด — นี่คือส่วนเดียวของระบบที่ต้องมี unit test เพราะเป็นแหล่งตัวเลขทั้งหมดที่ AI อ้าง
- ไม่มีการเรียก AI ในโมดูลนี้เลย

## Comments

2026-07-12 (kickoff → C): **สาย AI core — สายเดียวที่ไม่ต้องรอใครเลย 100%** (pure logic ไม่แตะ DB/UI) · branch `feat/f3-patterns`

โซนของ C: `src/lib/patterns/`, `src/lib/ai/` · อย่าแตะ: `app/dashboard` = B · `app/settings` + `scripts/seed.ts` = D · `app/checkin` = A

โมดูลนี้เป็นแหล่งตัวเลขทั้งหมดที่ AI จะอ้าง จึง **บังคับมี unit test** · หมายเหตุโหลด: Sprint 2 C หนักสุด (F3-03/04 → F4 → F5)

---

2026-07-14 (C): เสร็จแล้ว — `computePatternCandidates()` คืน 7 candidates ครอบคลุมทุก metric ใน docs/07 · test 15 เคส

**3 เรื่องที่ต้องรู้ก่อนแก้โมดูลนี้ (กันพลาดซ้ำ):** เวลาเข้านอนใช้สเกล "ชั่วโมงนับจาก 20:00" ห้ามใช้เลขนาฬิกาตรง ๆ · "วันถัดไป" ต้องเช็คว่า `checkinDate` ห่างกัน 1 วันจริง ห้ามใช้ `checkins[i+1]` เฉย ๆ · ฟังก์ชันเรียงข้อมูลเองก่อนคำนวณ (เก่า → ใหม่) ไม่ไว้ใจลำดับที่คนเรียกส่งมา

**ถึงสาย Dashboard (F2-04):** `groupA.label` / `groupB.label` เป็นภาษาไทยพร้อมแสดงผลแล้ว เอาไปขึ้นตารางได้เลย
