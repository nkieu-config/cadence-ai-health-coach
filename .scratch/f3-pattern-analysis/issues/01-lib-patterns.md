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

2026-07-12 (kickoff → C): **สาย AI core — สายเดียวที่ไม่ต้องรอใครเลย 100%** (pure logic ไม่แตะ DB/UI)

**โซนไฟล์ของคุณ:** `src/lib/patterns/`, `src/lib/ai/`
อย่าแตะ: `app/dashboard` = B · `app/settings` + `scripts/seed.ts` = D · `app/checkin` = A
**Branch:** `feat/f3-patterns`

**เริ่มได้ทันทีเพราะ:** `computePatternCandidates()` เป็น **pure function รับ `Checkin[]`** → เขียน + เทสต์ด้วย**ข้อมูลสังเคราะห์**ได้เลย ไม่ต้องมี DB ไม่ต้องมีข้อมูลจริง ไม่ต้องรอ check-in ของ A

**ของที่มีให้แล้ว — อย่าเขียนใหม่:**

- **`src/lib/patterns/types.ts`** — type `Checkin`, `PatternCandidate`, `PatternGroup` ครบทุกฟิลด์ตรง docs/05
- **`src/lib/patterns/index.ts`** — `hasEnoughData()` + ค่าคงที่ heuristic พร้อม (`MIN_DAYS_FOR_ANALYSIS = 7`, `MIN_DAYS_PER_GROUP = 3`, `MIN_RELATIVE_DIFFERENCE = 0.2`); ส่วน `computePatternCandidates()` เป็น **stub ที่ throw อยู่** → เขียนตัวจริงแทน
- **นิยาม candidate 4 ตัว + วิธีคำนวณ** อยู่ครบใน **docs/07 § งานที่ 1** (ตาราง)
- **`lib/ai` + system prompt guardrail + harness `npm run test:ai` พร้อมใช้แล้ว** → F3-02 เหลือแค่รันยืนยัน + บันทึกผลลง issue (เกือบเสร็จ)
- **Test พร้อมรันแล้ว** — vitest ติดตั้งให้แล้ว สั่ง `npm test` (หรือ `npm run test:watch`) **ไม่ต้อง `npm i` อะไรเพิ่ม**
- **`src/lib/patterns/test-fixtures.ts`** — `makeCheckin({ sleepHours: 5 })` เติมค่า default ให้ทุกฟิลด์ที่ไม่ได้ระบุ และ `makeCheckins(10, i => ...)` สร้างหลายวันรวด → **ไม่ต้องพิมพ์ 16 ฟิลด์เองทุกเคส**
- **`src/lib/patterns/patterns.test.ts`** — มี test ตัวอย่างรันผ่านแล้ว ดูเป็นแบบได้เลย

**Starter step:** เขียน unit test ก่อน (4 เคสตาม task: pattern ชัด / ไม่มี pattern / ข้อมูลขาดวัน / กลุ่มเล็กเกิน) แล้วค่อย implement ให้ผ่าน — โมดูลนี้เป็น**แหล่งตัวเลขทั้งหมดที่ AI จะอ้าง** จึงบังคับมี test

**หมายเหตุโหลด:** Sprint 2 คุณหนักสุด (F3-03/04 → F4 coach → F5 goals) — เริ่มก่อนเพื่อนช่วยได้มาก

**ก่อนลงงานจริง:** เปิด PR จิ๋ว 1 อันลองระบบก่อน (ดูกติกาใน `.scratch/BOARD.md`)

---

2026-07-14 (C): เสร็จแล้ว — `computePatternCandidates()` คืน 7 candidates ครอบคลุมทุก metric ใน docs/07

**Candidate ที่คำนวณ:**

| id | เทียบอะไร |
| --- | --- |
| `sleep-eating-skip-breakfast` | นอน < 6 ชม. vs ≥ 6 ชม. → อัตราข้ามมื้อเช้า |
| `sleep-eating-sweet-drinks` | นอน < 6 ชม. vs ≥ 6 ชม. → เครื่องดื่มหวานเฉลี่ย |
| `deadline-sleep-bedtime` | วันมีเดดไลน์/สอบ vs วันปกติ → เวลาเข้านอน |
| `deadline-movement-minutes` | วันมีเดดไลน์/สอบ vs วันปกติ → นาทีเคลื่อนไหว |
| `movement-next-day-sleep` | หลังวันขยับ ≥ 15 นาที vs < 15 นาที → คุณภาพการนอนคืนถัดไป |
| `movement-next-day-energy` | หลังวันขยับ ≥ 15 นาที vs < 15 นาที → พลังงานวันถัดไป |
| `eating-energy` | วันกินครบมื้อ vs วันข้ามมื้อ → อัตราพลังงานสูง |

**3 เรื่องที่ต้องรู้ก่อนแก้โมดูลนี้ (กันพลาดซ้ำ):**

1. **เวลาเข้านอนใช้สเกล "ชั่วโมงนับจาก 20:00" (`bedTimeHours()`) ห้ามใช้เลขนาฬิกาตรง ๆ**
   `before_23` = 22.5 กับ `00_01` = 0.5 อยู่คนละฝั่งของนาฬิกา — เฉลี่ยรวมกันได้ 11.5 (เที่ยงวัน) แล้วจะสรุปว่า "วัน deadline นอนเร็วกว่าวันปกติ" ซึ่งตรงข้ามความจริง
   → สเกลใหม่เดินหน้าอย่างเดียว: 2.5 / 3.5 / 4.5 / 5.5 / 7.0 · มีเทสต์บังคับว่าต้องเรียงจากน้อยไปมากเสมอ

2. **"วันถัดไป" ต้องเช็ค `checkinDate` ห่างกัน 1 วันจริง ห้ามใช้ `checkins[i+1]` เฉย ๆ**
   array มีเฉพาะวันที่ผู้ใช้บันทึก — ถ้าลืมกรอก 2 วัน `checkins[i+1]` จะกลายเป็นวันที่ห่างไป 3 วัน แล้ว AI จะพูดว่า "คืนหลังจากวันที่คุณเดินเยอะ คุณหลับดีขึ้น" จากคืนที่ไม่ได้ติดกันเลย
   → `consecutivePairs()` จับคู่เฉพาะวันที่ติดกันจริง

3. **`computePatternCandidates()` เรียงข้อมูลเองก่อนคำนวณ** — ไม่ไว้ใจลำดับที่คนเรียกส่งมา
   (`makeCheckins()` เดิมเรียงวันที่ถอยหลัง แต่ `getCheckins()` เรียงไปหน้า → ตอนนี้แก้ให้ตรงกันแล้ว: **เก่า → ใหม่** ทั้งคู่)

**Threshold แยก 2 ตัว เพราะความหมายไม่เหมือนกัน:**

- `MIN_RATE_DIFFERENCE` (0.2) — ใช้กับอัตราส่วน (0–1): ต่างกัน **20 จุด**
- `MIN_RELATIVE_DIFFERENCE` (0.2) — ใช้กับค่าเฉลี่ย: ต่างกัน **20% เทียบกับกลุ่มอ้างอิง**

**Test: 15 เคส** — ครบทั้ง 4 เคสที่ issue กำหนด (pattern ชัด / ไม่มี pattern / **ข้อมูลขาดวัน** / กลุ่มเล็กเกิน) + regression test ของข้อ 1 และ 2 ข้างบน

**ถึงสาย Dashboard (F2-04):** `groupA.label` / `groupB.label` เป็นภาษาไทยพร้อมแสดงผลแล้ว เอาไปขึ้นตารางได้เลย
