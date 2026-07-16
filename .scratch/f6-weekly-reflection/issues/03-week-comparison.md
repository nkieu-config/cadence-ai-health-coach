# F6-03: เทียบกับสัปดาห์ก่อนหน้า — ให้ผู้ใช้ "เห็นพัฒนาการ"

Status: done
Owner: A
Sprint: 3
Priority: M — ห้ามตัด (เกณฑ์ Reflection and Improvement)
Refs: FR-6.1, F6-01, docs/00 §11

## ปัญหา

เกณฑ์ **Reflection and Improvement** เขียนว่า *"ระบบช่วยให้ผู้ใช้เห็น**พัฒนาการ**และปรับเป้าหมายต่อได้"*

ตรวจ `src/lib` ทั้งหมดแล้ว **ไม่มีการเทียบสัปดาห์ต่อสัปดาห์อยู่ที่ไหนเลย** — `Reflection` มี `pillars` / `strengths` / `nextWeek` / `daysRecorded` ของสัปดาห์เดียว ไม่รู้จักสัปดาห์ก่อนหน้า · สิ่งเดียวในแอปที่สื่อความก้าวหน้าได้ตอนนี้คือปุ่ม 7/14/30 บน dashboard

แปลว่าเราจะเสียคะแนนเกณฑ์นี้แบบไม่รู้ตัว เพราะทุกคนคิดว่า "มี reflection แล้ว = ครบ"

## งาน

- [ ] `buildWeekComparison(current, previous)` — คำนวณส่วนต่างจาก `WeekFacts` ทั้งสองสัปดาห์ (บันทึกกี่วัน · นอนเฉลี่ย · ขยับเฉลี่ย · วันที่กินครบ · วันที่ข้ามมื้อเช้า)
- [ ] **คำนวณในโค้ด ไม่ใช้ AI** — ไม่กินโควตา · unit test ได้ · ใช้ได้แม้ Gemini ล่ม · ไม่มีความเสี่ยงคำต้องห้าม
- [ ] **คำนวณตอนอ่าน ไม่ฝังใน cache** — ปาล์มมี reflection 4 สัปดาห์ cache อยู่แล้ว (INFRA-16) ถ้าฝังในนั้นต้องรัน backfill ใหม่ = เสียโควตาฟรี ๆ
- [ ] `Reflection` เพิ่มฟิลด์ `comparison: WeekComparison | null` — **additive + nullable** ของเดิมไม่ขยับสักตัว
- [ ] ภาษาต้องเป็นกลาง — บอกตัวเลขกับทิศทาง ห้ามตัดสิน ห้ามให้คะแนน/เกรด (ตาม `REFLECTION_SYSTEM_PROMPT`)
- [ ] สัปดาห์แรก (ไม่มีสัปดาห์ก่อนหน้า) → `null` ไม่พัง

## Acceptance criteria

- unit test: มีข้อมูล 2 สัปดาห์ → ส่วนต่างถูกต้องทุกตัว · ไม่มีสัปดาห์ก่อน → `null` · สัปดาห์ก่อนไม่มีบันทึกเลย → ไม่หารศูนย์
- ปาล์มบน production เห็นส่วนต่างจริงโดย **ไม่ต้องรัน backfill ใหม่และไม่ยิง Gemini เพิ่ม**
- ไม่กระทบ signature ที่ 🟨/🟦 เรียกอยู่

## Comments

---

16 ก.ค. (A) — เสร็จ · merge แล้วผ่าน PR #39 · branch `feat/f6-03-week-comparison`

**เรียกใช้ (สำหรับ F6-02):** `getWeekComparison(periodStart, periodEnd)` — `@/lib/ai-outputs/queries` → `WeekComparison | null` · `null` = ไม่มีสัปดาห์ก่อนหน้าให้เทียบ (สัปดาห์แรกของผู้ใช้) ให้ซ่อนส่วนนี้ไปเลย

```ts
type WeekChange = {
  metric: "daysRecorded" | "sleepHours" | "movementMinutes" | "completeMealRate";
  label: string;   // ไทยพร้อมใช้ เช่น "นอนเฉลี่ย"
  unit: string;    // เช่น "ชม. ต่อวัน"
  current: number;
  previous: number;
  delta: number;   // current - previous ปัดเศษแล้ว
};
type WeekComparison = {
  previousStart: string;
  previousEnd: string;
  daysRecordedPrevious: number;
  changes: WeekChange[];
};
```

**สองการตัดสินใจที่ต่างจากที่เขียนไว้ตอนเปิด issue:**

1. **คำนวณตอนอ่าน ไม่ฝังใน `Reflection` เป็น additive field** — ถ้าฝัง reflection 4 สัปดาห์ที่ปาล์ม cache ไว้ (INFRA-16) จะไม่มีฟิลด์นี้ ต้อง backfill ใหม่ = เสียโควตาฟรี ๆ · แบบนี้ `Reflection` type กับ cache ไม่ขยับสักตัว ผู้เรียกเดิมไม่ต้องแก้อะไรเลย
2. **เทียบเฉพาะค่าเฉลี่ยต่อวัน + สัดส่วน + จำนวนวันบันทึก** — ผลรวมดิบหลอกตาเวลาจำนวนวันบันทึกไม่เท่ากัน ("กินครบ 5 วัน" ของสัปดาห์ที่บันทึก 7 วัน ไม่ได้ดีกว่า "2 วัน" ของสัปดาห์ที่บันทึกแค่ 3) · มี unit test ล็อกไว้ว่าค่าเฉลี่ยเท่ากันแต่จำนวนวันต่างกัน → delta ต้องเป็น 0

**พิสูจน์กับ production จริงครบ 4 สัปดาห์ · 0 Gemini call:**

```text
สัปดาห์ 2026-07-03..07-09 · เทียบกับ 06-26..07-02
  บันทึก:        5 → 7 วัน      (+2)
  นอนเฉลี่ย:      6.5 → 6.9 ชม.  (+0.4)
  ขยับเฉลี่ย:     9 → 16.4 นาที   (+7.4)
  กินครบทุกมื้อ:  0.4 → 0.57     (+0.17)
```

สัปดาห์เก่าสุดที่ไม่มีสัปดาห์ก่อนหน้า → คืน `null` ไม่พัง ตาม AC

**แถม:** `REFLECTION_DAYS` เคย hardcode ซ้ำ 3 ที่ (actions + 2 สคริปต์) ย้ายมาไว้ `reflection-facts.ts` จุดเดียว · เพิ่ม `shiftDate()` ใน `checkins/date.ts` และ `getCheckinsBetween()` ตามกติกาข้อ 5 (ห้ามกระจาย `new Date()`)
