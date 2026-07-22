# INFRA-27: ปุ่มสลับ dark/light ข้างปุ่มออกจากระบบ

Status: ready-for-human
Owner: A
Sprint: 3
Priority: C — ตัดได้ ถ้าชน QA/pitch
Refs: DESIGN.md (กฎข้อ 2 "Dark mode ตามค่าเครื่องอัตโนมัติ"), INFRA-14 (chart tokens dark mode)

## ปัญหา

Dark mode ทำครบแล้วทั้งชุด (token, chart 1-6, sidebar) แต่ผูกกับ `prefers-color-scheme` ล้วน — ผู้ใช้เลือกเองไม่ได้ ถ้าเครื่องตั้งไว้สว่างก็เห็นแค่โหมดสว่างตลอด ตอน demo ก็โชว์โหมดมืดไม่ได้ถ้าไม่ไปสลับที่ OS

**ขอบเขต:** toggle 2 สถานะเท่านั้น (สว่าง ⇄ มืด) — ไม่มีตัวเลือก "ตามระบบ" แยก · ค่าเริ่มต้นก่อนผู้ใช้เคยกด = ตามระบบ (ของเดิม)

## งาน

- [ ] `globals.css:5` — เปลี่ยน `@custom-variant dark` จาก media query เป็น attribute: `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *))`
- [ ] `globals.css:97-132` — บล็อกสี dark ให้ทำงานทั้ง 2 ทาง: `[data-theme="dark"]` (ผู้ใช้เลือก) และ `@media (prefers-color-scheme: dark)` ที่ **ไม่มี** `[data-theme="light"]` ครอบ (ค่าเริ่มต้นตามระบบ)
- [ ] `globals.css:143-153` — `color-scheme` ต้องตาม `data-theme` ด้วย ไม่งั้น scrollbar / native control สีเพี้ยน
- [ ] `layout.tsx` — inline script ใน `<head>` อ่าน `localStorage` แล้วเซ็ต `data-theme` บน `<html>` **ก่อน paint** (กันจอขาววาบตอนโหลด) · ต้องเป็น script ธรรมดา ไม่ใช่ effect
- [ ] `src/components/theme-toggle.tsx` — client component 2 variant คู่กับ sign-out: `ThemeToggleIconButton` (header มือถือ) + `ThemeToggleMenuItem` (sidebar เดสก์ท็อป) · ไอคอน Lucide `Sun`/`Moon` · เขียน localStorage + สลับ `data-theme`
- [ ] วางปุ่ม: `app/(app)/layout.tsx:31` ซ้าย `SignOutIconButton` · `app-sidebar.tsx:45` เหนือ `SignOutMenuItem`
- [ ] `layout.tsx:29-32` — `themeColor` เป็น media-query-based แถบ browser มือถือจะไม่ตามปุ่ม → อัปเดต `<meta name="theme-color">` ตอน toggle ด้วย
- [ ] แก้ DESIGN.md กฎข้อ 2 — ไม่ใช่ "ตามค่าเครื่องอัตโนมัติ" อย่างเดียวแล้ว

## กฎที่ต้องไม่พัง

- **ไม่แตะสีสักตัว** — token dark ครบแล้ว งานนี้เปลี่ยนแค่ "อะไรเป็นตัวสั่ง" · `dark:` 46 จุดในโค้ดตามมาเอง
- ปุ่มสูง ≥ 44px (DESIGN.md ข้อ 1) · icon-only ต้องมี `aria-label`
- ห้าม hardcode สี (ข้อ 3)
- ไม่เพิ่ม z-index ชั้นใหม่ (ทั้งแอปมี `z-10` / `z-50` เท่านั้น)

## Acceptance criteria

- กดปุ่มแล้วสลับธีมทันที ทั้งมือถือและเดสก์ท็อป
- รีเฟรชแล้วธีมที่เลือกยังอยู่ **และไม่มีจอขาววาบ** (ข้อนี้พลาดง่ายสุด — เช็คด้วยตาบน throttled network)
- ยังไม่เคยกดปุ่ม = ตามค่าเครื่อง (พฤติกรรมเดิมไม่เปลี่ยน)
- กราฟในโหมดมืดยังใช้ `--chart-*` ชุดมืด (ตรวจหน้า dashboard)
- `npm run format && npm run lint && npx tsc --noEmit && npm test && npm run build && npm run e2e` เขียวครบ

## Comments

---

22 ก.ค. (PM) — เปิด issue · ตกลงขอบเขตเป็น toggle 2 สถานะ วางข้างปุ่มออกจากระบบทั้ง 2 จุด

⚠️ **เหลือ 7 วันถึง code freeze (29 ก.ค.)** และคิวที่เหลือคือ QA-02 กับ pitch deck — งานนี้เป็น Priority C ตั้งใจให้ตัดทิ้งได้ ถ้าคน QA ยังไม่ครบ 4 คน × 3 วัน อย่าดึงคนมาทำอันนี้

---

22 ก.ค. (A) — เขียนเสร็จ รอรีวิว · branch `feat/infra-27-theme-toggle` · **ยังไม่ push**

**วิธีที่ใช้** — ตาม guide ของ Next 16 เอง (`node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md` หัวข้อ Themes) ไม่ได้ลง `next-themes` (กฎข้อ 3: ห้ามลง package เอง)

- `data-theme="light|dark"` บน `<html>` เป็นแหล่งความจริงเดียว · inline script ใน `<head>` ตั้งค่าให้ก่อน paint
- `@custom-variant dark` ชี้ไปที่ attribute แล้ว → `dark:` 46 จุดเดิมตามมาเองโดยไม่ต้องแก้ทีละไฟล์ · **ไม่ได้แตะค่าสีสักตัว**
- ปุ่มโชว์สถานะด้วย CSS (`dark:hidden` / `dark:block`) ไม่ใช่ React state → ไม่มี hydration mismatch และไม่ต้องรอ JS

**ที่เจอระหว่างทำ (ไม่ได้อยู่ในงานตั้งต้น):**

1. `components/ui/chart.tsx:106` gen `<style>` ด้วย `@media (prefers-color-scheme: dark)` — ถ้าไม่แก้ กราฟที่ใช้ `theme: {light, dark}` จะไม่ตามปุ่ม (ตอนนี้ยังไม่มีใครใช้ ก็เลยไม่เห็นอาการ) → แก้เป็น `[data-theme="dark"]` แล้ว
2. `viewport.themeColor` เดิมผูกกับ media query → แถบ browser มือถือจะค้างสีตามเครื่อง ไม่ตามปุ่ม → ย้ายไปให้ script คุม meta tag แทน
3. **ตอนสลับมีช่วงสีเพี้ยน ~1 วิ** — element ที่มี `transition-*` (Badge, Button, ชิป) crossfade ข้ามโหมด วัดได้ว่าสีตัวอักษรแท็บยังเป็น `rgb(248,249,248)` อยู่หลังกด แล้วค่อยลงเป็น `rgb(6,35,26)` → เห็นเป็นป้ายว่างเปล่าบนจอ **อันนี้จะเห็นชัดมากบนโปรเจกเตอร์** → ปิด transition ชั่วคราวตอนสลับ (`withoutTransitions` ใน `lib/theme.ts` แนวเดียวกับ `disableTransitionOnChange` ของ next-themes) วัดซ้ำแล้วสีลงตัวทันที

**ตรวจแล้ว** (นอกจาก 5 ด่าน CI + e2e 93 เคสเขียว):

| เช็ค | ผล |
| --- | --- |
| system light/dark × เคยกด/ไม่เคยกด (4 กรณี) | ✓ ค่าที่ผู้ใช้เลือกชนะค่าเครื่องเสมอ · ไม่เคยกด = ตามเครื่อง |
| inline script อยู่ก่อน `<body>` ใน HTML จริง | ✓ (มีด่าน e2e คุมแล้ว) |
| ปุ่ม 44px · ไม่มี horizontal scroll ที่ 320px | ✓ ทั้งตอนปกติและตอนโชว์ ออกเลย/ยกเลิก |
| accessible name สลับตามธีม | ✓ screen reader อ่านอันเดียว ไม่อ่านซ้อน |
| `dark:` variant ยังจับได้จริง | ✓ วัด `dark:bg-muted/10` เปลี่ยนค่าจริงระหว่าง 2 โหมด |
| กราฟใช้ token ชุดมืด | ✓ `--chart-1` = `#7dd3fc` |

**หมายเหตุ:** ตัดสินใจไม่ทำ fallback ตอนปิด JS (ต้องก๊อป token 33 บรรทัด) — แอปนี้ใช้ไม่ได้อยู่แล้วถ้าไม่มี JS และ script เป็น synchronous ใน `<head>` · ถ้าใครไม่เห็นด้วยให้เถียงในรีวิว

⚠️ รัน e2e เต็มชุดไป 3 รอบ → `checkin.spec.ts` upsert เช็คอิน "วันนี้" ของปาล์มตามปกติของมัน · ก่อน pitch รัน `npm run refresh:demo-week` (หรือ `npm run seed` ถ้าอยากคืนค่าเดิม) ตามที่ BOARD บอกอยู่แล้ว
