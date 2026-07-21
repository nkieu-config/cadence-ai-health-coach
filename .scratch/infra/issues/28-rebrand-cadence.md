# INFRA-28: เปลี่ยนชื่อแบรนด์เป็น Cadence + เพิ่มโลโก้

Status: done
Owner: A
Sprint: 3
Priority: M — ต้องเสร็จก่อนถ่าย screenshot ลงเด็ค ไม่งั้นถ่ายซ้ำสองรอบ
Refs: src/components/brand.tsx, src/app/icon.svg, src/app/opengraph-image.png, CONTEXT.md

## ทำไม

`docs/00-mission-brief.md` **ไม่ได้บังคับชื่อ** (ไล่อ่านครบแล้ว มีแต่ deliverable 14 ข้อ)
และแอปยังไม่มีโลโก้เลย — sidebar กับ header เป็นตัวหนังสือเปล่า

"HealthCoach" บอกว่าเราจะโค้ชให้คุณสุขภาพดี ซึ่ง**ขัดกับสิ่งที่แอปทำจริง**
เราถอดวงแหวนเป้าหมายออก (UX-02) ไม่มีคะแนน ไม่มีตัวหาร เพราะ §8 ของโจทย์ห้ามกดดัน

**Cadence** = จังหวะ · ไม่มี cadence ไหนถูกหรือผิด มีแต่ของคุณ
ได้ประโยคขึ้นเวทีว่า *"เราไม่ให้คะแนนสุขภาพคุณ เราแค่ให้คุณเห็นจังหวะของตัวเอง"*
ซึ่งกินเกณฑ์ Target User Fit (15%) กับ Safety (10%) พร้อมกัน

โลโก้ = 3 เสาหลัก กิน·นอน·ขยับ ใช้สี `--chart-2/1/3` เดิม → แบรนด์กับ dashboard เป็นเรื่องเดียวกัน

## ขอบเขต — สิ่งที่ **ห้าม** เปลี่ยน

URL ทั้งหมดคงเดิม เพื่อไม่ต้องแตะ OAuth ซึ่งเป็นจุดเดียวที่ยังยืนยัน end-to-end ไม่ได้:

- `personal-healthcoach.vercel.app` (prod) และ `metadataBase`
- wildcard preview `healthcoach-*-nkieus-projects.vercel.app` ใน ADR-0005
- Vercel project ที่ชื่อ `healthcoach`
- `package.json` field `name` — แตะแล้ว lock file ขยับ ผิดกฎบอร์ดข้อ 3
- ไฟล์บันทึกย้อนหลังใน `.scratch/` (issue เก่า · log การรัน) — เป็นบันทึกว่า
  ตอนนั้นเกิดอะไรขึ้นจริง เขียนทับ = ปลอมประวัติ

## ขอบเขต — สิ่งที่เปลี่ยน

- UI copy ทุกจุด รวม **ข้อความ safety** (`safety-notice.tsx`, disclaimer ใน onboarding,
  ข้อความ privacy) — ต้องอ่านแล้วยังชัดว่าไม่ใช่บริการทางการแพทย์
- metadata `title.default` / `template` · OG card + alt text · favicon
- `CONTEXT.md` (ภาษากลาง) · `README` · `DESIGN.md` · `AGENTS.md` · `docs/` · `BOARD.md`
- เด็ค `docs/pitch/deck-outline.md`

## พ่วงมาด้วย: e2e ที่ยืนยันสตริงที่ตายแล้ว

`routes.spec.ts:75` เช็คว่า `"ยินดีต้อนรับสู่ HealthCoach 👋"` ถูกซ่อน —
สตริงนี้**ไม่มีอยู่ในโค้ดแล้ว** เทสจึงผ่านฟรีทุกครั้ง ไม่ได้ยืนยันอะไรเลย

เจตนาของเทสคือ "dashboard ต้องไม่ขึ้น empty state" → เปลี่ยนไปเช็ค
`"ยังไม่มีข้อมูลสุขภาพ"` ซึ่งเป็น empty state จริงของหน้านี้

## Definition of done

- [x] ไม่มีคำว่า HealthCoach เหลือใน UI · URL ทุกอันยังเป็น `personal-healthcoach` เหมือนเดิม
- [x] มาร์กใช้ `var(--chart-*)` ไม่ hardcode hex (ยกเว้น `icon.svg` ที่เป็นไฟล์ static)
- [x] favicon · OG card เป็นแบรนด์ใหม่
- [x] ด่าน CI ครบ 5 + `npm run e2e`

## Comments

### 21 ก.ค. 2026 — A

**มาร์ก** = `src/components/brand.tsx` ให้ `BrandMark` กับ `BrandLockup`
ใช้ `var(--chart-2/1/3)` → พลิกตาม dark mode เองโดยไม่ต้องมีโค้ดเงื่อนไข
วางที่ sidebar · header มือถือ · h1 หน้าแรก

**favicon** เปลี่ยนจาก `favicon.ico` เป็น `src/app/icon.svg` (file convention ของ Next)
ไฟล์นี้เป็น static asset จึงใส่ hex ตรง ๆ ได้ ไม่ผิดกฎ `DESIGN.md`
เพราะ CSS variable ไม่ทำงานในไฟล์ที่เบราว์เซอร์โหลดเป็นไอคอน

**OG card** วาดใหม่ให้เป็นมาร์กขยายใหญ่ + wordmark
tagline เปลี่ยนเป็น "เห็นจังหวะของตัวเอง / แล้วเริ่มจากก้าวเล็ก ๆ ที่ทำได้จริง"

**การกันไม่ให้ไปแตะ URL** — สคริปต์ rename ข้ามทุกบรรทัดที่มี
`personal-healthcoach` · `healthcoach-*` · `` `healthcoach` `` · `cd HealthCoach`
ตรวจหลังทำแล้ว: `src/` กับ `e2e/` ไม่เหลือคำว่า HealthCoach · URL ทุกอันยังอยู่ครบ

ยืนยันจาก production build จริง:

| จุด | ค่าที่ได้ |
| --- | --- |
| `<title>` | ภาพรวมสุขภาพ · Cadence |
| sidebar | Cadence (พร้อมมาร์ก) |
| favicon | `/icon.svg` |
| h1 หน้าแรก | Cadence |
| ข้อความ safety | Cadence เป็นผู้ช่วยดูแลสุขภาพทั่วไป ไม่ใช่บริการทางการแพทย์ — … |
| `og:title` | Cadence |

**e2e ที่แก้พ่วง** — `routes.spec.ts:75` เคยเช็คว่า `"ยินดีต้อนรับสู่ HealthCoach 👋"` ถูกซ่อน
แต่สตริงนั้นไม่มีในโค้ดแล้ว เทสจึงผ่านฟรีมาตลอด ไม่ได้ยืนยันอะไร
เปลี่ยนไปเช็ค `"ยังไม่มีข้อมูลสุขภาพ"` ซึ่งเป็น empty state จริงของ dashboard

ด่าน: format ✓ · lint ✓ (warning เดิม 1 อัน) · tsc ✓ · unit 135 ✓ · build ✓ · **e2e 61 ผ่าน 0 พัง**

### 21 ก.ค. 2026 — A (ตามหลัง)

พิจารณาชื่อยาว **"Cadence Personal HealthCoach"** แล้ว **ไม่เอา** — วัดในพื้นที่จริงของแอป:

| จุด | Cadence | Cadence Personal HealthCoach |
| --- | --- | --- |
| sidebar (ที่ว่างให้ตัวอักษร 160px) | 72px · 1 บรรทัด | 159px · **2 บรรทัด** ดันเมนูลง |
| header มือถือ (ที่ว่าง 294px) | 64px · 1 บรรทัด | 232px · 1 บรรทัด (ผ่าน) |
| แท็บเบราว์เซอร์ | อ่านครบ | ชื่อแบรนด์ถูกตัดทิ้ง |

แต่เหตุผลหลักไม่ใช่ layout:

1. บรรทัดที่ 3 ของ brief คือ *"AI **Personal Health Coach** for Students and First Jobbers"*
   → ตั้งชื่อผลิตภัณฑ์ตามชื่อโจทย์ กรรมการที่อ่าน brief มาจะเห็นทันที
2. ดึงความขัดแย้งที่เพิ่งเอาออกกลับเข้ามา — "HealthCoach" สัญญาว่าจะโค้ชให้สุขภาพดี
   ทั้งที่แอปจงใจถอดคะแนน/เป้าหมาย/ตัวหาร
3. ชื่อ 3 คำไม่มีใครเรียกเต็ม คนจะย่อเอง แล้วเราไม่ได้เลือกว่าย่อเป็นอะไร

**แก้ความกังวลที่ถูกต้องด้วยวิธีมาตรฐานแทน** — แยกแบรนด์ออกจากคำอธิบาย:

- `openGraph.title` = `"Cadence — AI Personal Health Coach"` → กระทบเฉพาะพรีวิวลิงก์
  **แท็บเบราว์เซอร์ยังสั้นเหมือนเดิม** (ยืนยันแล้ว: `<title>` = `Cadence`, `og:title` = ตัวยาว)
- เติมบรรทัด `AI PERSONAL HEALTH COACH` ใต้ h1 หน้าแรก (uppercase + tracking, `text-muted-foreground`
  ซึ่งเป็น token ที่ผ่าน contrast 4.5:1 อยู่แล้ว)

e2e 61 ผ่านหลังเพิ่มทั้งสองอย่าง

### ยังไม่ได้ทำ — ต้องมีคนทำต่อ

- **เด็ค** `docs/pitch/deck-outline.md` เปลี่ยนชื่อระบบให้แล้ว แต่สไลด์จริงยังไม่มี
- **screenshot** `docs/pitch/screenshots/` ยังเป็นของเก่า ต้องถ่ายใหม่หลัง deploy
- **แจ้งทีม** — แบรนด์เปลี่ยนกระทบทุกคน
