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

**ระวัง:** `generateInsight` ผูกกับปุ่มเท่านั้น **ห้ามเรียกตอน render** (โควตา 20 ครั้ง/วันทั้งแอป) · เช็ค `checkDataSufficiency` ก่อนโชว์ปุ่ม (< 7 วัน = ไม่มีปุ่ม ไม่ยิง AI) · มือถือพับเป็นการ์ดรายแถว ห้าม horizontal scroll (e2e เช็ค)

---

20 ก.ค. (A — ทำแทน 🟦 เพื่อปิดก่อน freeze) — **เสร็จ · deliverable ครบ 14/14** · ครบ 4 สถานะ: ข้อมูลไม่พอ / ยังไม่เคยวิเคราะห์ / มี pattern / ไม่พบรูปแบบ

**⚠️ กับดักที่ kickoff เขียนผิด — ห้ามใช้ `formatMetric(evidence.metric, value)`:** `evidence.metric` ถูกเก็บเป็นป้ายไทยแล้ว ไม่ใช่ enum key → `formatMetric()` throw → dashboard ขาว 500 ทั้งหน้า · ให้โชว์ `metric` ตรง ๆ + label กลุ่ม + จำนวนวัน

**หมายเหตุ demo:** insight cache ผูก `period_end = today()` → เน่ารายวันเหมือน goal (INFRA-24) · วัน pitch ต้องอุ่น cache หรือกดปุ่มวิเคราะห์สด · ปาล์มให้ ~10 รูปแบบ (เยอะ) — เลือกโชว์กี่อันเป็นการตัดสินใจ demo (QA-03)

---

20 ก.ค. (A) — **แพรรี่ต่อยอด (PR #66, merged):** ตาราง 4 คอลัมน์จริงบนเดสก์ท็อป · มือถือยังเป็นการ์ด · cap เปลี่ยน 4 → 5 — ปิดสวย
