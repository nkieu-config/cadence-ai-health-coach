# F3-01: lib/patterns — คำนวณ pattern candidates

Status: ready-for-human
Owner: C
Sprint: 1
Priority: M
Refs: FR-3.1, docs/07 (ตาราง candidates 4 ตัว)

## งาน

- [ ] ฟังก์ชัน pure รับ `checkins[]` คืน candidates 4 ตัวตาม docs/07: นอนน้อย×ข้ามมื้อเช้า/เครื่องดื่มหวาน, deadline×นอนดึก+เคลื่อนไหวน้อย, เคลื่อนไหว×นอน/energy วันถัดไป, กินครบมื้อ×energy
- [ ] Heuristic ความชัด: ต่างกัน ≥ 20% และ ≥ 3 วันต่อกลุ่ม จึงนับเป็น candidate
- [ ] Unit tests: เคสมี pattern ชัด, ไม่มี pattern, ข้อมูลขาดวัน, กลุ่มเล็กเกิน

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
