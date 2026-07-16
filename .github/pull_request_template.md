## ทำอะไร

<!-- สรุปสั้น ๆ ว่า PR นี้เพิ่ม/แก้อะไร -->

## Issue ที่เกี่ยวข้อง

<!-- เช่น .scratch/f1-checkin/issues/01-checkin-form.md -->

## เช็คก่อน request review

- [ ] `npm run format` แล้ว · `npm run lint` · `npm test` · `npm run build` ผ่าน
- [ ] ตรง acceptance criteria ของ issue
- [ ] ไม่มี secret / API key หลุดในโค้ด

### ถ้าแตะ UI (กฎเต็มอยู่ใน DESIGN.md ส่วนแรก)

- [ ] Responsive มือถือ + desktop · ไม่มี horizontal scroll ที่ 390px
- [ ] **dark mode** — ไม่มีจุดขาวโพลน · **กราฟยังเห็นแท่ง/เส้นชัด**
- [ ] กด **Tab** ไล่ทั้งหน้า — เห็น focus ตลอด · ทุกอย่างที่กดได้สูง ≥ 44px
- [ ] หน้าใหม่มี **`loading.tsx`** · การ์ดที่ดึงข้อมูล/เรียก AI เองครอบ **`<Suspense>`**
- [ ] **ไม่มี boolean prop คุมพฤติกรรม** — อ่าน call site แล้วรู้ว่าเรนเดอร์อะไร
- [ ] ไม่ hardcode สี — ใช้ token
- [ ] **`npm run e2e` ผ่าน** (~40 วิ · เปิดทุกหน้า × มือถือ/เดสก์ท็อป × light/dark)
- [ ] ถ้าแตะ AI output: ผ่าน guardrail — ไม่มีคำต้องห้าม ภาษาไม่ตัดสิน (ดู CONTEXT.md)

## หมายเหตุสำหรับ reviewer

<!-- จุดที่อยากให้ดูเป็นพิเศษ หรือสิ่งที่ยังค้าง -->
