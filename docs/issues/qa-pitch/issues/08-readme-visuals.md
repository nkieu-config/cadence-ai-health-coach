# QA-08: ให้ README ชูภาพมือถือ + dark mode แทนภาพเดสก์ท็อปใบเดียว

Status: ready-for-human
Owner: A
Sprint: 3
Priority: M — README คือหน้าแรกที่กรรมการเห็นก่อนเปิดแอป
Refs: [DESIGN.md](/docs/DESIGN.md) บรรทัดแรก · [docs/12-ui-inventory.md](/docs/12-ui-inventory.md)

## ที่มา

README มีภาพเดียวคือ `light-desktop-dashboard.png` ซึ่งขัดกับบรรทัดแรกของ DESIGN.md ที่ประกาศว่า
**"Cadence คือแอปมือถือ ไม่ใช่เว็บไซต์"** — คนที่เปิดเรโปจึงเห็นเดสก์ท็อปเป็นภาพแรก ทั้งที่เราออกแบบมือถือก่อนเสมอ

ตรวจแล้วเจอ 3 อย่างที่ทำให้ "เปลี่ยนไปใช้ภาพ dark/mobile ที่มีอยู่" ทำไม่ได้ตรง ๆ:

1. **ภาพที่อยากใช้ถูก gitignore** — [`.gitignore`](/.gitignore) ตัด `dark-*.png` และ `light-mobile-*.png` ทิ้ง
   เก็บแต่ชุด `light-desktop` · เขียน README อ้างไฟล์พวกนี้ = รูปแตกทั้งหมดบน GitHub
2. **ภาพ mobile ที่มีใช้ใน README ไม่ได้** — `npm run shots` ถ่าย `fullPage: true`
   ได้ `dark-mobile-history.png` 1170×13512 (1:11.5 · 1.28 MB) · เอาลง README = เสาสูงลิ่ว หน้าหนักเป็น MB
3. **ภาพทั้งชุดเก่า** — docs/12 เตือนเองว่าเป็นของก่อน UX audit และ `/coach` ถูกแก้ layout อีกรอบ 28 ก.ค.

## งาน

- [x] เพิ่มสคริปต์ `npm run shots:readme` — ถ่าย **viewport เท่านั้น** (ไม่ใช่ fullPage) · `deviceScaleFactor` 2
      · ครอบด้วยกรอบมือถือ (มุมมน + ขอบ) พื้นหลังโปร่ง · export เป็น WebP
- [x] ถ่าย 4 หน้าที่ตรงกับฟีเจอร์หลัก — dashboard · checkin · coach · goals × light/dark = 8 ใบ (+ เดสก์ท็อป 2)
- [x] เก็บที่ `docs/assets/readme/` (โฟลเดอร์ใหม่ ไม่โดนกฎ gitignore เดิม) — asset ถาวรคนละประเภทกับภาพ pitch ที่สร้างใหม่ได้ตลอด
- [x] README ใช้ `<picture>` + `prefers-color-scheme` ให้ธีมมืด/สว่างเห็นภาพคนละชุด
- [x] hero เปลี่ยนเป็นมือถือ 3 เครื่องเรียงแนวนอน
- [x] เพิ่มหัวข้อ "หน้าตาแอป" จับคู่ภาพ ↔ ฟีเจอร์ ↔ ลิงก์เข้า docs/12
- [x] ภาพเดสก์ท็อปเหลือ 1 ใบท้ายหัวข้อ เป็นหลักฐานว่า ≥1024px มี sidebar จริง — ไม่ใช่ตัวชู

## กติกาที่ยึด

- **ไม่แตะกฎ gitignore เดิม** — เจตนาของมัน ("ภาพ pitch สร้างใหม่ได้ ไม่ต้องเก็บ") ยังถูกอยู่ · แยกโฟลเดอร์แทนการเขียน `!` ทับ
- **ไม่แตะ `scripts/shots.ts` เดิม** — เป็นสคริปต์ที่ผลิตภาพสำรองวัน pitch มีด่านเช็ค h1/overflow อยู่ในนั้น
- ถ่ายด้วยบัญชี demo แบบอ่านอย่างเดียว ไม่กดปุ่มที่ยิง Gemini — ไม่กินโควตา

## Comments

---

29 ก.ค. (A) — เปิด issue จากการรีวิว README ก่อน code freeze

---

29 ก.ค. (A) — งานเสร็จ รอรีวิว · branch `docs/qa-08-readme-visuals`

**สิ่งที่เปลี่ยน**

- `scripts/shots-readme.ts` + `npm run shots:readme` — ถ่าย viewport 390×844 @2x ครอบกรอบมุมมนพื้นหลังโปร่ง แล้วแปลงเป็น WebP
- `docs/assets/readme/` — 10 ใบ รวม **780 KB** (ของเดิมใบเดียว 389 KB แต่สูง 2,544 px)
- README — hero เป็นมือถือ 3 เครื่อง (เช็คอิน · ภาพรวม · โค้ช) · หัวข้อใหม่ "หน้าตาแอป" · เดสก์ท็อป 1 ใบเป็นหลักฐาน sidebar

**เรื่องที่เจอระหว่างทางและแก้ไปแล้ว**

- ป้าย dev indicator ของ Next.js 16 ติดมาทับเมนูล่างทุกใบ — ซ่อนด้วย `addStyleTag` ตอนถ่าย
  (`npm run shots` ชุดเดิมก็ติดปัญหานี้เหมือนกัน ยังไม่ได้แก้ให้ เพราะกติกา issue นี้คือไม่แตะสคริปต์นั้น)
- ภาพ dashboard ที่ถ่ายจากหัวหน้าได้การ์ด "สรุปวันนี้" เปล่า (`--` ทั้ง 3 เสา) เพราะ `refresh:demo-week` **ตั้งใจลบ check-in
  ของวันนี้** ไว้ให้กรอกสดบนเวที — เปลี่ยนเป็นเลื่อนไปที่การ์ด "แนวโน้มรายวัน" ซึ่งตรงกับสโลแกน README มากกว่าอยู่แล้ว
- ถ่ายด้วย `qa-bot` ไม่ใช่ปาล์ม ตามกฎใน README — รัน `refresh:demo-week` ให้ qa-bot ก่อนถ่าย

**ตรวจแล้ว**

- ยิง README เข้า GitHub markdown API จริง — `<picture>` ถูกห่อเป็น `<themed-picture>` ของ GitHub เอง
  และ `align="right"` / `<br clear="right">` รอด sanitizer ทั้งคู่
- ด่าน CI ครบ 5: format · lint (เหลือ warning เดิมของ `chat-client.tsx`) · tsc · test 149/149 · build
- ไม่ได้รัน `e2e` เพราะไม่ได้แตะ UI — แก้แค่ README, สคริปต์ถ่ายภาพ และ asset

**เหลือให้คนตัดสิน** — ภาพชุดนี้ถ่ายจากข้อมูล qa-bot วันที่ 29 ก.ค. ถ้าวันนำเสนอ UI เปลี่ยนอีก ต้องรัน `npm run shots:readme` ซ้ำ
