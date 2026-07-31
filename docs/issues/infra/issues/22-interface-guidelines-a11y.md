# INFRA-22: อุด a11y ที่ Web Interface Guidelines review เจอ

Status: done
Owner: A
Sprint: 3
Priority: M — กระทบเกณฑ์ Prototype Quality ตอน demo (กรรมการกด Tab / ใช้ screen reader ได้)
Refs: INFRA-08, INFRA-09, web-interface-guidelines review

## ปัญหา (จาก review วันนี้)

รัน checklist ของ Vercel Web Interface Guidelines ทั้งแอป — โครงหลักผ่าน (focus ring, aria-label ปุ่ม icon, autocomplete ฟอร์ม auth, reduced-motion, color-scheme) แต่มี 3 จุดที่เป็น a11y จริงและ demo เห็นได้ + งานเก็บกวาดตัวอักษร

**A11y จริง (คนใช้คีย์บอร์ด/screen reader เข้าไม่ถึง):**

1. **DisruptorTick กดได้แค่เมาส์** — marker บนแกนวันของกราฟเปิด popover (ปัจจัยรบกวน + note) ด้วย hover/click เท่านั้น · เป็น `<div onClick>` ใน `<foreignObject>` ไม่มี `role`, `tabIndex`, keyboard handler → **คีย์บอร์ดเข้าไม่ถึงข้อมูลเลย** จุดขาย Personalization ของ F2-03 หายไปสำหรับคนกลุ่มนี้
2. **แชท: ข้อความโค้ชโผล่แบบ async ไม่มี `aria-live`** — screen reader ไม่รู้ว่าโค้ชตอบแล้ว
3. **error box ไม่มี `role="alert"`** — error ใน goal cards + แชทโผล่เงียบสำหรับ screen reader

**เก็บกวาด (ปลอดภัย):**

4. `...` → `…` (ellipsis จริง) 6 จุด: delete-zone, chat ×3, goal-suggestion-card, generate-reflection-button
5. `themeColor` ใน layout metadata (light/dark) — แถบ browser มือถือกลืนพื้นหลัง

## จงใจไม่ทำในใบนี้

- **`transition-all` → property เจาะจง (8 จุด)** — ส่วนใหญ่ animate หลาย property พร้อมกัน (scale + ring + border) การเปลี่ยนเป็น property เดียวเสี่ยง animation หายเงียบ ๆ แบบเคส movement tab · value ต่ำ (guideline nicety ไม่ใช่บั๊กที่ผู้ใช้เห็น) risk สูง — ไม่คุ้มช่วงใกล้ freeze
- **แท็บ 3 pillar sync URL** — แตะไฟล์กราฟของ 🟦 เพื่อ deep-link ที่ไม่มีใครใช้
- `ui/button.tsx` `ui/badge.tsx` `transition-all` — โค้ด shadcn vendored, `all` จงใจครอบหลาย state

## งาน

- [ ] `disruptor-overlay.tsx` — เฉพาะวันที่มี disruptor: `role="button"` + `tabIndex={0}` + `aria-label` (วันที่ + รายชื่อปัจจัย) + `onKeyDown` Enter/Space เรียก `onMarkerClick` (preventDefault Space) · วันเปล่าคงเป็น div ธรรมดา ไม่ focus
- [ ] `chat-client.tsx` — กล่อง message list `role="log"` + `aria-live="polite"` · error box `role="alert"`
- [ ] `goal-suggestion-card.tsx` + `goal-progress-card.tsx` — error box `role="alert"`
- [ ] ellipsis 6 จุด + themeColor
- [ ] e2e กัน regression: marker ที่มี disruptor ต้อง `[role=button]` + focus แล้ว Enter เปิด popover ได้

## Acceptance criteria

- Tab ไปถึง disruptor marker แล้ว Enter เปิด popover ได้ (ไม่ต้องใช้เมาส์)
- marker ที่มี disruptor ยังสูง ≥ 44px (route guard เดิมไม่แดง)
- e2e เขียวครบทุก project · ไม่มี behavior อื่นเปลี่ยน

## Comments

---

18 ก.ค. (A) — **ปิด** · branch `fix/infra-22-a11y` · ทำครบทั้ง 5 ข้อ (DisruptorTick keyboard · แชท aria-live · error `role="alert"` ×3 · ellipsis · themeColor)

**e2e guard เพิ่ม:** focus marker → Enter → popover เปิด — กันไม่ให้ keyboard access หายเงียบถ้าใครแก้ overlay ต่อ
