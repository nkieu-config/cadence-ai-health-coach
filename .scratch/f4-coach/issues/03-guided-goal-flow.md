# F4-03: Guided flow "ตั้งเป้าสัปดาห์หน้า"

Status: ready-for-human
Owner: 🟩 โค้ช
Sprint: 2
Priority: M — คือ "coaching conversation อย่างน้อย 1 flow" ที่โจทย์บังคับ
Refs: FR-4.3, docs/07 งานที่ 2
Blocked by: 02, (F5-01)

## งาน

- [ ] Flow: coach ถาม (1) อยากเริ่มจาก กิน/นอน/ขยับ (2) สัปดาห์หน้าวันไหนตารางแน่น (3) ข้อจำกัดอะไร → เสนอ micro goal 2 ตัวเลือก → ผู้ใช้เลือก/ปรับ → บันทึกเป็น goal (status: active)
- [ ] คำถามใช้โทนตามตัวอย่างโจทย์ Feature 4
- [ ] Goal ที่ได้ผ่าน validation ของ F5-01 ก่อนบันทึก

## Acceptance criteria

- เดินจบ flow แล้วเห็น goal ใหม่ในหน้า goals ทันที
- ใช้เป็น demo หลักตอน pitch ได้ (ซ้อมกับ demo account)

## Comments

---

15 ก.ค. (A): ⛔ **อย่าเพิ่งเริ่ม** — flow นี้ต้องใช้ F4-02 (โค้ชรู้จักข้อมูล) + F5-01 (goal validation) ซึ่งเป็นงาน A ที่ยังไม่เสร็จ

ทำ F4-01 → F4-05 ไปก่อน · A เร่ง 2 ตัวนั้นให้ทันก่อนคุณว่าง — **เสร็จแล้วจะมาคอมเม้นปลดล็อกที่นี่**

เผื่อวางแผนล่วงหน้า: ไฟล์อยู่โซนเดิม `src/components/coach/` · ขั้นสุดท้ายของ flow บันทึกผ่าน `acceptGoal(title, situation)` — `@/lib/goals/actions`

---

15 ก.ค. (A) — ✅ **ปลดล็อกแล้ว** ทั้ง F4-02 และ F5-01 merge เข้า main แล้ว เริ่ม F4-03 ได้เลยเมื่อว่างจาก F4-05

- โค้ชรู้จักข้อมูลจริงของผู้ใช้แล้ว (`buildCoachContext`) — ใช้ตอบคำถามช่วง flow ได้
- `acceptGoal(title, situation)` ยังหน้าตาเดิมทุกอย่าง validate คำต้องห้ามอัตโนมัติอยู่แล้ว ไม่ต้องเรียกอะไรเพิ่ม
