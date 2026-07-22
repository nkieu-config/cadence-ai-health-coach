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

16 ก.ค. (A) — เสร็จ · branch `feat/infra-18-privacy-declutter`

**ทำอะไร:** เลิก `lg:columns-2` (masonry) → คอลัมน์เดียว `mx-auto max-w-3xl space-y-6` · เลิก override ที่ทำให้แน่น — ปล่อยให้ Card default ทำงาน (title `text-base`, description `text-sm`, padding มาตรฐาน) · icon section `size-5` · table padding `py-2.5 → py-3` · เนื้อหาเดิมครบทุกตัวอักษร ไม่ตัด

**พิสูจน์:**

- e2e เขียว 30/30 — รวม `/settings/privacy` ทั้ง มือถือ light/dark + เดสก์ท็อป (h1/contrast/44px/no-scroll/console ผ่าน)
- tsc/format ผ่าน · privacy ไม่มี lint warning ใหม่
- screenshot: เดสก์ท็อปไม่มี masonry เบี้ยวแล้ว เป็นเอกสารคอลัมน์เดียวโปร่ง · มือถือโปร่งขึ้น (title ใหญ่ + เว้นวรรคดีขึ้น)

**ประสาน F7-02:** คอมเมนต์ในไฟล์ issue F7-02 แล้ว — 🟨 เอา delete section มาต่อเป็น `<Card>` ตัวสุดท้ายใน div `max-w-3xl` (ใต้การ์ด "สิทธิ์การจัดการข้อมูล") ใช้ `border-destructive/30` · ไม่ชนกัน
