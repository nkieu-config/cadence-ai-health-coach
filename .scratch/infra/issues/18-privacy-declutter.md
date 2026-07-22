# INFRA-18: /settings/privacy — คลายความอัดแน่น (single column)

Status: done
Owner: A
Sprint: 3
Priority: S — polish ก่อน demo
Refs: DESIGN.md, F7-01, docs/08

## ปัญหา

หน้า privacy เนื้อหาอัดแน่นมาก:

- เดสก์ท็อปใช้ `lg:columns-2` (masonry) → คอลัมน์เบี้ยว ช่องว่างล่างขวาโหว่ ไม่ balance
- การ์ด override ให้เล็กกว่า default: title `text-sm` (default `text-base`), description `text-xs` (default `text-sm`), padding `pb-2/pb-3`
- text-heavy อ่านยาก

## งาน

- [ ] เลิก masonry → คอลัมน์เดียว อ่านง่ายแบบเอกสาร (`max-w-3xl` กึ่งกลาง)
- [ ] เลิก override ที่ทำให้เล็ก/แน่น — ใช้ Card default (title `text-base`, desc `text-sm`, padding มาตรฐาน) · icon section `size-5`
- [ ] เว้นระยะ `space-y-6` ระหว่างการ์ด · เนื้อหาเดิมครบทุกส่วน
- [ ] มือถือ: ยังคอลัมน์เดียวเหมือนเดิม แค่โปร่งขึ้น

## Acceptance criteria

- ไม่มี masonry · การ์ดโปร่งขึ้น อ่านง่าย · เนื้อหาครบ
- e2e (routes /settings/privacy) เขียว — h1/contrast/44px/no-scroll ผ่าน
- F7-02 (🟨) เอา section ลบมาต่อท้ายได้ไม่ชนกัน

## Comments

---

16 ก.ค. (A) — **เสร็จ** · branch `feat/infra-18-privacy-declutter` · เนื้อหาเดิมครบ ไม่ตัด

**ประสาน F7-02:** 🟨 เอา delete section มาต่อเป็น `<Card>` ตัวสุดท้ายใน `max-w-3xl` (ใต้การ์ด "สิทธิ์การจัดการข้อมูล") ไม่ชนกัน
