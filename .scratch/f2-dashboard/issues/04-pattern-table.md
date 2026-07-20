# F2-04: ตาราง Pattern → ความหมาย → Next Step

Status: done
Owner: 🟦 กราฟ
Sprint: 2
Priority: M
Refs: FR-2.3, โจทย์ Feature 2, output schema จาก F3-03
Blocked by: 01

## งาน

- [ ] Render ผลจาก `ai_outputs` (kind: pattern_analysis) เป็นตาราง 4 คอลัมน์: ด้าน / pattern ที่พบ / ความหมาย / next step
- [ ] สถานะ loading ระหว่าง generate + ปุ่ม refresh
- [ ] ข้อมูล < 7 วัน → แสดงข้อความ "ยังไม่พอวิเคราะห์" จาก F3-04
- [ ] มือถือ: ตารางพับเป็นการ์ดรายแถว

## Acceptance criteria

- ตรงรูปแบบตารางในโจทย์ Feature 2
- Gemini ล่ม → แสดง cache ล่าสุด ไม่ crash

## Comments

---

15 ก.ค. (A) — kickoff · **ไม่ต้องรอ F3-03** — ตอนนี้เป็น template ที่ใช้ได้จริง AI มาเสียบทีหลังหน้าตาเดิม

**ไฟล์**

- สร้าง `src/components/dashboard/pattern-table.tsx`
- แก้ `src/app/(app)/dashboard/page.tsx` — วางการ์ด (ครอบ `<Suspense>` ถ้าดึงข้อมูลเอง)

**เรียกใช้** — ทั้งหมดจาก `@/lib/ai-outputs/*`

- `getLatestInsight(days)` → `Insight | null` — อ่าน cache ไม่เรียก AI · `null` = ยังไม่เคยวิเคราะห์ → โชว์ปุ่ม
- `generateInsight(days)` → เรียก AI ~10 วิ — **ผูกกับปุ่มเท่านั้น ห้ามเรียกตอน render** (โควตา 20 ครั้ง/วันทั้งแอป)
- `checkDataSufficiency(checkins.length)` — `@/lib/ai-outputs/sufficiency` · pure ไม่แตะ DB/AI · `{ enough: false, message, daysNeeded }` เมื่อ < 7 วัน
- `formatMetric(metric, value)` → แปลง evidence เป็นข้อความไทย

**ตาราง 4 คอลัมน์ = `insight.patterns[]`:** `pillars` → ด้าน · `observation` → pattern ที่พบ · `meaning` → ความหมาย · `nextStep` → next step
**โชว์ `evidence` ด้วย** (`groupA/groupB: { label, days, value }`) — คือหลักฐานว่า AI ไม่ได้มโน

**ข้อมูล < 7 วัน (F3-04):** เช็ค `checkDataSufficiency(checkins.length)` **ก่อนโชว์ปุ่มวิเคราะห์** — `enough: false` → โชว์ `message` ชวนบันทึก (ไม่ต้องมีปุ่ม ไม่ยิง AI) · `enough: true` → โชว์ปุ่ม/ตาราง · ถ้าเผลอกดปุ่มตอนข้อมูลไม่พอ `generateInsight` ก็คืน `{ notEnoughData: true, message }` ให้แสดงได้เหมือนกัน

**ระวัง**

1. มือถือ: ตารางพับเป็นการ์ดรายแถว (ห้าม horizontal scroll — e2e เช็ค)
2. `generateInsight` คืน 3 แบบ: `{ ok }` · `{ notEnoughData, message }` · `{ error }` — เช็ค `"notEnoughData" in result` ก่อน `"error" in result`

---

20 ก.ค. (A — ทำแทน 🟦 เพื่อปิดก่อน freeze) — **เสร็จ · deliverable ครบ 14/14**

สร้าง `pattern-table.tsx` (server component) + `generate-insight-button.tsx` (client) · เดินหน้า dashboard ผ่าน Suspense · ครบ 4 สถานะ: ข้อมูลไม่พอ / ยังไม่เคยวิเคราะห์ (ปุ่ม) / มี pattern / วิเคราะห์แล้วไม่พบรูปแบบ

**⚠️ กับดักที่ kickoff เขียนผิด — ห้ามใช้ `formatMetric(evidence.metric, value)`:**

`toInsightPattern` เก็บ `evidence.metric` เป็น **ป้ายไทยแล้ว** ("อัตราการข้ามมื้อเช้า") ไม่ใช่ enum key · `value` เป็นเลขดิบ (1, 0.27) แต่ **enum key หายตอนเก็บ** จึง format ค่าไม่ได้ · `formatMetric()` เจอ default case → **throw → dashboard ขาว 500 ทั้งหน้า** (จับได้เพราะเทสกับ cache จริงที่อุ่นด้วย backfill ไม่ใช่แค่ stub)

**แก้:** evidence โชว์ `metric` (ป้าย) ตรง ๆ + label กลุ่ม + จำนวนวัน (ขนาดตัวอย่าง = หลักฐานว่าไม่มโน) · ตัวเลขเชิงปริมาณอยู่ใน `observation` อยู่แล้ว ("100% เทียบกับ 27%")

**เพิ่ม e2e:** `routes.spec.ts` — การ์ด "วิเคราะห์รูปแบบพฤติกรรม" แสดงทุกสถานะ cache · 43/43 ผ่าน

**หมายเหตุ demo:** insight cache ผูก `period_end = today()` → เน่ารายวันเหมือน goal (INFRA-24) · วัน pitch ต้องรัน `npm run backfill:demo-ai` อุ่น หรือกดปุ่มวิเคราะห์สด · ปาล์มตอนนี้ให้ ~10 รูปแบบ (เยอะ) — การเลือกโชว์กี่อันเป็นการตัดสินใจ demo (QA-03)
