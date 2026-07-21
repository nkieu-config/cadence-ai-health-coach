# INFRA-27: ทุกหน้าใช้ title เดียวกัน + onboarding ไม่มี loading + ลิงก์ที่แชร์ไม่มีพรีวิว

Status: done
Owner: A
Sprint: 3
Priority: M — กระทบการนำเสนอวัน pitch (สลับแท็บ · screenshot ลงสไลด์ · ส่งลิงก์ให้กรรมการ)
Refs: src/app/layout.tsx, src/app/onboarding/, src/app/opengraph-image.png

ตรวจตาม Next.js App Router patterns เทียบกับ docs ของ Next 16 ในเครื่อง
(`node_modules/next/dist/docs/01-app/`) ไม่ได้เชื่อ pattern จากเวอร์ชันเก่า

## 1. ไม่มี metadata รายหน้า — ทั้ง 12 route ขึ้นชื่อเดียวกัน

`export const metadata` มีที่ `src/app/layout.tsx` ที่เดียว → แท็บเบราว์เซอร์ขึ้น
**"HealthCoach"** เหมือนกันหมดทุกหน้า

กระทบวัน pitch โดยตรง:

- สลับแท็บตอนสาธิตแยกไม่ออกว่าหน้าไหนคือหน้าไหน
- screenshot ลงสไลด์ แถบ title ไม่ช่วยเล่าเรื่อง
- ประวัติเบราว์เซอร์เป็น "HealthCoach" เรียงกัน 12 บรรทัด
- screen reader อ่านชื่อหน้าเดิมซ้ำทุกครั้งที่ navigate (ต่อเนื่องจาก INFRA-22)

`title.template` ยังเป็น API เดิมใน Next 16 (ยืนยันที่
`03-api-reference/04-functions/generate-metadata.md:241`) และทุก `page.tsx`
เป็น Server Component ทั้งหมด จึง export `metadata` ได้ทุกไฟล์

## 2. `/onboarding` ไม่มี `loading.tsx`

`onboarding/page.tsx` ยิง Supabase 2 รอบก่อน render และไม่มี loading UI ครอบ
→ กดสมัครเสร็จแล้วหน้าจอค้างที่หน้าเดิมจนกว่า server จะตอบ ไม่มีสัญญาณว่ากดติด
เป็น first-run experience ของกรรมการถ้ามีใครลองสมัครเอง

**ข้อควรระวัง:** ห้ามแก้ด้วยการเพิ่ม `src/app/loading.tsx`
เพราะ loading ของ segment แม่ชนะของลูกเสมอ — เป็นบั๊กเดียวกับที่เคยทำให้
`loading.tsx` รายหน้าใน `(app)/` กลายเป็น dead code ทั้งหมด ต้องวางที่
`src/app/onboarding/loading.tsx` เท่านั้น

(`(auth)/login` กับ `/register` ไม่ต้องมี — ตรวจแล้วไม่มี data fetching)

## 3. ไม่มี `opengraph-image` → ลิงก์ที่แชร์เป็นการ์ดเปล่า

ถ้าส่ง `personal-healthcoach.vercel.app` ให้กรรมการทาง LINE/Discord
จะไม่มีรูปพรีวิว มีแค่ favicon

ใช้ **PNG static** ไม่ใช่ `ImageResponse` — เพราะ `ImageResponse` ต้องฝังฟอนต์ไทยเอง
ถ้าพลาดจะได้กล่องสี่เหลี่ยม (tofu) แทนตัวอักษร ซึ่งแย่กว่าไม่มีรูป
PNG ที่ render ด้วยฟอนต์จริงไว้ก่อนไม่มีความเสี่ยงนั้นเลย

## ไม่แก้ (ตัดสินใจแล้ว)

**`export const dynamic = "force-dynamic"` ที่ coach/goals/reflection** — ใส่ไว้ 3 จาก 8 หน้า
ทั้งที่ทุกหน้าอ่าน cookie ผ่าน Supabase จึง dynamic อยู่แล้ว (build แสดง `ƒ (Dynamic)`
ครบทุก route รวมหน้าที่ไม่ได้ใส่) → บรรทัดนี้เป็น no-op

แต่ **ไม่ลบตอนนี้** — กำไรคือความสะอาดอย่างเดียว ส่วนความเสี่ยงคือถ้าเราคิดผิด
หน้า dashboard จะโดน cache แล้วโชว์ข้อมูลเก่าตอนสาธิต เหลือ 9 วัน ไม่คุ้มแลก
เก็บเป็นงานหลัง pitch

## ตรวจแล้วปลอดภัย ไม่ต้องแก้

- **Server Action มี auth guard ครบ 18/18** — `goals/actions.ts` ดูเหมือนมี 4 exported
  แต่ guard ตัวเดียว ที่จริง guard อยู่ใน helper `currentUser()` ที่ทั้ง 4 ตัวเรียก
- `updateGoalStatus` รับ string จาก client โดยไม่ validate แต่ Postgres มี
  `check (status in ('active','done','dropped'))` กันไว้ (`0001_init.sql:40`)
- **โควตา Gemini 500/วันเผาไม่ได้** — `generateInsight`/`generateReflection`
  เช็ค auth ท้ายสุด (ใน `replaceOutput`) หลังเรียกโมเดลไปแล้ว แต่ RLS ทำให้
  `getCheckins()` คืน `[]` → early-return ก่อนถึง Gemini เสมอ
  **กันได้แต่กันโดยบังเอิญ** ไม่ใช่โดยตั้งใจ — ควรสลับลำดับหลัง pitch
- Server Component เป็นค่าเริ่มต้นจริง client component 23 ตัวอยู่ปลายกิ่งหมด
- `error.tsx` / `not-found.tsx` ครบทั้ง root และ `(app)` · `route.ts` มีที่เดียว
- `next/font` ถูกต้อง · `viewport` แยกจาก `metadata` ตามที่ Next 14+ บังคับ

## Definition of done

- [x] ทั้ง 12 route มี title ของตัวเอง ตรงกับ h1 ของหน้านั้น
- [x] `/onboarding` มี loading UI · `(app)/` ยังใช้ loading รายหน้าเหมือนเดิม (ไม่ถูก segment แม่ทับ)
- [x] OG image เป็น PNG ที่ตัวอักษรไทย render ถูก
- [x] ด่าน CI ครบ 5 + `npm run e2e`

## Comments

### 21 ก.ค. 2026 — A

ทำครบ 3 ข้อ · ข้อ `force-dynamic` ไม่แตะตามที่ตัดสินใจไว้ข้างบน

**title** — root ใช้ `template: "%s · HealthCoach"` แล้วแต่ละหน้า export
`metadata` ของตัวเอง ยกเว้นหน้าแรกที่ปล่อยเป็น `default` ไว้
`/checkin/edit/[date]` ใช้ `generateMetadata` เพราะต้องใส่วันที่ลงชื่อหน้า
มี guard `isCheckinDate()` กันกรณี URL มั่ว (`generateMetadata` ทำงานก่อน `notFound()` ของ page)

ยืนยันจาก HTML ที่ server ส่งจริง (prod build + บัญชีปาล์ม):

| route | title |
| --- | --- |
| `/dashboard` | ภาพรวมสุขภาพ · HealthCoach |
| `/coach` | คุยกับโค้ชสุขภาพ · HealthCoach |
| `/goals` | เป้าหมายสัปดาห์นี้ · HealthCoach |
| `/reflection` | สรุปสัปดาห์ · HealthCoach |
| `/checkin/history` | บันทึกย้อนหลัง · HealthCoach |
| `/checkin/edit/2026-07-19` | บันทึกย้อนหลัง วันอาทิตย์ที่ 19 กรกฎาคม · HealthCoach |
| `/settings/privacy` | ความเป็นส่วนตัว · HealthCoach |
| `/login` · `/register` | เข้าสู่ระบบ / สมัครสมาชิก · HealthCoach |

**loading** — วางที่ `src/app/onboarding/loading.tsx` เท่านั้น ไม่แตะ `src/app/loading.tsx`
ตามข้อควรระวังข้างบน · e2e 61 ผ่าน แปลว่า loading รายหน้าใน `(app)/` ยังไม่ถูกทับ

**OG image** — render ด้วย Playwright ที่ 1200×630 โดยโหลด IBM Plex Sans Thai
จาก Google Fonts แล้วรอ `document.fonts.ready` ก่อน screenshot → ได้ PNG 56 KB
ที่ตัวอักษรไทยคมจริง ไม่มีความเสี่ยง tofu ตอน runtime
ตัด `<br>` เองเพราะภาษาไทยไม่มีเว้นวรรค เบราว์เซอร์ตัดบรรทัดกลางคำ
(รอบแรกได้ "นักศึกษาและคนเริ่ม / ทำงาน")

`og:image` ออกมาเป็น absolute URL ถูกต้องเพราะตั้ง `metadataBase` ไว้
พร้อม `og:image:alt` จาก `opengraph-image.alt.txt`

ด่าน: format ✓ · lint ✓ (warning เดิม 1 อัน) · tsc ✓ · unit 135 ✓ · build ✓ · **e2e 61 ผ่าน 0 พัง**
