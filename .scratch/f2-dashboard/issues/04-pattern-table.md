# F2-04: ตาราง Pattern → ความหมาย → Next Step

Status: ready-for-human
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
