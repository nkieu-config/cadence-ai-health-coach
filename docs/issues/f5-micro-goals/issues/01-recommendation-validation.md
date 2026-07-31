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

15 ก.ค. (A): เสร็จ · branch `feat/f5-01-goal-ai` · **ปลดล็อกครึ่งที่สองของ F4-03** — F4-02 + F5-01 เสร็จทั้งคู่ 🟩 เริ่ม F4-03 ได้เลย

signature เดิมไม่แตะ 🟨 ไม่ต้องแก้ F5-02 · validation คำต้องห้ามเป็นด่านฝั่งโค้ด (FR-5.3 🔒) ไม่ผ่าน → retry สูงสุด 2 ครั้ง แล้ว fallback goal จากตารางโจทย์
