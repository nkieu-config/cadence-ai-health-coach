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

16 ก.ค. (A) — เสร็จ · branch `feat/infra-16-demo-ai-backfill` · รันจริงบน production แล้ว (reflection 4 สัปดาห์ + pattern 14/30 วัน) · สคริปต์ idempotent รันซ้ำได้

**ปลดหาง F6-02:** เพื่อน 🟨 สร้าง UI แล้วเห็นข้อมูลจริงเลย ไม่ต้องกด generate เปลือง quota
