# F3-03: Insight generation endpoint + cache

Status: done
Owner: A
Sprint: 2
Priority: M
Refs: FR-3.2, FR-3.4, docs/06 workflow 2
Blocked by: 01, 02

## งาน

- [ ] Endpoint: ดึง checkins → `lib/patterns` → ส่ง candidates + โปรไฟล์ให้ Gemini → JSON `{patterns: [{pillars, observation, meaning, next_step}]}`
- [ ] Prompt บังคับ: เขียนแบบ "สัญญาณที่น่าติดตาม" ห้ามสรุปเหตุผล, next_step เล็กและผูกบริบท
- [ ] Validate JSON ตรง schema — ไม่ตรง retry 1 ครั้ง แล้ว fallback ข้อความธรรมดา
- [ ] Cache ลง `ai_outputs`, invalidate เมื่อมี check-in ใหม่

## Acceptance criteria

- Seed data ปาล์ม → ได้ pattern ตรงกับ 3 เรื่องที่ฝังไว้ (INFRA-06)
- เรียกซ้ำโดยไม่มีข้อมูลใหม่ → ตอบจาก cache ไม่ยิง Gemini

## Comments

---

15 ก.ค. (A) — เสร็จ · branch `feat/f3-03-insight-gemini` · Gemini เขียนแค่ภาษา ส่วน **สถิติ (evidence) + pillars มาจาก `lib/patterns` เสมอ ไม่ให้ Gemini แต่งเลข**

**ข้อจำกัดที่ยังจริง:** parse ไม่ผ่าน → retry 1 ครั้ง · ข้อความที่ติด `findForbiddenTerms()` → fallback เป็น template รายตัว · Gemini ล่ม/โควตาหมด → template ทั้งหมด หน้าไม่พัง · cache ใหม่กว่า check-in ล่าสุด → ไม่ยิง Gemini

**ยังไม่ทำในนี้ (แยก issue):** ข้อความ "ข้อมูลไม่พอ" ยัง hardcode ใน action → polish ที่ F3-04
