# INFRA-17: Check-in desktop — step rail ข้างฟอร์ม (กันโล่ง)

Status: done
Owner: A
Sprint: 3
Priority: S — polish ก่อน demo
Refs: DESIGN.md (form 448px), FR-1.x

## ปัญหา

หน้า check-in บนเดสก์ท็อปเป็นฟอร์มแคบ 448px กลางจอ ที่ว่างสองข้างเยอะ — "เหมือน mobile" ตอนขึ้นจอโปรเจกเตอร์ demo

**ยึด DESIGN.md:** ฟอร์มแคบ 448px เป็นความตั้งใจ ("ฟอร์มแคบกรอกง่ายกว่า") — จึง**ไม่ขยายฟอร์ม** แต่เติม side panel ข้าง ๆ ให้เดสก์ท็อปดูตั้งใจ

## งาน

- [ ] เดสก์ท็อป (`lg`): วาง step-rail (ขั้นตอน 1-4 + สถานะ done/current/upcoming) ข้างซ้ายฟอร์ม ด้วย `lg:grid` — ฟอร์มยัง 448px
- [ ] มือถือ: เหมือนเดิมเป๊ะ (คอลัมน์เดียว + progress bar ในการ์ด) — rail ซ่อน, progress bar โชว์เฉพาะ `<lg`
- [ ] ทำทั้ง `/checkin` และ `/checkin/edit/[date]` ให้เหมือนกัน (ฟอร์มเดียวกัน)
- [ ] nudge "เมื่อวานยังไม่บันทึก" + ลิงก์ประวัติ ย้ายเข้า slot ให้ align กับฟอร์ม
- [ ] เพิ่ม note รูปแบบ "form + desktop side rail" ใน DESIGN.md

## Acceptance criteria

- เดสก์ท็อป: มี rail ข้างฟอร์ม ฟอร์มยัง 448px ไม่มี horizontal scroll
- มือถือ: หน้าตาไม่เปลี่ยนจากเดิม
- e2e (checkin + routes) เขียว — chip/ปุ่ม/h1/contrast/44px ผ่านครบ

## Comments

---

16 ก.ค. (A) — เสร็จ · branch `feat/infra-17-checkin-desktop-rail`

**ทำอะไร:** เดสก์ท็อป (`lg`) วาง step-rail (ขั้นตอน 1-4 · done ✓ / current / upcoming) ข้างซ้ายฟอร์มด้วย `lg:grid-cols-[13rem_minmax(0,28rem)]` · **ฟอร์มยัง 448px** ตาม DESIGN.md (คุมด้วย `max-w-md` ต่ำกว่า lg + grid column บน lg) · progress bar ในการ์ดโชว์เฉพาะ `<lg` (เดสก์ท็อปใช้ rail แทน) · nudge + ลิงก์ประวัติย้ายเข้า slot `nudge`/`footer` ให้ align กับฟอร์ม

**ยึด DESIGN.md:** ไม่ขยายฟอร์ม (แคบ = กรอกง่ายกว่า) · เพิ่ม note รูปแบบ "form + desktop side rail" ใน DESIGN.md แล้ว · rail เป็น `aria-hidden` (mirror ของ progress bar) ไม่ interactive → ไม่ชนกฎ 44px

**พิสูจน์:**

- e2e เขียว 30/30 — รวม `[เดสก์ท็อป] /checkin` (contrast/44px/no-scroll/console ผ่าน) + wizard 4 ขั้น + summary
- tsc/format ผ่าน · lint เหลือ 1 warning (ลบ `useRouter`/`today` ที่ไม่ใช้ใน checkin-form ทิ้งไปด้วย เดิม 3 → 1)
- screenshot จริง: เดสก์ท็อปมี rail ข้างฟอร์ม · มือถือเหมือนเดิมเป๊ะ (progress bar + คอลัมน์เดียว + เมนูล่าง)
- ทำทั้ง `/checkin` และ `/checkin/edit/[date]` (ฟอร์มเดียวกัน)
