# INFRA-16: Backfill AI ให้ demo account (reflection ย้อนหลัง + pattern)

Status: done
Owner: A
Sprint: 3
Priority: M — ปิด AC ของ F6-02 + กัน quota
Refs: FR-6.2, docs/07, ต่อยอด INFRA-06 (seed) + F6-01

## ปัญหา

`generateReflection()` ทำแค่สัปดาห์ปัจจุบัน แต่ AC ของ F6-02 ต้อง "เห็น reflection ≥ 2 สัปดาห์" — ตรวจ production แล้ว **ปาล์มมี ai_outputs 0 แถว** แปลว่า:

1. F6-02 จะเปิดมาเจอ empty state — เดโมโชว์ประวัติหลายสัปดาห์ไม่ได้
2. พอเพื่อน 3 สายเริ่มสร้าง F2-04 / F5-02 / F6-02 แล้วล็อกอินปาล์ม จะเห็นว่างแล้วกดปุ่ม generate กันคนละหลายครั้ง = เปลือง quota 20/วันที่แชร์กันทั้งทีม

## งาน

- [ ] `scripts/backfill-demo-ai.ts` — ใช้ service role gen AI ให้ปาล์มลง `ai_outputs` (idempotent: ลบ-แล้ว-ใส่ต่อ period เดิม รันซ้ำได้)
- [ ] Reflection ย้อนหลัง 4 สัปดาห์ (สัปดาห์ 0–3, แต่ละอันมี ≥3 วัน) — ใช้ logic เดียวกับ `generateReflection` (buildWeekFacts → generateReflectionText → merge) แค่เลื่อน period
- [ ] Pattern analysis สำหรับช่วง 14 + 30 วัน (7 วันข้ามได้ — ปาล์มมีแค่ 6 วัน = notEnoughData โดยตั้งใจ)
- [ ] เช็ค quota ก่อนยิง + log ทุก period ว่าใช้ Gemini หรือ fallback

## Acceptance criteria

- รันแล้ว `getReflections()` ของปาล์มคืน ≥ 2 สัปดาห์ · `getLatestInsight(14)` และ `(30)` ไม่ใช่ null
- ไม่มีคำต้องห้ามหลุดในทุก output ที่ backfill
- รันซ้ำได้ไม่เกิดแถวซ้ำ

## Comments

---

16 ก.ค. (A) — เสร็จ · branch `feat/infra-16-demo-ai-backfill` · `npm run backfill:demo-ai` (มี `--dry` กันพลาด)

**รันจริงบน production แล้ว** — ยิง Gemini 6 ครั้ง (quota วันนี้ยังไม่ถูกใช้ก่อนหน้า):

- weekly_reflection **4 สัปดาห์** (10-16 / 3-9 ก.ค. / 26 มิ.ย.-2 ก.ค. / 19-25 มิ.ย.) — ทุกอันมี `strengths`, คำต้องห้ามหลุด 0
- pattern_analysis **14 + 30 วัน** — 10 สัญญาณ/ช่วง, คำต้องห้ามหลุด 0 · (7 วันข้าม — ปาล์มมี 6 วัน = notEnoughData ถูกต้อง)

**พิสูจน์ AC:** query production แล้ว `ai_outputs` = 6 แถวพอดี · reflection ≥2 ✅ · getLatestInsight(14)/(30) ไม่ null ✅ · ไม่มีแถวซ้ำ (idempotent: ลบ-แล้ว-ใส่ต่อ period) ✅

**reuse engine เดิม 100%** — `buildWeekFacts`/`generateReflectionText`/`mergeReflectionText` และ `computePatternCandidates`/`generateInsightText`/`mergeInsightPatterns` ตัวเดียวกับ server action · script แค่เลื่อน period + ยิงผ่าน service role → output เหมือน generate ในแอปเป๊ะ · cache-fresh ด้วย (ปาล์มไม่มี check-in ใหม่) กดในแอปจะไม่ยิง Gemini ซ้ำ

**ปลดหาง F6-02:** AC "เห็น reflection ≥ 2 สัปดาห์" มีข้อมูลรองรับแล้ว · เพื่อน 🟨 สร้าง UI แล้วเห็นจริงเลย ไม่ต้องกด generate เปลือง quota
