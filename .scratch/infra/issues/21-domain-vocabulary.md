# INFRA-21: ย้ายคำศัพท์กลางออกจาก lib/patterns

Status: done
Owner: A
Sprint: 3
Priority: S — หนี้โครงสร้าง ไม่กระทบผู้ใช้

## ปัญหา

`lib/patterns/types.ts` ถือของ 2 อย่างที่คนละเรื่องกัน:

1. **คำศัพท์กลางของทั้งโปรเจกต์** — `Checkin` · `Pillar` · `Meal` · `Disruptor` · `EnergyLevel` · `MovementType` … **ถูก import จาก 30 ไฟล์** ทั้ง goals · chat · ai-outputs · components ทุกสาย
2. **type ของฟีเจอร์ pattern เอง** — `PatternId` · `PatternMetric` · `PatternCandidate` · `PatternGroup`

แปลว่า **entity หลักของแอปอยู่ในโฟลเดอร์ที่ตั้งชื่อตามฟีเจอร์วิเคราะห์** — ใครจะทำ F2-04/F5-02 ต้อง `import type { Checkin } from "@/lib/patterns/types"` ทั้งที่ไม่ได้ยุ่งกับ pattern เลย · และ `lib/checkins/` ซึ่งเป็นเจ้าของ entity จริง กลับมีแค่ `CheckinRow` (รูปร่างใน DB)

อาการข้างเคียง: `lib/patterns/test-fixtures.ts` (test helper ในโฟลเดอร์ production) ถูก import จาก **11 test files ข้ามโมดูล + 1 script** เพราะ fixture ที่สร้าง `Checkin` ต้องอยู่ข้าง type

## ทำไมทำตอนนี้

หน้าต่างเดียวที่ทำได้โดยไม่ชนใคร — **ไม่มี PR ค้าง ไม่มีใครกำลังเขียนโค้ด** · ถ้ารอ F2-04 กับ F5-02 เริ่ม จะแตะ 30 ไฟล์ที่เพื่อนเปิดอยู่พร้อมกัน · ทำวันนี้ = งานที่เหลือลงบนโครงที่ถูกตั้งแต่แรก

## งาน

- [x] `src/lib/domain.ts` — คำศัพท์กลาง ไม่ import ใครเลย (leaf)
- [x] `lib/patterns/types.ts` เหลือเฉพาะ type ของ pattern
- [x] `lib/checkins/` เลิกพึ่ง `patterns` — **ผลจริงดีกว่าที่วางไว้:** ไม่ต้องกลับทิศเป็น `patterns → checkins` เลย ทั้งคู่พึ่ง `domain` แทน จึงไม่ผูกกันสักทาง
- [x] `test-fixtures.ts` → `src/test/fixtures.ts` — test helper ออกจากโฟลเดอร์ production
- [x] `PILLAR_LABELS` ย้ายจาก `ai-outputs/format.ts` → `checkins/labels.ts` (`Pillar` ไม่ใช่ของ ai-outputs · ธรรมเนียมในโค้ดคือ label อยู่กับ type ของมัน)
- [x] อัปเดต BOARD/docs ที่อ้าง path เก่า

## Acceptance criteria

- ไม่มี circular dependency (ตอนนี้ก็ไม่มี ห้ามทำให้มี)
- `npm test` 135 · e2e 30/30 · build ผ่าน — **พฤติกรรมต้องไม่เปลี่ยนสักอย่าง** ใบนี้ย้ายของอย่างเดียว
- คนทำ F2-04/F5-02 import `Checkin` จาก `@/lib/domain` ได้ตรงไปตรงมา

## Comments

---

17 ก.ค. (A) — เสร็จ · branch `refactor/infra-21-domain` · **ย้ายของอย่างเดียว ไม่มีพฤติกรรมไหนเปลี่ยน**

**ทิศทางพึ่งพา ก่อน → หลัง:**

```text
ก่อน:  checkins → patterns          (checkins พึ่งฟีเจอร์วิเคราะห์ เพื่อขอ type ของตัวเอง)
       goals    → patterns          (ขอแค่ Checkin)
       chat     → patterns          (ขอแค่ Checkin)
       + อีก 26 ไฟล์ import "@/lib/patterns/types"

หลัง:  ทุกอย่าง → domain            (leaf · ไม่ import ใครเลย)
       patterns → domain
       ai-outputs → patterns        ← เหลือที่เดียวที่พึ่ง patterns จริง ๆ และมันควรพึ่ง
```

**patterns จากที่ทุกโมดูล import เหลือ `ai-outputs` ที่เดียว** — ซึ่งถูกต้อง เพราะ ai-outputs คือคนแปลง pattern candidate เป็น insight · goals/chat ไม่เกี่ยวกับ pattern เลยแต่เดิมต้อง import เพราะ `Checkin` ไปอยู่ผิดบ้าน

**ทำอะไร:**

1. `src/lib/domain.ts` — `Checkin` + enum ทั้งหมด (Pillar · Meal · Disruptor · EnergyLevel · MovementType …) · **ไม่ import ใครเลย**
2. `lib/patterns/types.ts` เหลือเฉพาะ `PatternId` · `PatternMetric` · `PatternCandidate` · `PatternGroup`
3. `lib/patterns/test-fixtures.ts` → `src/test/fixtures.ts` — test helper ออกจากโฟลเดอร์ production (ถูกใช้จาก 11 test files + `scripts/test-ai.ts`)
4. `PILLAR_LABELS` จาก `ai-outputs/format.ts` → `checkins/labels.ts` อยู่กับ label ตัวอื่นครบชุด (`Pillar` ไม่เคยเป็นของ ai-outputs)
5. BOARD กติกาข้อ 5 ชี้ `@/lib/domain` แล้ว — คนทำ F2-04/F5-02 อ่านแล้วรู้ทันที

**พิสูจน์ (AC: พฤติกรรมห้ามเปลี่ยน):** `npm test` 135 ผ่าน · e2e **30/30** · build/tsc/lint/format ผ่าน · แตะ 42 ไฟล์แต่ **ไม่มี logic เปลี่ยนสักบรรทัด** — import ล้วน

**ทำไมทำตอนนี้:** ไม่มี PR ค้าง ไม่มีใครเขียนโค้ดอยู่ · ถ้ารอ F2-04/F5-02 เริ่ม จะแตะไฟล์ที่เพื่อนเปิดอยู่พร้อมกัน 30 ไฟล์

**ที่จงใจไม่ทำในใบนี้:** แยก `chat-client.tsx` (759 บรรทัด) — 🟩 หมดคิวงานแล้ว ไฟล์แช่แข็ง แยกตอนนี้คือ churn เปล่า · `components/coming-soon.tsx` จะตายเมื่อ F5-02 เสร็จ — ลบตอนนั้นทีเดียว
