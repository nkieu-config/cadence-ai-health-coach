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

15 ก.ค. (A) — เสร็จ · branch `feat/f3-03-insight-gemini`

**ทำอะไร:** `generateInsight` เดิมใช้ template นิ่ง ๆ → ตอนนี้ส่ง candidate จาก `lib/patterns` ให้ Gemini เขียน observation/meaning/next_step เป็นภาษาไทย แล้วซ้อนกลับบน template · **สถิติ (evidence) + pillars มาจาก `lib/patterns` เสมอ ไม่ให้ Gemini แต่งเลข**

**กันพลาด 3 ชั้น:**

- responseSchema บังคับรูป JSON · parse ไม่ผ่าน → retry 1 ครั้ง → ยังไม่ได้ → `null`
- ทุกข้อความผ่าน `findForbiddenTerms()` — เจอคำเชิงเหตุผล/น้ำหนัก/อดอาหาร → ตัดทิ้ง fallback เป็น template **รายตัว**
- Gemini ล่ม/โควตาหมด → template ทั้งหมด (หน้าไม่พัง)

**cache-first เดิมอยู่แล้ว** — `isCacheUsable` เช็คก่อน ถ้า cache ใหม่กว่า check-in ล่าสุด → ไม่ยิง Gemini (AC ข้อ 2 ✅)

**พิสูจน์จริง** (`npm run test:insight` — ยิง Gemini 1 ครั้งกับ 14 วันของปาล์ม):

- **Gemini 10/10 สัญญาณ · คำต้องห้ามหลุด 0** · ภาษาเป็น "สัญญาณที่น่าติดตาม" ไม่มีเหตุ-ผล
- 3 แถว Feature 2 (early-class-skip-breakfast · deadline-sleep-bedtime · online-class-movement) ครบ ภาษาสวย (AC ข้อ 1 ✅)
- unit test 7 เคส: parse ตัด forbidden/id ปลอม/ฟิลด์ขาด, merge คง evidence จริง

**ยังไม่ทำในนี้ (แยก issue):** F3-04 ข้อความ "ข้อมูลไม่พอ" ตอนนี้ยังเป็นข้อความ hardcode ใน action — จะ polish ตอน F3-04
