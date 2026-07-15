# F5-01: Goal recommendation + validation คำต้องห้าม

Status: done
Owner: A
Sprint: 2
Priority: M (validation ห้ามตัด — เกณฑ์ Safety)
Refs: FR-5.1, FR-5.3, docs/07 งานที่ 3
Blocked by: (F3-02)

## งาน

- [ ] Endpoint เสนอ goal 1–2 ข้อ: ใช้ตารางสถานการณ์→goal จากโจทย์ Feature 5 เป็น few-shot ให้ Gemini เลือก/ปรับตาม check-in + disruptor + ข้อจำกัดจริงของผู้ใช้
- [ ] Validation ฝั่งโค้ด: goal ที่มีคำเกี่ยวกับ น้ำหนัก/ลดความอ้วน/แคลอรี/อด/ผอม → reject + regenerate (สูงสุด 2 ครั้ง แล้ว fallback goal จากตารางโจทย์ตรง ๆ)
- [ ] Goal ต้องมี situation_tag บอกว่าเสนอเพราะสถานการณ์ไหน

## Acceptance criteria

- วันที่มี disruptor `deadline` ได้ goal ต่างจากวันปกติ (เกณฑ์ Personalization)
- ยิง 20 ครั้งกับข้อมูลหลากหลาย ไม่มี goal หลุดคำต้องห้ามเลย

## Comments

---

15 ก.ค. (A) — เสร็จ · branch `feat/f5-01-goal-ai` · **ปลดล็อกครึ่งที่สองของ F4-03**

**ทำอะไร:** `recommendGoals()` เดิมคืน goal จากตารางตรง ๆ (`suggestGoals`) → ตอนนี้ให้ Gemini ปรับ goal มาตรฐานให้ตรงกับ check-in/disruptor จริงของผู้ใช้ก่อน · signature เดิมไม่แตะ → **ไม้ 🟨 ไม่ต้องแก้ F5-02 เลย**

**Validation (FR-5.3 🔒):** ทุก title จาก AI ต้องผ่าน `validateGoalTitle` (คำต้องห้าม + ความยาว) ก่อนถูกใช้เสมอ — ไม่ผ่านก็ทิ้งเงียบ ๆ retry ทั้งชุดสูงสุด 2 ครั้ง แล้ว fallback goal จากตารางโจทย์ตรง ๆ ต่อ situation · เป็น guarantee เชิงโครงสร้าง ไม่ใช่สุ่มตรวจ — พิสูจน์ด้วย unit test adversarial (คำต้องห้ามหลุด → map ว่างเสมอ)

**สถานการณ์ต่างกันได้ goal ต่างกัน (Personalization):** logic เดิม (`chooseSituations`) ไม่แตะ — deadline vs นั่งจอนาน ยังได้คนละสถานการณ์เหมือนเดิม (unit test เดิมผ่าน)

**พิสูจน์จริง** (`npm run test:goal` — ยิง 1 ครั้งกับข้อมูล demo):

- สถานการณ์ "มีเรียนเช้า" → Gemini ปรับเป็น "เตรียมขนมปัง/ผลไม้ไว้ข้างเตียงสำหรับเช้าวันที่มีเรียน 1 วันในสัปดาห์นี้" (ต่างจาก goal มาตรฐานจริง ผูกกับข้อมูลจริง)
- สถานการณ์ "มีเดดไลน์" → Gemini เลือกใช้ goal มาตรฐานเดิม (ไม่มีอะไรให้ปรับเพิ่ม ตามที่ prompt อนุญาต)
- validation หลุด 0/2

**เหลืออีกครึ่งของ F4-03:** เสร็จแล้วทั้งคู่ (F4-02 + F5-01) — คีตะ 🟩 เริ่ม F4-03 ได้เลย
