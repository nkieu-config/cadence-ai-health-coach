# 12 · UI Inventory — Cadence มีหน้าตาและพฤติกรรมอย่างไร

> เอกสารนี้ **บันทึกว่าแอปเป็นอย่างไรจริง ๆ** (descriptive) ต่างจาก [DESIGN.md](../DESIGN.md) ที่เป็น **กฎสำหรับคนเขียนโค้ดใหม่** (prescriptive)
> ถ้าสองไฟล์ขัดกัน แปลว่ามีอันหนึ่งเก่า — ดูหัวข้อ [จุดที่เอกสารไม่ตรงกับโค้ด](#จุดที่เอกสารไม่ตรงกับโค้ด) ท้ายไฟล์
>
> อัปเดตเมื่อ 24 ก.ค. 2026 (หลัง UX/UI audit เต็มระบบ) · ครอบคลุม 17 route + โครงร่วม · ทุกหัวข้อลิงก์ไปโค้ดจริง กดดูได้
> route ที่เพิ่มหลังฉบับ 23 ก.ค.: `/settings` (redirect ไป `/settings/privacy`) · `/forgot-password` · `/reset-password`
>
> ⚠️ **screenshot ใน [docs/pitch/screenshots/](pitch/screenshots/) ยังเป็นของก่อน audit** — สีกราฟ · marker ปัจจัยรบกวน · กล่องสถานะ และหน้าเช็คอินเปลี่ยนไปแล้ว **ต้องรัน `npm run shots` ใหม่ก่อนทำสไลด์**

## สารบัญ

- [โครงร่วมทุกหน้า (app shell)](#โครงร่วมทุกหน้า-app-shell)
- [ระบบดีไซน์ที่ใช้ร่วมกัน](#ระบบดีไซน์ที่ใช้ร่วมกัน)
- หน้าในแอป — เช็คอิน · ภาพรวม · โค้ช · เป้าหมาย · สรุปสัปดาห์ · ตั้งค่า
- หน้านอกแอป — landing · เข้าสู่ระบบ · สมัคร · ลืมรหัสผ่าน · ตั้งรหัสผ่านใหม่ · onboarding · error/not-found
- [จุดที่เอกสารไม่ตรงกับโค้ด](#จุดที่เอกสารไม่ตรงกับโค้ด)

## หน้ากู้รหัสผ่าน (เพิ่ม 24 ก.ค. — ⚠️ **ยังไม่เปิดใช้**)

> **ไม่มีทางเข้าจาก UI** — ลิงก์ "ลืมรหัสผ่าน?" ในหน้า login **ถูกถอดออกเมื่อ 25 ก.ค.** เพราะยังพิสูจน์ไม่ได้ว่า Supabase ส่งอีเมลออกจริง (ไม่มีการตั้งค่า SMTP ในเรโป และ built-in email ของ free tier จำกัดจำนวนต่อชั่วโมง)
> โค้ดจงใจไม่เช็ค error จาก `resetPasswordForEmail()` เพื่อไม่เปิดเผยว่าอีเมลไหนมีบัญชี — **ผลข้างเคียงคือถ้าส่งไม่ออกหน้าจอก็ยังบอกว่า "ส่งลิงก์ไปให้แล้ว"** ซึ่งแย่กว่าไม่มีฟีเจอร์ จึงเลือกซ่อนไว้ก่อน
> **เปิดใช้เมื่อ:** ทดสอบส่งอีเมลถึงกล่องจริงผ่านครบวงจร (ดูขั้นตอนใน [docs/11](11-limitations-future.md)) แล้วค่อยเอาลิงก์กลับเข้าหน้า login

| | `/forgot-password` | `/reset-password` |
| --- | --- | --- |
| ไฟล์ | [page](../src/app/(auth)/forgot-password/page.tsx) · [form](../src/components/auth/forgot-password-form.tsx) | [page](../src/app/(auth)/reset-password/page.tsx) · [form](../src/components/auth/reset-password-form.tsx) |
| ทำอะไร | กรอกอีเมล → `resetPasswordForEmail()` ส่งลิงก์ | ตั้งรหัสใหม่ ≥6 ตัว → `updateUser()` → เข้าแอป |
| ข้อความตอบ | **เหมือนกันเสมอไม่ว่าอีเมลนั้นมีบัญชีจริงหรือไม่** | ถ้าไม่มี session: "ลิงก์ตั้งรหัสผ่านหมดอายุแล้ว — ขอลิงก์ใหม่อีกครั้งได้เลย" |
| เส้นทาง | **พิมพ์ URL เท่านั้น** (ยังไม่มีลิงก์จากที่ไหน) | มาจากลิงก์ในอีเมล → `/auth/callback?next=/reset-password` |

> ทั้งสองหน้าอยู่ใน `PUBLIC_PATHS` ของ [proxy.ts](../src/proxy.ts) — ผู้ใช้ที่ลืมรหัสผ่านย่อมยังไม่ได้ล็อกอิน · มีเทสต์ e2e คุมทั้งว่าหน้ายังเปิดได้ **และว่าลิงก์ยังไม่โผล่ในหน้า login**

---

# โครงร่วมทุกหน้า (app shell)

## ชั้นนอกสุด — [src/app/layout.tsx](../src/app/layout.tsx)

ครอบ **ทุกหน้าไม่มีข้อยกเว้น** รวมหน้า login และ error

| | |
| --- | --- |
| `<html lang="th">` | `suppressHydrationWarning` เพราะ inline script แก้ `data-theme` ก่อน React hydrate |
| ฟอนต์ | IBM Plex Sans Thai (400/500/600) เป็น `--font-sans` · IBM Plex Mono เป็น `--font-mono` |
| ธีม | [ThemeScript](../src/components/theme-script.tsx) รันใน `<head>` **ก่อน paint** ตั้ง `data-theme` + สร้าง `<meta name="theme-color">` |
| viewport | `viewportFit: "cover"` — รองรับ safe area บนจอมีติ่ง |
| metadata | title template `%s · Cadence` · description ภาษาไทย · OG title |

## ชั้นแอป — [src/app/(app)/layout.tsx](../src/app/(app)/layout.tsx)

ครอบหน้าที่ต้องล็อกอิน (เช็คอิน ภาพรวม เป้าหมาย โค้ช สรุปสัปดาห์ ตั้งค่า)

**ด่านก่อนเข้า** — [layout.tsx:12-14](../src/app/(app)/layout.tsx#L12-L14)

1. ไม่ได้ล็อกอิน → redirect `/login`
2. ล็อกอินแล้วแต่ยังไม่ผ่าน onboarding → redirect `/onboarding`

**โครงจากบนลงล่าง**

| ลำดับ | อะไร | เห็นตอนไหน |
| --- | --- | --- |
| 1 | ลิงก์ "ข้ามไปเนื้อหาหลัก" | ซ่อนด้วย `-translate-y-24` โผล่เมื่อ focus ด้วยคีย์บอร์ด · `z-50` |
| 2 | [AppSidebar](../src/components/app-sidebar.tsx) | `≥ lg` เท่านั้น — กว้าง 256px พื้น `bg-muted/30` |
| 3 | header sticky | `< lg` เท่านั้น — โลโก้ซ้าย · ปุ่มธีม + ออกจากระบบขวา · `z-10` |
| 4 | `<main id="main">` | ทุกจอ — `tabIndex={-1}` ให้ skip link โฟกัสได้ |
| 5 | [SafetyNotice](../src/components/safety-notice.tsx) | ทุกจอ ใต้เนื้อหา |
| 6 | [AppNav](../src/components/app-nav.tsx) | `< lg` เท่านั้น — เมนูล่าง sticky |

> **หน้าใหม่ไม่ต้องเขียนโครงเอง** และ **ห้ามใส่ `<main>` ในหน้า** จะกลายเป็น `<main>` ซ้อนกัน

## เมนู — 5 ปุ่ม ใช้รายการเดียวกันทั้งมือถือและเดสก์ท็อป

[nav-items.ts](../src/components/nav-items.ts) เป็นแหล่งความจริงเดียว

| ลำดับ | ป้าย | ปลายทาง | ไอคอน |
| --- | --- | --- | --- |
| 1 | เช็คอิน | `/checkin` | `CalendarCheck` |
| 2 | ภาพรวม | `/dashboard` | `BarChart3` |
| 3 | เป้าหมาย | `/goals` | `Target` |
| 4 | โค้ช | `/coach` | `MessageCircle` |
| 5 | ตั้งค่า | `/settings/privacy` | `Settings` |

`isActivePath` นับ active แบบ prefix — `/checkin/history` ทำให้ปุ่ม "เช็คอิน" ยัง active อยู่

**มือถือ** ([app-nav.tsx](../src/components/app-nav.tsx)) — แถบล่าง sticky แบ่ง 5 ช่องเท่ากันใน `max-w-md` · แต่ละปุ่มสูง `min-h-14` (56px) เกินเกณฑ์ 44px · ปุ่ม active มีขีดเส้นบน 2px สี primary (`aria-hidden` เป็นการตกแต่ง) และตัวอักษรเป็นสี primary · รองรับ `env(safe-area-inset-bottom)`

**เดสก์ท็อป** ([app-sidebar.tsx](../src/components/app-sidebar.tsx)) — คอลัมน์ซ้าย sticky เต็มจอ · เมนู active เป็นเม็ดยาสีทึบ `bg-primary text-primary-foreground` · ก้น sidebar คือปุ่มสลับธีมและออกจากระบบ

**ทั้งสองแบบบอกสถานะให้ screen reader ด้วย `aria-current="page"`** ไม่ได้พึ่งสีอย่างเดียว

## ตัวบอกว่ากำลังโหลดหน้าใหม่ — [nav-pending.tsx](../src/components/nav-pending.tsx)

`NavIcon` ใช้ `useLinkStatus()` ของ Next: ระหว่างที่หน้าใหม่ยังโหลดไม่เสร็จ **ไอคอนเมนูจะกลายเป็นวงกลมหมุน** แล้วกลับเป็นไอคอนเดิมเมื่อเสร็จ — เคารพ `prefers-reduced-motion` ผ่าน `motion-reduce:animate-none`

นี่คือเหตุผลที่ **ทุกหน้าต้องมี `loading.tsx`** — หน้าเราเป็น dynamic ทั้งหมด ถ้าไม่มี Next จะไม่ prefetch แล้วหน้าจอจะค้างแช่ตอนกด

## ความกว้างเนื้อหา — [PageContainer](../src/components/page-container.tsx)

มี 2 แบบเท่านั้น ไม่มีแบบที่สาม

| แบบ | คลาสจริง | ความกว้าง | ใช้กับ |
| --- | --- | --- | --- |
| `<PageContainer>` (ค่าเริ่มต้น) | `max-w-md` | 448px ทุกจอ | ฟอร์ม — เช็คอิน onboarding |
| `<PageContainer width="content">` | `max-w-5xl` | ถึง 1024px | หน้าดูข้อมูล — ภาพรวม ประวัติ ตั้งค่า |

**ข้อยกเว้นเดียวคือหน้าโค้ช** ที่ไม่ใช้ PageContainer เลย

## โครงกระดูกตอนโหลด — [page-skeleton.tsx](../src/components/page-skeleton.tsx)

`loading.tsx` ของแต่ละหน้าประกอบจากชิ้นส่วนสำเร็จรูปพวกนี้ ไม่ได้เขียนใหม่ทุกหน้า

| ชิ้นส่วน | ใช้ทำอะไร |
| --- | --- |
| `LoadingLabel` | `<span role="status" aria-live="polite" class="sr-only">กำลังโหลด</span>` — **ตัวเดียวที่ screen reader ได้ยิน** skeleton ที่เหลือเป็นภาพล้วน |
| `FormSkeleton` | หน้าฟอร์ม 448px + การ์ด 3 แถว |
| `ContentSkeleton` | หน้าข้อมูล 1024px + กริด `lg:grid-cols-3` + พื้นที่กราฟสูง 224px |
| `TextPageSkeleton` | หน้าเนื้อความล้วน — ปรับจำนวนการ์ดได้ |
| `CardSkeleton` | การ์ดเดียว ชิปสูง 44px เท่าของจริง |

## ข้อความกำกับความปลอดภัย — [safety-notice.tsx](../src/components/safety-notice.tsx)

> Cadence เป็นผู้ช่วยดูแลสุขภาพทั่วไป ไม่ใช่บริการทางการแพทย์ — หากมีอาการผิดปกติควรปรึกษาผู้เชี่ยวชาญ

โผล่ใน **3 layout** = แทบทุกหน้าของแอป: [(app)/layout.tsx:49](../src/app/(app)/layout.tsx#L49) · [page.tsx:59](../src/app/page.tsx#L59) (landing) · [(auth)/layout.tsx:8](../src/app/(auth)/layout.tsx#L8)

สไตล์ `text-center text-xs text-muted-foreground` — จงใจให้เบา ไม่แย่งความสนใจ

> ⚠️ [docs/08-safety-privacy.md:15](08-safety-privacy.md#L15) เขียนไว้ว่าข้อความถาวรอยู่ "ใต้หน้า coach/dashboard" แต่โค้ดจริงแสดงกว้างกว่านั้นมาก — ดูท้ายไฟล์

## ออกจากระบบ — [sign-out-button.tsx](../src/components/sign-out-button.tsx)

**ยืนยัน 2 จังหวะแบบไม่มี dialog** — กดครั้งแรกปุ่มจะแปลงร่างเป็น "ออกเลย" + "ยกเลิก" อยู่ในที่เดิม ไม่มี modal ไม่มี overlay

มี 2 ทรง: `SignOutIconButton` (ไอคอนล้วน 44×44 บน header มือถือ) และ `SignOutMenuItem` (ไอคอน + ข้อความ ในก้น sidebar)

## สลับธีม — [theme-toggle.tsx](../src/components/theme-toggle.tsx)

วางคู่ปุ่มออกจากระบบทั้ง 2 จุด ทรงเดียวกัน

- **สถานะแสดงด้วย CSS ไม่ใช่ React state** — `dark:hidden` / `dark:block` สลับไอคอน `Moon`/`Sun` และป้ายข้อความ ทำให้ไม่มี hydration mismatch และถูกต้องตั้งแต่ paint แรก
- ชื่อที่ screen reader อ่านสลับตามธีมด้วย (มือถือ "เปลี่ยนเป็นโหมดมืด/สว่าง" · เดสก์ท็อป "โหมดมืด/โหมดสว่าง")
- กดแล้วจำไว้ใน `localStorage` คีย์ `cadence-theme` · ยังไม่เคยกด = ตามค่าเครื่อง

---

# ระบบดีไซน์ที่ใช้ร่วมกัน

## ธีม "มิ้นต์สด" — [globals.css](../src/app/globals.css)

พื้นขาว + เขียวมรกต + มิ้นต์อ่อน · **ทุกสีต้องมาจาก token ห้าม hardcode**

| token | สว่าง | มืด |
| --- | --- | --- |
| `--background` | `#ffffff` | `#0d1526` |
| `--foreground` | `#10231c` | `#e6edf9` |
| `--card` | `#ffffff` | `#16203a` |
| `--primary` | `#06805a` | `#2ed89b` |
| `--muted-foreground` | `#566b62` | `#96a3be` |
| `--destructive` | `#c0392b` | `#f0705c` |
| `--input` (ขอบช่องกรอก) | `#679688` | `rgba(255,255,255,.36)` |
| `--radius` | `1rem` | เท่ากัน |

**กราฟใช้ `--chart-1` ถึง `--chart-6`** — นอน = 1 (ฟ้า) · กิน = 2 (อำพัน) · ขยับ = 3 (เขียวมรกต) · พลังงาน = 4 (ม่วง) · ปัจจัยรบกวน = 5 (ปะการัง) · เครื่องดื่มหวาน = 6 (เขียวน้ำทะเล) · ผูกโหมดมืดให้แล้ว

> **โทน light ถูกทำให้เข้มขึ้นเมื่อ 24 ก.ค.** เพื่อให้แท่ง/จุดบนพื้นขาวได้ contrast ≥ 3:1 ตาม WCAG 1.4.11 (เดิมตก 4 ใน 6 ตัว) · เหตุผลเดียวกับที่ `--primary` เลือกเขียวเข้มไม่ใช่เขียวสด · **โทน dark ผ่านอยู่แล้วจึงไม่แตะ** · `--input` แยกจาก `--border` โดยตั้งใจ — ขอบการ์ดเป็นของตกแต่งให้จางได้ แต่ขอบของตัวควบคุมต้องมองเห็น

โหมดมืดสั่งด้วย `data-theme="dark"` บน `<html>` **ไม่ใช่ `prefers-color-scheme`** — ถ้าเขียน CSS แยกโหมดเองต้องใช้ `[data-theme="dark"]`

## ตัวอักษรไทย

| อะไร | ใช้ |
| --- | --- |
| หัวข้อหน้า | `text-xl font-semibold lg:text-2xl` |
| เนื้อความทั่วไป | `text-sm` |
| ย่อหน้ายาว (reflection) | `text-base` — ตัวไทยดูเล็กกว่า Latin ที่ px เท่ากัน |
| caption / meta | `text-xs` |

**พื้นขั้นต่ำ 12px สำหรับข้อความไทยที่มองเห็นถาวร** (สระ/วรรณยุกต์ซ้อน 4 ชั้นจะติดกัน) · ตัวเลขล้วนในที่แคบต่ำสุด 11px · `text-[10px]` ห้ามใช้ มีด่าน e2e คุม

`line-height` ตั้งไว้ใน `@theme` แล้ว (1.45–1.75) **ไม่ต้องใส่ `leading-*` เอง**

## ระยะห่างและ z-index

`space-y-6` ระหว่าง section · `space-y-4` ในการ์ด · `space-y-2` ใน field · `gap-2` กลุ่มชิป

**z-index ทั้งแอปมี 2 ชั้นเท่านั้น** — `z-10` แถบ sticky (header มือถือ **และเมนูล่าง**) · `z-50` ของที่ต้องลอยเหนือทุกอย่าง (popover ปัจจัยรบกวน, skip link)

## กฎที่บังคับทุกหน้า

1. ปุ่ม/ลิงก์/ช่องกรอกสูง **≥ 44px** — รวมถึง `<Link>` ที่แต่งให้ดูเหมือนปุ่ม
2. ทุกหน้ามี `<h1>` **1 อัน** — ถ้าหัวข้ออยู่ในการ์ดแล้วให้ h1 เป็น `sr-only`
3. ห้าม hardcode สี
4. ไม่ใช้ emoji เป็นไอคอน (ใช้ Lucide) — emoji ในข้อความปกติได้
5. ปุ่มกลุ่มแบบ pill ต้องจบแถวเดียวที่ 320px
6. `min-h-dvh` ห้าม `min-h-screen`
7. interactive ที่สร้างเองต้องมี focus ring
8. **ห้ามใช้สีเตือนภัยกับพฤติกรรมผู้ใช้** — `--destructive` สงวนไว้ให้ **error ของระบบ** (บันทึกไม่สำเร็จ เชื่อมต่อไม่ได้) ไม่ใช่ "คุณนอนน้อย" · นอน 4 ชม. กับ 8 ชม. ใช้สีเดียวกัน ความหมายอยู่ที่ความยาวแท่ง · พลังงานทั้ง 3 ระดับใช้ badge `secondary` สีเดียวกัน · ไม่มีคะแนน ไม่มีเปอร์เซ็นต์รวม ไม่มีเกรด — โจทย์ข้อ 8 สั่งห้ามกดดัน
   **สถานะที่ไม่ใช่ความผิดผู้ใช้ใช้ [`<GentleNotice>`](../src/components/ui/notice.tsx)** (muted + `role="status"`) — ข้อมูลยังไม่พอ · โควตาหมด · ครบ 2 เป้าหมาย · ข้ามเที่ยงคืน · ส่วน `<ErrorNotice>` (แดง + `role="alert"`) ใช้กับ error ระบบเท่านั้น

## Breakpoint

ใช้จริงตัวเดียวคือ `lg` (1024px) · มี `xs` (375px) ตั้งไว้ใน `@theme` ใช้กับ padding ของ header/main

| | < 1024px | ≥ 1024px |
| --- | --- | --- |
| เมนู | แถบล่าง 5 ปุ่ม | sidebar ซ้าย |
| header | sticky บนสุด | ไม่มี (โลโก้อยู่ใน sidebar) |
| layout ในหน้า | คอลัมน์เดียว | ใช้ `lg:grid-cols-*` ได้ |

---
# หน้าในแอป — สายเช็คอิน

## `/checkin` — เช็คอินประจำวัน

| | |
| --- | --- |
| ไฟล์ | [page.tsx](../src/app/(app)/checkin/page.tsx) · [loading.tsx](../src/app/(app)/checkin/loading.tsx) · [today-checkin-form.tsx](../src/components/checkin/today-checkin-form.tsx) · [checkin-form.tsx](../src/components/checkin/checkin-form.tsx) · [checkin-summary.tsx](../src/components/checkin/checkin-summary.tsx) |
| PageContainer | `width="content"` 1024px — [page.tsx:50](../src/app/(app)/checkin/page.tsx#L50) · ฟอร์มจริงยังแคบ 448px เพราะคอลัมน์ขวาของ grid ถูกล็อกที่ `minmax(0,28rem)` [checkin-form.tsx:306](../src/components/checkin/checkin-form.tsx#L306) |
| h1 | "เช็คอินประจำวัน" — **มองเห็น** พร้อมไอคอน `CalendarCheck` [page.tsx:52](../src/app/(app)/checkin/page.tsx#L52) |
| loading.tsx | มี → `FormSkeleton` — `width="content"` + หัวข้อ + step rail (เฉพาะ `lg`) + คอลัมน์ฟอร์ม `max-w-md` **ตรงกับหน้าจริงแล้ว** [page-skeleton.tsx](../src/components/page-skeleton.tsx) |
| เปิดหน้าเมื่อบันทึกวันนี้ไปแล้ว | **เห็นการ์ดสรุปก่อน ไม่ใช่ wizard** — `CheckinForm` รับ `openWith={existing}` จาก `TodayCheckinForm` · กด "แก้ไขบันทึกนี้" เพื่อเข้าฟอร์ม · **ทางลัดเข้าฟอร์มตรง ๆ คือ `/checkin/edit/<วันที่วันนี้>`** (ใช้ตอนเดโมจับเวลา) |
| Suspense | **ไม่มี** — หน้า `await getCheckins(30)` ตรง ๆ แล้วส่งลงฟอร์มทีเดียว [page.tsx:17](../src/app/(app)/checkin/page.tsx#L17) |

**โครงหน้า (บนลงล่าง · มือถือ → เดสก์ท็อป)**

1. **หัวหน้า** — h1 + "บันทึกการกิน การนอน และการเคลื่อนไหวของวันนี้ ใช้เวลาไม่ถึง 3 นาที" [page.tsx:51-59](../src/app/(app)/checkin/page.tsx#L51)
2. **nudge (มีเงื่อนไข)** — กล่องเส้นประกดได้ ลิงก์ไป `/checkin/edit/<เมื่อวาน>` [page.tsx:22-36](../src/app/(app)/checkin/page.tsx#L22) ส่งเข้า slot `nudge` ให้ render เหนือการ์ดฟอร์ม
3. **การ์ดฟอร์ม** — `CardTitle` = "เช็คอิน · <ชื่อขั้น>" · `CardDescription` = "<วันที่ไทย> · ขั้นที่ N จาก 4" (+ " · กำลังแก้ไขบันทึกเดิม") [checkin-form.tsx:311-318](../src/components/checkin/checkin-form.tsx#L311)
4. **แถบความคืบหน้า 4 ขีด** — `h-1` ขีดที่ `index <= step` เป็น `bg-primary` · **`lg:hidden` เดสก์ท็อปไม่แสดง** [checkin-form.tsx:319-326](../src/components/checkin/checkin-form.tsx#L319)
5. **เนื้อฟอร์มของขั้นปัจจุบัน** — ชิปทั้งหมด ยกเว้น textarea ในขั้นสุดท้าย
6. **ข้อความ error (ถ้ามี)** [checkin-form.tsx:617](../src/components/checkin/checkin-form.tsx#L617)
7. **แถวปุ่ม** — "ย้อนกลับ" (`outline`, โผล่เมื่อ `step > 0`) + ปุ่มหลัก `flex-1`
8. **footer (มีเงื่อนไข)** — ลิงก์ ghost "ดูบันทึกย้อนหลัง" แสดงเมื่อมีบันทึกใน 30 วันอย่างน้อย 1 รายการ

**`lg:` เปลี่ยนอะไร** — ทั้งบล็อกกลายเป็น `lg:grid lg:grid-cols-[13rem_minmax(0,28rem)] lg:gap-8` · คอลัมน์ซ้าย 208px คือ **step rail** (`hidden lg:block`) — "ขั้นตอน" + 4 ขั้นพร้อมวงกลมสถานะ (เสร็จ = วงเขียวทึบมีเครื่องหมายถูก · ปัจจุบัน = ขอบเขียวหนา + `bg-muted` · ยังไม่ถึง = ขอบจาง) + กล่องข้อความปลอบท้าย rail [checkin-form.tsx:87-127](../src/components/checkin/checkin-form.tsx#L87) · แถบ 4 ขีดหายไป (rail แทน)

**4 ขั้นและคำถามทั้งหมด** — `STEPS = ["กิน", "นอน", "เคลื่อนไหว", "บริบทวัน"]` [checkin-form.tsx:44](../src/components/checkin/checkin-form.tsx#L44)

| ขั้น | คำถาม | ตัวเลือก | บังคับ? | โผล่เมื่อไหร่ |
| --- | --- | --- | --- | --- |
| 1 กิน | วันนี้กินกี่มื้อ | 0/1/2/3 มื้อ | ✅ | เสมอ |
| | (ข้อความปลอบ ไม่ใช่คำถาม) | — | — | `mealsCount === 0` |
| | มื้อไหนที่ข้ามไป | เช้า / กลางวัน / เย็น (หลายอัน) | ✖ | `mealsCount < 3` |
| | มื้อแรกของวันกินตอนไหน | ก่อน 9:00 / 9:00–12:00 / หลัง 12:00 | ✖ | `mealsCount > 0` |
| | วันนี้ได้กินอะไรอีกไหม | ของว่าง / ผัก · ผลไม้ (หลายอัน) | ✖ | เสมอ |
| | เครื่องดื่มหวานวันนี้ | ไม่ดื่ม / 1–3 แก้ว / 4+ แก้ว | ✅ | เสมอ |
| | หลังกินรู้สึกยังไง | กำลังดี / ง่วงหลังกิน / หิวเร็ว / มีแรง | ✖ | `mealsCount > 0` |
| 2 นอน | เมื่อคืนนอนกี่ชั่วโมง | ≤3 ชม. … 9 ชม. / 10+ ชม. | ✅ | เสมอ |
| | เข้านอนตอนไหน | ก่อน 23:00 / 23:00–00:00 / 00:00–01:00 / 01:00–02:00 / หลัง 02:00 | ✅ | เสมอ |
| | ที่นอนดึกเพราะอะไร | งาน / อ่านสอบ / เล่นมือถือ / เดินทาง / อื่น ๆ | ✖ | เข้านอนหลังเที่ยงคืน |
| | ตื่นมารู้สึกว่านอนหลับดีแค่ไหน | 1 · แย่มาก → 5 · ดีมาก | ✅ | เสมอ |
| 3 เคลื่อนไหว | วันนี้ขยับร่างกายแบบไหนบ้าง | เดิน / ยืดเส้น / ขึ้นบันได / ปั่นจักรยาน / เล่นกีฬา / ไม่ได้ขยับเลย | ✅ | เสมอ |
| | รวมแล้วประมาณกี่นาที | แทบไม่ได้ขยับ / 10–45 นาที / 60+ นาที | ✅ (เมื่อโผล่) | เลือกชนิดแล้ว และไม่ได้เลือก "ไม่ได้ขยับเลย" |
| | อะไรทำให้ไม่ได้ขยับ | ไม่มีเวลา / ฝนตก / เหนื่อยเกิน / นั่งยาว | ✖ | เลือก "ไม่ได้ขยับเลย" **หรือ** ตอบ "แทบไม่ได้ขยับ" |
| | หลังขยับรู้สึกยังไง | สดชื่นขึ้น / ผ่อนคลาย / เหนื่อย / เหมือนเดิม | ✖ | ขยับจริง |
| 4 บริบทวัน | วันนี้รู้สึกมีพลังงานแค่ไหน | ต่ำ / กลาง / สูง | ✅ | เสมอ |
| | วันนี้มีอะไรพิเศษไหม | เดดไลน์ / ประชุมยาว / เรียนเช้า / เรียน·ทำงาน online / เดินทางไกล / สอบ / ไม่มีอะไรพิเศษ | ✖ | เสมอ |
| | บันทึกเพิ่มเติม (ข้ามได้) | textarea 3 บรรทัด สูงสุด 200 ตัวอักษร | ✖ | เสมอ |

ชิปกลุ่ม exclusive: "ไม่ได้ขยับเลย" กดแล้วล้างชนิดอื่นทิ้ง · "ไม่มีอะไรพิเศษ" ทำงานแบบเดียวกัน · **ค่าที่กรอกไว้ในคำถามเสริมที่หายไปจะถูกตัดทิ้งตอนบันทึกด้วย `asks.*` ไม่ใช่แค่ซ่อน** [checkin-form.tsx:266-285](../src/components/checkin/checkin-form.tsx#L266)

**State ที่รองรับ**

| State | เงื่อนไข | ผู้ใช้เห็นอะไร | โค้ด |
| --- | --- | --- | --- |
| ปกติ ยังไม่เคยบันทึกวันนี้ | `existing === null` | ฟอร์มว่าง เริ่มขั้นที่ 1 | [page.tsx:18](../src/app/(app)/checkin/page.tsx#L18) |
| แก้บันทึกเดิมของวันนี้ | มีแถวของวันนี้ | ทุกช่องเติมค่าเดิม + " · กำลังแก้ไขบันทึกเดิม" | [checkin-form.tsx:150-181](../src/components/checkin/checkin-form.tsx#L150) |
| กำลังโหลดหน้า | navigate เข้ามา | `FormSkeleton` + sr-only "กำลังโหลด" | [loading.tsx](../src/app/(app)/checkin/loading.tsx) |
| ยังไม่ครบ กดถัดไป | `firstMissingField()` ไม่ null | เลื่อนจอไป field นั้นแบบ smooth + hint "เลือกสักอันก่อนไปต่อนะ" สีเขียว | [checkin-form.tsx:199-229](../src/components/checkin/checkin-form.tsx#L199) |
| กำลังบันทึก | `pending` | ปุ่มหลักเป็น "กำลังบันทึก…" · ปุ่ม disabled | [checkin-form.tsx:632-638](../src/components/checkin/checkin-form.tsx#L632) |
| บันทึกสำเร็จ | `saved !== null` | ฟอร์มทั้งบล็อก **รวม step rail** ถูกแทนที่ด้วยการ์ดสรุป | [checkin-form.tsx:297-303](../src/components/checkin/checkin-form.tsx#L297) |
| error จาก server | action คืน `{error}` | บรรทัดแดงเหนือปุ่ม "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง" / "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" | [actions.ts:29](../src/lib/checkins/actions.ts#L29) |
| ข้ามเที่ยงคืนขณะเปิดหน้าค้าง | `today() !== date` ตอนกดบันทึก | ไม่บันทึก · "ข้ามไปวันใหม่แล้ว — กำลังเปลี่ยนเป็นบันทึกของวันนี้ กดบันทึกอีกครั้ง" แล้ว `router.refresh()` | [today-checkin-form.tsx:22-26](../src/components/checkin/today-checkin-form.tsx#L22) |
| ลืมบันทึกเมื่อวาน | มีบันทึกอื่นใน 30 วัน **และ** ไม่มีของเมื่อวาน | กล่องเส้นประเหนือฟอร์ม | [page.tsx:22-23](../src/app/(app)/checkin/page.tsx#L22) |
| ผู้ใช้ใหม่ ยังไม่มีบันทึกเลย | `recent.length === 0` | ไม่มี nudge ไม่มี footer — เหลือหัวหน้า + ฟอร์ม | [page.tsx:38-39](../src/app/(app)/checkin/page.tsx#L38) |

**Copy ที่ผู้ใช้เห็น**

- หัวหน้า: "เช็คอินประจำวัน" · "บันทึกการกิน การนอน และการเคลื่อนไหวของวันนี้ ใช้เวลาไม่ถึง 3 นาที"
- nudge: "ยังไม่ได้บันทึกของ<วันที่ไทย>" / "ลืมกรอกก่อนนอนก็ย้อนกลับไปบันทึกได้"
- step rail: "ขั้นตอน" · "กรอกไม่จบก็ไม่เป็นไร ที่บันทึกไว้แล้วยังอยู่ กลับมาต่อทีหลังได้"
- กิน 0 มื้อ: "วันที่ยุ่งจนไม่ได้กินก็มีนะ บันทึกไว้ก่อน แล้วค่อย ๆ ดูแลตัวเองกันต่อพรุ่งนี้"
- helper: "เลือกได้หลายมื้อ" · "ข้ามได้" · "เลือกได้หลายอย่าง · ข้ามได้" · "ชานม น้ำอัดลม กาแฟใส่น้ำตาล"
- ขั้น 4 นำ: "ขั้นสุดท้ายแล้ว — เหลือแค่ภาพรวมของวันนี้"
- textarea placeholder: "เช่น วันนี้ประชุมยาว เลยไม่ได้กินข้าวเที่ยง"
- เตือนยังไม่เลือก: "เลือกสักอันก่อนไปต่อนะ"
- ปุ่ม: "ย้อนกลับ" · "ถัดไป" · "บันทึกเช็คอินวันนี้" · "กำลังบันทึก…"
- การ์ดสรุปหลังบันทึก: "บันทึกแล้ว" + วันที่ + 3 บรรทัดสรุป + ข้อความให้กำลังใจคู่ไอคอน `Sparkles` + ปุ่ม "ดูภาพรวม" · "แก้ไขบันทึกนี้" · "ดูบันทึกย้อนหลัง"
- ข้อความให้กำลังใจ 3 แบบ [summary.ts:70-80](../src/lib/checkins/summary.ts#L70): มี disruptor → "วันนี้มี<...>ด้วย — บันทึกได้ในวันแบบนี้ก็ดีมากแล้ว ขอบคุณที่แวะมาดูแลตัวเอง" · พลังงานต่ำ → "วันที่พลังงานน้อยเป็นเรื่องปกติ ขอบคุณที่ยังแวะมาบันทึกไว้" · อื่น ๆ → "ขอบคุณที่บันทึกวันนี้ · บันทึกต่อเนื่องจะช่วยให้เห็นรูปแบบของตัวเองชัดขึ้น"

**a11y & interaction**

- `<h1>` มองเห็น 1 อัน `text-xl font-semibold lg:text-2xl` ตรงสเกล
- ชิปทุกอันเป็น `<button type="button">` มี `aria-pressed` · `min-h-11` · focus ring · `active:scale-95`
- step rail เป็น `aria-hidden` ไม่ interactive — screen reader อาศัย "ขั้นที่ N จาก 4" ใน `CardDescription` แทน
- แถบ 4 ขีดเป็น `<div>` เปล่า ไม่มี `role="progressbar"` (ข้อมูลเดียวกันอยู่ในข้อความแล้ว)
- ⚠️ `<Label>` ของแต่ละกลุ่มชิป **ไม่มี `htmlFor`** และไม่ได้ใช้ `fieldset`/`legend` — มีแต่ textarea ที่ผูก id จริง
- ⚠️ ข้อความ "เลือกสักอันก่อนไปต่อนะ" และบรรทัด error **ไม่มี `aria-live`** · `goForward()` เลื่อนจอโดยไม่ย้าย focus
- ⚠️ nudge เป็น `<Link>` จัดสไตล์เอง ไม่ได้ใช้ `buttonVariants()` หรือ `min-h-11`
- ตัวนับตัวอักษรโผล่เมื่อพิมพ์เกิน 160 ตัว (80% ของ 200)
- e2e คุมเส้นทางนี้: กรอกครบ 4 ขั้น → เห็น "บันทึกแล้ว" + ตรวจว่าคำถามเสริมโผล่ตอนนอนดึก/ตอนได้ขยับ [checkin.spec.ts](../e2e/checkin.spec.ts)

**ทำไมถึงเป็นแบบนี้**

- **หน้าเป็น `width="content"` แต่ฟอร์มยัง 448px** — [INFRA-17](../.scratch/infra/issues/17-checkin-desktop-rail.md) ระบุปัญหาตรง ๆ ว่าฟอร์มแคบกลางจอ "เหมือน mobile ตอนขึ้นจอโปรเจกเตอร์ demo" และตัดสินใจ **ไม่ขยายฟอร์ม** แต่เติม rail แทน · rail เป็น `aria-hidden` ไม่ interactive → ไม่ชนกฎ 44px
- **ทุกคำถามเป็นชิป ไม่มีพิมพ์ ยกเว้น note 200 ตัวอักษร** — [F1-01](../.scratch/f1-checkin/issues/01-checkin-form.md) พร้อม AC "กรอกจบจริง ≤ 3 นาที"
- **คำถามเสริมโผล่เฉพาะเมื่อเกี่ยว** — [F1-05](../.scratch/f1-checkin/issues/05-mission-input-coverage.md) ย้ำว่า "บังคับใน `validate.ts` ไม่ใช่แค่ซ่อนใน UI"
- **ไม่ถามเวลาตื่น** — [F1-05](../.scratch/f1-checkin/issues/05-mission-input-coverage.md): "เวลาตื่นนอน — **คำนวณ ไม่ถามซ้ำ**"
- **สรุปหลังบันทึกไม่เรียก AI** — [F1-04](../.scratch/f1-checkin/issues/04-post-checkin-summary.md): "template ฝั่งโค้ด ไม่เรียก AI — เร็วและฟรี" + AC "ห้ามมีโทนตัดสิน แม้วันที่ข้อมูลแย่"
- **มี guard เที่ยงคืนเฉพาะหน้านี้** — [INFRA-11](../.scratch/infra/issues/11-component-composition.md): "หน้า `/checkin` derive วันเอง ถ้าเปิดค้างข้ามเที่ยงคืนต้องกัน · หน้า edit วันมาจาก URL ไม่ต้องกัน"

---

## `/checkin/edit/[date]` — บันทึกย้อนหลัง

| | |
| --- | --- |
| ไฟล์ | [page.tsx](../src/app/(app)/checkin/edit/[date]/page.tsx) · [backfill-checkin-form.tsx](../src/components/checkin/backfill-checkin-form.tsx) |
| PageContainer | `width="content"` 1024px — ฟอร์มยัง 448px ด้วยกลไก grid เดียวกัน |
| h1 | "บันทึกย้อนหลัง" — **มองเห็น** พร้อมไอคอน `CalendarPlus` |
| loading.tsx | มี → `FormSkeleton` เหมือน `/checkin` เป๊ะ |
| Suspense | **ไม่มี** |

**ความต่างจาก `/checkin` — สรุปครบ**

| | `/checkin` | `/checkin/edit/[date]` |
| --- | --- | --- |
| ฟอร์มที่ใช้ | `CheckinForm` เดียวกัน | `CheckinForm` เดียวกัน |
| variant | `TodayCheckinForm` | `BackfillCheckinForm` (12 บรรทัด) |
| `heading` | "เช็คอิน" | "บันทึกย้อนหลัง" |
| ที่มาของวันที่ | `today()` ฝั่ง server | พารามิเตอร์ `[date]` ใน URL |
| `beforeSave` | `stillToday()` — กันข้ามเที่ยงคืน | ไม่มี |
| nudge / footer | มีทั้งคู่ (มีเงื่อนไข) | ไม่มีเลย |
| ปุ่มสุดท้าย | "บันทึกเช็คอินวันนี้" | **ข้อความเดียวกัน** (hardcode ในแกน) |
| ขั้น/คำถาม/validation | เหมือนกันทุกข้อ | เหมือนกันทุกข้อ |

**State ที่รองรับ**

| State | เงื่อนไข | ผู้ใช้เห็นอะไร | โค้ด |
| --- | --- | --- | --- |
| แก้บันทึกเดิม | เจอแถว | ฟอร์มเติมค่าเดิม + "· กำลังแก้ไขบันทึกเดิม" | [page.tsx:39](../src/app/(app)/checkin/edit/[date]/page.tsx#L39) |
| ย้อนไปกรอกวันที่ยังว่าง | ไม่เจอแถว | ฟอร์มว่าง + "· ยังไม่เคยบันทึกวันนี้" | [page.tsx:39](../src/app/(app)/checkin/edit/[date]/page.tsx#L39) |
| วันที่รูปแบบผิด | `isCheckinDate()` false | `notFound()` → "ไม่พบบันทึกที่ต้องการ" | [page.tsx:24](../src/app/(app)/checkin/edit/[date]/page.tsx#L24) |
| วันที่เกิน 30 วัน / ในอนาคต | นอกหน้าต่าง | `notFound()` | [validate.ts:56-59](../src/lib/checkins/validate.ts#L56) |
| ใส่วันที่ของวันนี้ใน URL | `days === 0` → ผ่าน | ได้ฟอร์ม backfill **โดยไม่มี guard เที่ยงคืน** | [validate.ts:58](../src/lib/checkins/validate.ts#L58) |
| เลยขอบ 30 วันตอนกดบันทึก | server ตรวจซ้ำ | "บันทึกย้อนหลังได้ไม่เกิน 30 วัน" | [validate.ts:69](../src/lib/checkins/validate.ts#L69) |

**a11y & interaction** — เหมือน `/checkin` ทุกข้อ เพราะ render จากแกนเดียวกัน ต่างเพียงข้อความ `heading`

**ทำไมถึงเป็นแบบนี้**

- **ใช้ URL `/checkin/edit/[date]` ไม่ใช่ `/checkin/[date]`** — [F1-03](../.scratch/f1-checkin/issues/03-edit-backfill.md): "ตั้งใจไม่ใช้ `/checkin/[date]` กันชนกับ `history`"
- **จำกัด 30 วัน** — ค่าคงที่เดียวคือ `MAX_BACKFILL_DAYS` ใช้ร่วมกันทั้ง route guard ข้อความ และ query
- **แยกเป็น variant แทน boolean prop** — DESIGN.md ยกไฟล์คู่นี้เป็นตัวอย่างอ้างอิงของทั้งโปรเจกต์ · แกน `CheckinForm` ไม่รู้จักคำว่า backfill เลย

---

## `/checkin/history` — บันทึกย้อนหลัง

| | |
| --- | --- |
| ไฟล์ | [page.tsx](../src/app/(app)/checkin/history/page.tsx) · [checkin-history.tsx](../src/components/checkin/checkin-history.tsx) |
| PageContainer | `width="content"` 1024px + `space-y-4` |
| h1 | "บันทึกย้อนหลัง" — **มองเห็น** พร้อมไอคอน `History` |
| loading.tsx | มี → `HistorySkeleton` — grid การ์ดแบ่งตามเดือน **ตรงกับหน้าจริงแล้ว** |
| Suspense | **ไม่มี** |

**โครงหน้า**

1. **แถวหัว** — h1 ซ้าย + ลิงก์ ghost "เช็คอิน" พร้อม `ChevronLeft` ชิดขวา
2. **คำอธิบาย** — "แก้ไขหรือลบบันทึกของตัวเองได้ทุกรายการ (ย้อนหลังได้ 30 วัน)"
3. **รายการจัดกลุ่มตามเดือน** — แต่ละกลุ่มเป็น `<section>` ที่มี `<h2>` ชื่อเดือน+ปีไทย · grid `lg:grid-cols-2`
4. **การ์ดต่อ 1 วัน** — วันที่ไทยเต็ม + `Badge` พลังงาน · 3 บรรทัดสรุปนำด้วยไอคอน pillar (`--chart-2` กิน · `--chart-1` นอน · `--chart-3` ขยับ) · badge outline ของ disruptor · แถวปุ่ม "แก้ไข" / "ลบ" ปักล่างด้วย `mt-auto`
5. **การ์ดเส้นประของวันที่ยังไม่ได้บันทึก** — แทรกตามลำดับเวลาจริงระหว่างการ์ดปกติ ลิงก์ไป `/checkin/edit/<วันที่>` · เป็นทางเข้าบันทึกย้อนหลัง **ทุกวันในช่วง 30 วัน** ไม่ใช่แค่เมื่อวาน
6. **ปุ่ม "ดูอีก N วัน"** — แสดงครั้งละ 14 วัน · เดิมเรนเดอร์ทั้ง 30 วันรวดเดียวจนหน้ายาวมาก

**`lg:` เปลี่ยนอะไร** — grid ของแต่ละเดือนคือ `grid gap-3 sm:grid-cols-2 xl:grid-cols-3` [checkin-history.tsx:162](../src/components/checkin/checkin-history.tsx#L162) · **จุดนี้ใช้ `sm:`/`xl:` ต่างจากกฎ DESIGN.md ที่ระบุว่า breakpoint ที่ใช้จริงมีตัวเดียวคือ `lg`** · การ์ดใช้ `h-full` + `mt-auto` ให้ปุ่มของทุกใบในแถวอยู่ระดับเดียวกัน

**State ที่รองรับ**

| State | เงื่อนไข | ผู้ใช้เห็นอะไร | โค้ด |
| --- | --- | --- | --- |
| ปกติ | มีบันทึก ≥ 1 | การ์ดเรียง **ใหม่สุดขึ้นก่อน** จัดกลุ่มตามเดือน | [page.tsx:14](../src/app/(app)/checkin/history/page.tsx#L14) |
| **ว่าง** | `checkins.length === 0` | การ์ดใบเดียวจัดกลาง: "ยังไม่มีบันทึกย้อนหลัง" + ปุ่มเต็มกว้าง "บันทึกวันนี้" · **ไม่มีไอคอน ไม่มี illustration** | [checkin-history.tsx:136-147](../src/components/checkin/checkin-history.tsx#L136) |
| ก่อนยืนยันลบ | กดปุ่ม "ลบ" | แถวปุ่มถูกแทนที่ในการ์ดใบนั้น: "ลบบันทึกของ <วันที่> ถาวร — กู้คืนไม่ได้" + "ยืนยันลบ <วันที่>" + "ยกเลิก" | [checkin-history.tsx:92-114](../src/components/checkin/checkin-history.tsx#L92) |
| กำลังลบ | `pending` | ปุ่มยืนยันเป็น "กำลังลบ…" · ทั้งสองปุ่ม disabled | [checkin-history.tsx:103](../src/components/checkin/checkin-history.tsx#L103) |
| ลบสำเร็จ | `deleted` | การ์ดยุบเหลือบรรทัดเดียว: เครื่องหมายถูกเขียว + "ลบบันทึกของ <วันที่> แล้ว" (การ์ดไม่หายจากจอ) | [checkin-history.tsx:46-55](../src/components/checkin/checkin-history.tsx#L46) |
| ลบไม่สำเร็จ | action คืน `{error}` | บรรทัดแดง "ลบไม่สำเร็จ ลองใหม่อีกครั้ง" | [actions.ts:63-65](../src/lib/checkins/actions.ts#L63) |
| ดึงข้อมูลพลาด | query error | `getCheckins` คืน `[]` → ตกลง empty state เดียวกับ "ยังไม่มีบันทึก" — **ไม่มี error state แยก** | [queries.ts:15](../src/lib/checkins/queries.ts#L15) |

**a11y & interaction**

- `<h1>` 1 อัน · หัวกลุ่มเดือนเป็น `<h2>` จริง → ลำดับหัวข้อไม่ข้ามชั้น
- **`size="sm"` ในเรโปนี้คือ `h-11` ไม่ใช่ 32px** → ปุ่ม "แก้ไข"/"ลบ" ผ่านกฎ 44px
- ลิงก์ "แก้ไข" แต่งเป็นปุ่มด้วย `buttonVariants()` ตรงตามข้อเตือนใน DESIGN.md
- ยืนยันลบเป็นการเปลี่ยนเนื้อในการ์ด **ไม่ใช้ dialog** → ไม่มี focus trap ให้จัดการ แต่ ⚠️ **ไม่มีการย้าย focus หรือ `aria-live`** เมื่อเปลี่ยนสถานะ
- สีไอคอน pillar มาจาก chart token ผ่าน `style` → พลิก dark mode ให้เอง และมีข้อความกำกับทุกบรรทัด ไม่ได้สื่อด้วยสีอย่างเดียว

**ทำไมถึงเป็นแบบนี้**

- **มีหน้านี้เพราะเกณฑ์ privacy** — [F1-03](../.scratch/f1-checkin/issues/03-edit-backfill.md) AC: "ลบรายการได้จริง (เกณฑ์ privacy — แก้/ลบข้อมูลตัวเองได้)" · URL ถูกล็อกไว้ให้หน้า privacy ลิงก์มาตาม FR-7.3
- **ยืนยันลบ 2 จังหวะในการ์ด ไม่ใช้ dialog** — [F1-03](../.scratch/f1-checkin/issues/03-edit-backfill.md): "เลี่ยงแตะ `package.json` ซึ่งเป็นไฟล์ shared"
- **ชื่อภาษาไทยของทุกค่ามาจากที่เดียว** — `src/lib/checkins/labels.ts` "Dashboard/ประวัติ ใช้ตัวนี้ อย่าตั้งชื่อเอง"
- **แก้แล้วหน้าอื่นอัปเดตทันที** — `revalidatePath` ทั้ง `/checkin`, `/checkin/history`, `/dashboard` ทุกครั้งที่บันทึกหรือลบ [actions.ts:12-16](../src/lib/checkins/actions.ts#L12)
# หน้าในแอป — ภาพรวมและสรุปสัปดาห์

## `/dashboard` — ภาพรวมสุขภาพ

| | |
| --- | --- |
| ไฟล์ | [page.tsx](../src/app/(app)/dashboard/page.tsx) · [loading.tsx](../src/app/(app)/dashboard/loading.tsx) |
| PageContainer | `width="content"` (1024px) ทั้ง 2 สาขาของหน้า |
| h1 | "ภาพรวมสุขภาพ" — **มองเห็น** พร้อมไอคอน `BarChart3` (สาขา empty ก็มี h1 เดียวกัน) |
| loading.tsx | มี → `ContentSkeleton` = แถบหัวข้อ + แถบ toggle (`lg:w-72`) + grid 3 คอลัมน์ (ซ้าย 2 การ์ดเล็ก / ขวาการ์ดกราฟ `h-56`) + `LoadingLabel` |
| Suspense | **3 จุด**: `CurrentGoalCard` และ `ReflectionCard` (`CardSkeleton rows={1}`) · `PatternTable` (`CardSkeleton rows={3}`) · `PillarCharts` **ไม่ใช้ Suspense** แต่ใช้ `next/dynamic` `ssr: false` + skeleton ของตัวเอง [pillar-charts-lazy.tsx:32](../src/components/dashboard/pillar-charts-lazy.tsx#L32) |

**โครงหน้า (บนลงล่าง · มือถือ → เดสก์ท็อป)**

1. **หัวเรื่อง + ตัวเลือกช่วงเวลา** — มือถือ `flex-col` (หัวเรื่องบน · ปุ่ม 7/14/30 เต็มกว้างล่าง) → `lg:flex-row lg:justify-between` ปุ่มย้ายไปขวาสุด
2. **สรุปวันนี้ + กราฟแนวโน้ม** — `grid-cols-1` → `lg:grid-cols-3` (สรุปวันนี้ 1 คอลัมน์ · กราฟ 2 คอลัมน์)
3. **เป้าหมายสัปดาห์นี้ + สรุปสัปดาห์** — ซ้อนกัน → `lg:grid-cols-2` · การ์ด "สรุปสัปดาห์" คือ**ทางเข้าเดียว**ไป `/reflection`
4. **คืนสู่เช้า — 7 วันล่าสุด** (timeline นอน/มื้อแรก) เต็มกว้างเสมอ · ภายในมี `sm:` เดียว: แถบ "ขยับ" เป็นหลอด progress เฉพาะ `sm:` ขึ้นไป ต่ำกว่านั้นเป็นตัวเลข "N น."
5. **วิเคราะห์รูปแบบพฤติกรรม** เต็มกว้าง — มือถือเป็นการ์ดรายแถว (`lg:hidden`) เดสก์ท็อปเป็นตาราง 4 คอลัมน์ (`hidden lg:block`)

> หน้านี้ดึง `getCheckins(MAX_PERIOD)` = 30 วันเสมอ แล้วกรองตามช่วงที่เลือกในหน่วยความจำ — กดสลับ 7/14/30 ไม่ยิง DB เพิ่ม แต่ยังเป็น navigate จริง (`/dashboard?days=N`)

**ช่วงเวลา 7/14/30**

- รับได้ 3 ค่าเท่านั้น `[7, 14, 30]` · **ค่า default = 14** · ค่าอื่น/ไม่ส่ง → 14
- เป็น `<Link href="/dashboard?days=N">` ไม่ใช่ปุ่ม client — **state อยู่ใน URL แชร์ลิงก์ได้** · ตัวที่เลือกได้ `aria-current="page"`
- มีผลกับ: ข้อความ "บันทึกแล้ว N วัน จาก M วัน", กราฟแนวโน้ม, `PatternTable` · **ไม่มีผลกับ** การ์ดสรุปวันนี้ และ "คืนสู่เช้า" ซึ่งตรึงที่ 7 วันเสมอ

**กราฟ "แนวโน้มรายวัน"**

| แท็บ | dataKey | token | legend ใต้กราฟ |
| --- | --- | --- | --- |
| นอน | `sleepHours` | `--chart-1` | "ชั่วโมงนอน (ชม.)" |
| กิน | `mealsCount` + `sweetDrinks` | `--chart-2` + `--chart-6` | "มื้อที่กิน (มื้อ)" · "เครื่องดื่มหวาน (แก้ว)" |
| ขยับ | `movementMinutes` | `--chart-3` | "นาทีเคลื่อนไหว" |
| พลังงาน | `energyRaw` | `--chart-4` | "ระดับพลังงาน" |

- ใช้ `color: "var(--chart-N)"` ตรงตาม DESIGN.md · ⚠️ **แต่ `--chart-6` อยู่นอกช่วง `--chart-1..5` ที่ DESIGN.md ข้อ 4 ระบุ** (token มีจริงพร้อมคู่ dark — เอกสารไม่ได้อัปเดต)
- แท็บเป็น `<button>` client-side `min-h-11` มี `aria-pressed` · label สั้น (นอน/กิน/ขยับ/พลังงาน) ตามกฎ "pill ต้องจบแถวเดียว"
- **legend เป็น `<div>` ใต้กราฟ ไม่ใช่ `ChartLegend` ใน SVG** — [F2-03](../.scratch/f2-dashboard/issues/03-disruptor-overlay.md): "มันชนกับ marker เสมอ"
- tooltip เขียนเอง ภาษาไทยทั้งหมด: หัว = วันที่ไทยแบบเต็ม · ค่ามีหน่วยไทย · แท็บพลังงานแปลง 1/2/3 เป็น "ต่ำ/กลาง/สูง"
- แกน Y: แท็บนอน fix `[0, 12]` + เส้นอ้างอิงประที่ 6 ชม. สี `var(--muted-foreground)` (ตรงกฎสี "เส้นอ้างอิง → muted-foreground ไม่ใช่แดง")
- แกน X: `interval={0}` (โชว์ทุกวัน) เมื่อ period ≤ 14 · 30 วันปล่อยให้ recharts เว้นเอง
- **วันที่ไม่มีบันทึก = `null` ไม่ใช่ 0** ตามกฎ DESIGN.md

**State ที่รองรับ**

| State | เงื่อนไข | ผู้ใช้เห็นอะไร | โค้ด |
| --- | --- | --- | --- |
| ยังไม่มีบันทึกเลย | `checkins.length === 0` | หน้าเปลี่ยนทั้งหน้า: การ์ดขอบประ + "ยังไม่มีข้อมูลสุขภาพ" + ปุ่ม "เช็คอินวันนี้" · ไม่มีกราฟ ไม่มี PatternTable | [page.tsx:30-61](../src/app/(app)/dashboard/page.tsx#L30) |
| ปกติ | มีบันทึก ≥ 1 วัน | หัวเรื่อง + toggle + สรุปวันนี้ + กราฟ + 2 การ์ด + คืนสู่เช้า + วิเคราะห์รูปแบบ | [page.tsx:67-108](../src/app/(app)/dashboard/page.tsx#L67) |
| กำลังโหลดกราฟ | JS ยังไม่มา (`ssr:false`) | `ChartCardSkeleton` — โครงเดียวกับการ์ดจริง | [pillar-charts-lazy.tsx:8-30](../src/components/dashboard/pillar-charts-lazy.tsx#L8) |
| กดสลับช่วงเวลา | ระหว่าง navigate | `PendingBar` ในลิงก์ (`useLinkStatus`) | [period-toggle.tsx:40](../src/components/dashboard/period-toggle.tsx#L40) |
| วันนี้ยังไม่เช็คอิน | `todayCheckin === null` | Badge `outline` "ยังไม่ได้บันทึก" · ตัวเลข 3 เสาเป็น "--" · ปุ่ม "บันทึกตอนนี้" | [today-summary.tsx:40](../src/components/dashboard/today-summary.tsx#L40) |
| วันนี้เช็คอินแล้ว | มี checkin ของวันนี้ | Badge `secondary` "พลังงานต่ำ/ปานกลาง/สูง" · ตัวเลขจริง · ข้อความให้กำลังใจ · ปุ่ม `outline` "แก้ไขบันทึกวันนี้" | [today-summary.tsx:41-46](../src/components/dashboard/today-summary.tsx#L41) |
| วันไม่มีบันทึกในกราฟ | data point `null` | ช่องว่าง ไม่มีแท่ง (ไม่ใช่แท่ง 0) | [pillar-charts.tsx:134](../src/components/dashboard/pillar-charts.tsx#L134) |
| วันไม่มีบันทึกใน "คืนสู่เช้า" | ไม่มี checkin | แถวขอบประเปล่า + "ไม่ได้บันทึก" ทางขวา | [day-lines.tsx:91-98](../src/components/dashboard/day-lines.tsx#L91) |
| DB error ตอนดึง checkin | query error | ⚠️ **กลืนเงียบ** — คืน `[]` → ผู้ใช้เห็น "ยังไม่มีข้อมูลสุขภาพ" เหมือนผู้ใช้ใหม่ | [queries.ts:15](../src/lib/checkins/queries.ts#L15) |

**การ์ด "วิเคราะห์รูปแบบพฤติกรรม" (AI) — ครบทุกสถานะ**

`MIN_DAYS_FOR_ANALYSIS = 7` นับจาก**จำนวนวันที่บันทึกจริงในช่วงที่เลือก** ไม่ใช่ความยาวช่วง

| สถานะ | เงื่อนไข | ผู้ใช้เห็นอะไร | โค้ด |
| --- | --- | --- | --- |
| ข้อมูลไม่พอ (0 วัน) | `recordedDays === 0` | "เริ่มเช็คอินวันแรกได้เลย · พอบันทึกครบ 7 วัน ระบบจะเริ่มมองหารูปแบบให้" · **ไม่มีปุ่ม** | [sufficiency.ts:8](../src/lib/ai-outputs/sufficiency.ts#L8) |
| ข้อมูลไม่พอ (1–6 วัน) | `recordedDays < 7` | "บันทึกแล้ว N วัน · อีก M วันก็เริ่มดูรูปแบบได้แล้ว บันทึกต่ออีกนิดนะ" · **ไม่มีปุ่ม → ไม่มีทางยิง AI** | [sufficiency.ts:10](../src/lib/ai-outputs/sufficiency.ts#L10) |
| พอแล้วแต่ยังไม่เคย generate | ไม่มีแถวใน `ai_outputs` | คำอธิบาย + ปุ่มหลัก **"วิเคราะห์รูปแบบ"** | [pattern-table.tsx:141-153](../src/components/dashboard/pattern-table.tsx#L141) |
| มีผลแล้ว (cache hit ตอน render) | span ตรงช่วง และ `period_end` ยังอยู่ในหน้าต่าง | หัวการ์ดบอกช่วงวันที่ไทย + "พบ N รูปแบบ จากทั้งหมด M" + ปุ่ม `outline` "วิเคราะห์ใหม่" | [pattern-table.tsx:177-201](../src/components/dashboard/pattern-table.tsx#L177) |
| วิเคราะห์แล้วไม่พบรูปแบบ | `patterns.length === 0` | "ยังไม่พบรูปแบบที่เด่นชัดในช่วงนี้ — บันทึกต่อไปเรื่อย ๆ ระบบจะเห็นความเชื่อมโยงมากขึ้น" | [pattern-table.tsx:155-173](../src/components/dashboard/pattern-table.tsx#L155) |
| กำลังวิเคราะห์ | `isPending` | ปุ่ม disabled "กำลังวิเคราะห์ให้…" + "ใช้เวลาราว 10 วินาที" | [generate-insight-button.tsx:49-52](../src/components/dashboard/generate-insight-button.tsx#L49) |
| **cache hit ตอนกดปุ่ม** | cache ใหม่กว่า check-in ล่าสุด | คืน `{ok, cached:true}` **ไม่ยิง Gemini** → แค่ `router.refresh()` · ⚠️ **ผู้ใช้ไม่เห็นข้อความบอกว่าใช้ของเดิม** | [actions.ts:92-94](../src/lib/ai-outputs/actions.ts#L92) |
| **โควตา Gemini หมด** | `isQuotaExhausted(error)` | ⚠️ **ไม่มี UI แยก** — คืน `null` เงียบ ๆ แล้วใช้ข้อความ template แทน → เห็นการ์ดผลวิเคราะห์ตามปกติ (ตัวเลขยังจริงเพราะมาจาก `lib/patterns`) | [insight-ai.ts:117-123](../src/lib/ai-outputs/insight-ai.ts#L117) |
| error ระบบตอน generate | exception อื่น | กล่องแดง "ไม่สามารถวิเคราะห์ข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง" | [actions.ts:119](../src/lib/ai-outputs/actions.ts#L119) |
| ข้อมูลไม่พอตอนกดปุ่ม (edge) | ข้อมูลลดลงหลัง render | ⚠️ ข้อความชวนบันทึกแสดงในกล่องสไตล์ **destructive** — ขัดกฎสี DESIGN.md | [generate-insight-button.tsx:28-31](../src/components/dashboard/generate-insight-button.tsx#L28) |

จำนวน pattern ที่แสดง: สูงสุด **5** · มือถือกางไว้ **2** อันแรก ที่เหลืออยู่ใน `<details>` ปุ่ม "ดูอีก N รูปแบบ"

**Disruptor overlay (ปัจจัยรบกวน)**

- อยู่ที่ **แกน X ของกราฟ** — custom tick ที่ฝัง `<foreignObject>` แทน label วัน
- 6 ชนิด ใช้สี token ทั้งหมด: เดดไลน์ `AlertCircle` primary · ประชุมยาว `Users` chart-2 · เรียนเช้า `Sunrise` chart-3 · เดินทางไกล `Car` chart-4 · สอบ `GraduationCap` chart-5 · เรียน/ทำงาน online `Laptop` chart-1 · ค่า `none` ถูกกรองออก
- แสดงเฉพาะ **ตัวแรก** ของวันนั้น ที่เหลือเห็นครบใน popover
- ขนาดปรับตามความหนาแน่น: period ≥ 14 → กรอบ 28px · น้อยกว่า → 44px
- **กดด้วยคีย์บอร์ดได้** — `role="button"` + `tabIndex={0}` + รับ `Enter`/`Space` + `aria-expanded` · `aria-label` เป็นประโยคไทยเต็ม · มี e2e คุมเส้นทางนี้จริง
- hover = ชั่วคราว · click/Enter = ล็อก popover พร้อมปุ่มปิด `aria-label="ปิด"`
- popover ใช้ `z-50` ตรงตาม DESIGN.md · ถ้าวันนั้นไม่มีโน้ต แสดง "(ไม่มีบันทึกเพิ่มเติม)"
- legend สัญลักษณ์: มือถือพับใน `<details>` "สัญลักษณ์วันพิเศษ" (summary `min-h-11` มี focus ring) · `lg:` กางเป็นแถวเดียว
- **สลับแท็บกราฟจะปิด popover อัตโนมัติ**
- ใน "คืนสู่เช้า" แสดงคนละแบบ: แถบพื้นทั้งแถว `bg-chart-5/22 ring-chart-5/45` — ตรงกฎสี "วันที่มีปัจจัยรบกวนใช้ `--chart-5` ปะการัง"

**Copy ที่ผู้ใช้เห็น**

- หัวเรื่อง "ภาพรวมสุขภาพ" · "ดูแนวโน้มสุขภาพและคำแนะนำจากบันทึกสุขภาพรายวันของคุณ — บันทึกแล้ว {N} วัน จาก {M} วันที่ผ่านมา"
- Empty: "ยังไม่มีข้อมูลสุขภาพ" / "บันทึกสุขภาพรายวันครั้งแรกของคุณเพื่อเริ่มต้นวิเคราะห์แนวโน้มสุขภาพทั้ง 3 ด้าน (การกิน การนอน และการเคลื่อนไหว)" / ปุ่ม "เช็คอินวันนี้"
- สรุปวันนี้: "สรุปวันนี้" · badge "ยังไม่ได้บันทึก" / "พลังงานต่ำ|ปานกลาง|สูง" · ป้ายเสา "การกิน" / "การนอน" / "เคลื่อนไหว" · "คุณยังไม่ได้บันทึกพฤติกรรมสุขภาพของวันนี้ แวะมาเช็คอินสักนิดเพื่อดูภาพรวมของวันนี้กันนะ"
- กราฟ: "แนวโน้มรายวัน" / "ย้อนหลัง {N} วัน"
- คืนสู่เช้า: "คืนสู่เช้า — 7 วันล่าสุด" · "แต่ละแถวคือหนึ่งวัน เรียงตามเวลาจริงตั้งแต่เข้านอนจนถึงมื้อแรก · วันที่มีปัจจัยรบกวนจะมีแถบสีคลุมทั้งแถว" · legend "ช่วงที่นอน" / "มื้อแรกของวัน" / "นาทีที่ขยับ (ไม่ได้อ้างเวลา)" / "วันที่มีปัจจัยรบกวน" · เชิงอรรถ "เช็คอินบันทึกเวลาเป็นช่วง (เช่น เข้านอน 23:00–00:00) แท่งจึงวางตามกลางช่วงที่เลือกไว้ ไม่ใช่เวลานาทีจริง"
- ตาราง pattern: หัวคอลัมน์ "ด้าน" / "Pattern ที่พบ" / "ความหมาย" / "Next Step" · ป้าย "ลองทำสัปดาห์นี้" · **เชิงอรรถสำคัญ: "ตัวเลขทั้งหมดคำนวณจากบันทึกจริงของคุณ · AI ช่วยเรียบเรียงเป็นภาษา ไม่ได้เดาเอง"**

**a11y & interaction**

- h1 เดียวมองเห็นจริง · `<main>` มาจาก layout ไม่ประกาศซ้ำ
- จุดกดทั้งหมด ≥ 44px · `<summary>` ของ details ทั้ง 2 จุด `min-h-11`
- ⚠️ **marker disruptor ที่ `tabIndex={0}` ไม่พบคลาส `focus-visible:`** — เห็นวงแหวนก็ต่อเมื่อกด Enter แล้ว (`activeDate`) ขัดกฎ "Interactive ที่สร้างเองต้องมี focus ring"
- aria ที่ใช้จริง: `nav aria-label="เลือกช่วงเวลา"` · `aria-current="page"` · `aria-pressed` บนแท็บกราฟ · `aria-label`/`aria-expanded` บน marker · `role="status" aria-live="polite"` ใน skeleton
- ตัวอักษรไทย: ไม่พบ `text-[10px]` · ที่ต่ำกว่า `text-xs` มีเฉพาะ **ตัวเลข/เวลา** (`text-[11px]`) ซึ่งเข้าข้อยกเว้น "ตัวเลขล้วนในบริบทแน่น ต่ำสุด 11px"

**ทำไมถึงเป็นแบบนี้**

- **Suspense ครอบ 3 การ์ด** — [INFRA-10](../.scratch/infra/issues/10-render-waterfalls.md) วัดไว้ว่า "Gemini ตอบ ~10 วินาที → dashboard ทั้งหน้าค้างรอ 10 วิ ทั้งที่กราฟกับตาราง pattern พร้อมแสดงตั้งนานแล้ว"
- **แท็บ "ขยับ" เป็นแท่งนาทีรวมสีเดียว ไม่แยกชนิด** — [F2-02](../.scratch/f2-dashboard/issues/02-pillar-charts.md): "ข้อมูลจริงรองรับไม่ได้ (check-in เก็บนาทีรวม)" · เคยพังเป็นกราฟว่างและถูกตามแก้ใน [F2-06](../.scratch/f2-dashboard/issues/06-movement-tab-blank.md) พร้อมเพิ่ม e2e ที่วัด "ความสูงจริง" ของแท่ง
- **พลังงานใช้สีเดียว `--chart-4`** — [F2-02](../.scratch/f2-dashboard/issues/02-pillar-charts.md): "ห้ามใช้แดง=ต่ำ/เขียว=สูง (CVD)"
- **`generateInsight` ผูกกับปุ่มเท่านั้น ห้ามเรียกตอน render** — [F2-04](../.scratch/f2-dashboard/issues/04-pattern-table.md): "เช็ค `checkDataSufficiency` ก่อนโชว์ปุ่ม (< 7 วัน = ไม่มีปุ่ม ไม่ยิง AI)"
- **ตัวเลขทั้งหมดมาจาก `lib/patterns` ไม่ใช่ AI** — [F3-03](../.scratch/f3-pattern-analysis/issues/03-insight-endpoint-cache.md): "Gemini เขียนแค่ภาษา ส่วนสถิติ (evidence) + pillars มาจาก `lib/patterns` เสมอ ไม่ให้ Gemini แต่งเลข" และ "Gemini ล่ม/โควตาหมด → template ทั้งหมด หน้าไม่พัง" — อธิบายว่าทำไมไม่มี UI สถานะ "โควตาหมด"
- **"< 7 วัน" เป็น state ของตัวเอง ไม่ใช่ error สีแดง** — [F3-04](../.scratch/f3-pattern-analysis/issues/04-insufficient-data.md)
- **ห้ามถอด `CurrentGoalCard` + `ReflectionCard` ออกจากหน้า** — [F2-02](../.scratch/f2-dashboard/issues/02-pillar-charts.md): "ลิงก์ไป `/reflection` มีที่เดียวในแอปคือการ์ดใบนี้ และไม่มีเทสต์ตัวไหนจับ"
- **ไม่มีคะแนน/เกรด/streak เชิงลงโทษ** — AC ของ [F2-02](../.scratch/f2-dashboard/issues/02-pillar-charts.md) และ [F2-05](../.scratch/f2-dashboard/issues/05-streak.md) ที่ยัง `ready-for-human` (Priority C)
- **กราฟใช้ `color: var(--chart-N)` ห้าม `theme: {light, dark}`** — [INFRA-14](../.scratch/infra/issues/14-chart-tokens-dark-mode.md) วัดได้ว่าแบบเดิม contrast เหลือ 1.44:1 ใน dark mode

---

## `/reflection` — สรุปสัปดาห์

| | |
| --- | --- |
| ไฟล์ | [page.tsx](../src/app/(app)/reflection/page.tsx) · [loading.tsx](../src/app/(app)/reflection/loading.tsx) |
| PageContainer | `width="content"` (1024px) **แต่ห่อเนื้อหาอีกชั้นด้วย `mx-auto max-w-3xl`** (768px) เพื่อคุมความกว้างบรรทัดของย่อหน้ายาว |
| h1 | "สรุปสัปดาห์" — **มองเห็น** พร้อมไอคอน `NotebookPen` |
| loading.tsx | มี → `TextPageSkeleton` — **รูปทรงตรงกับหน้าจริง** |
| Suspense | **ไม่มี** — ทำได้เพราะหน้านี้ **ไม่เรียก AI ตอน render** |

หน้านี้ประกาศ `export const dynamic = "force-dynamic"` [page.tsx:20](../src/app/(app)/reflection/page.tsx#L20) — หน้าเดียวในแอปที่บังคับไว้ชัด ๆ (⚠️ ไม่พบคำอธิบายเหตุผลในโค้ดหรือ issue)

**โครงหน้า**

1. **หัวเรื่อง** "สรุปสัปดาห์" + คำโปรย
2. **Week picker** — แสดงเมื่อมี reflection > 1 สัปดาห์ · แถบ pill เลื่อนแนวนอน `overflow-x-auto` กินขอบจอด้วย `-mx-3 px-3` → `lg:mx-0`
3. **การ์ดเตือน "ยังไม่รวมบันทึกล่าสุด"** — ตามเงื่อนไข
4. **การ์ดหลัก**: หัว = ช่วงวันที่ไทยแบบสั้น · "คุณบันทึกข้อมูล N จาก M วัน" · 3 บล็อกเสา (กิน/นอน/ขยับ) แต่ละบล็อก = วงกลมไอคอน + `<h3>` "ด้าน{การกิน|การนอน|การเคลื่อนไหว}" + ย่อหน้า `text-base`
5. **การ์ด "เทียบกับสัปดาห์ก่อน"** — เมื่อ `comparison !== null`
6. **การ์ด "จุดแข็งที่ควรรักษาไว้"** (ไอคอน `Sparkles`)
7. **การ์ด "ข้อเสนอสำหรับสัปดาห์หน้า"** (ไอคอน `Target`) + ปุ่มเต็มกว้าง "ตั้งเป้าสัปดาห์หน้า" → `/goals`

**ไม่มี `lg:` เปลี่ยนโครงเลย** — คอลัมน์เดียวทุกขนาดจอ ต่างแค่ขนาด h1 และ margin ของ week picker

**Reflection generate เมื่อไหร่**

- **ไม่ auto-generate ตอนเปิดหน้า** — อ่านจาก `ai_outputs` อย่างเดียว (สูงสุด 12 สัปดาห์)
- สร้างเมื่อ **ผู้ใช้กดปุ่มเท่านั้น** · ช่วงที่สรุปคือ **7 วันล่าสุดจนถึงวันนี้** เสมอ ไม่ใช่สัปดาห์ปฏิทิน
- ปุ่มปรากฏ 2 ที่: การ์ด empty state และการ์ดเตือน "ยังไม่รวมบันทึกล่าสุด"
- ⚠️ [F6-01](../.scratch/f6-weekly-reflection/issues/01-generation.md) เขียนสเปกไว้ว่า "Generate เมื่อผู้ใช้เปิดดูสัปดาห์ที่จบแล้วและยังไม่มีรายงาน" — **โค้ดที่ลงจริงไม่ทำแบบนั้น** (น่าจะเพื่อกันโควตา ตามคอมเมนต์ใน [F6-02](../.scratch/f6-weekly-reflection/issues/02-ui-history.md))

**State ที่รองรับ**

| State | เงื่อนไข | ผู้ใช้เห็นอะไร | โค้ด |
| --- | --- | --- | --- |
| ยังไม่เคยมีสรุปเลย | คืน `[]` | การ์ด "ยังไม่มีสรุปของสัปดาห์นี้" + "สรุปสร้างจากบันทึก 7 วันล่าสุดของคุณ ยิ่งบันทึกหลายวัน ภาพก็ยิ่งชัด" + ปุ่ม "สร้างสรุปสัปดาห์" · **ไม่มี week picker ไม่มีการ์ดอื่น** | [page.tsx:74-88](../src/app/(app)/reflection/page.tsx#L74) |
| มีสรุปเดียว | `reflections.length === 1` | **ซ่อน week picker** | [page.tsx:123](../src/app/(app)/reflection/page.tsx#L123) |
| เลือกสัปดาห์จาก URL | `?week=YYYY-MM-DD` | แสดงใบนั้น · ถ้าไม่ตรงกับใบไหนเลย → **fallback ใบล่าสุด ไม่ error** | [week-picker.tsx:11-17](../src/components/reflection/week-picker.tsx#L11) |
| สรุปเก่ากว่าบันทึกล่าสุด | สัปดาห์ล่าสุด **และ** `!isFresh(...)` | การ์ดเตือนพื้น `bg-accent/20` ไอคอน `RefreshCw` + ปุ่ม "สร้างสรุปใหม่ให้ตรงข้อมูลล่าสุด" · **เฉพาะสัปดาห์ล่าสุด** | [page.tsx:54-72](../src/app/(app)/reflection/page.tsx#L54) |
| ไม่มีสัปดาห์ก่อนให้เทียบ | `previous.daysRecorded === 0` | **ซ่อนการ์ด "เทียบกับสัปดาห์ก่อน" ทั้งใบ** ไม่ขึ้นข้อความแทน | [reflection-facts.ts:156](../src/lib/ai-outputs/reflection-facts.ts#L156) |
| บันทึก < 3 วัน (ตอน generate) | `< MIN_DAYS_FOR_REFLECTION` | **ไม่ยิง Gemini เลย** — ได้ "สรุปสั้น": ทั้ง 3 เสาเขียน "ยังบันทึกไม่ถึงพอจะสรุปด้าน{...} ลองบันทึกต่ออีกหน่อยนะ" · จุดแข็ง "เริ่มบันทึกแล้ว N วัน เป็นก้าวแรกที่ดีมาก" | [reflection-facts.ts:200-218](../src/lib/ai-outputs/reflection-facts.ts#L200) |
| ไม่มีบันทึกเลยในสัปดาห์ | `checkins.length === 0` | กล่องแดง "ยังไม่มีบันทึกในสัปดาห์นี้ ลองเช็คอินก่อน" | [actions.ts:133](../src/lib/ai-outputs/actions.ts#L133) |
| กำลัง generate | `isPending` | ปุ่ม disabled "กำลังสรุปให้…" + "ใช้เวลาราว 10 วินาที" | [generate-reflection-button.tsx:30-34](../src/components/reflection/generate-reflection-button.tsx#L30) |
| **cache hit ตอนกดปุ่ม** | `isCacheUsable(...)` | ไม่ยิง Gemini → แค่ `router.refresh()` · ⚠️ **ไม่มีข้อความบอกผู้ใช้** | [actions.ts:126-128](../src/lib/ai-outputs/actions.ts#L126) |
| **โควตา Gemini หมด** | `isQuotaExhausted(error)` | ⚠️ **ไม่มี UI แยก** — ใช้ `templateReflection(facts)` แทน → ได้สรุปตัวเลขล้วน เช่น "นอนเฉลี่ย 6.8 ชม. · เข้านอนหลังเที่ยงคืน 4 วัน" · ข้อความ "โควตา AI ของวันนี้หมดแล้ว…" ใน [errors.ts:15](../src/lib/ai/errors.ts#L15) **ไม่ถูกใช้บนหน้านี้** | [reflection-ai.ts:86-92](../src/lib/ai-outputs/reflection-ai.ts#L86) |
| AI ตอบผิด schema / ติดคำต้องห้าม | parse ไม่ผ่าน หรือ `findForbiddenTerms` เจอ | retry 1 ครั้ง แล้ว fallback เป็น template — ผู้ใช้ไม่เห็นความต่าง | [reflection-ai.ts:57-73](../src/lib/ai-outputs/reflection-ai.ts#L57) |

**การ์ด "เทียบกับสัปดาห์ก่อน" — 4 แถวคงที่**

"บันทึก" (วัน) · "นอนเฉลี่ย" (ชม./วัน) · "ขยับเฉลี่ย" (นาที/วัน) · "กินครบทุกมื้อ" (% ของวันที่บันทึก) · แต่ละแถวอ่านว่า `ค่าเก่า → ค่าใหม่ หน่วย` + ไอคอนลูกศรขึ้น/ลง/ขีด + ส่วนต่าง · **ทิศทางสื่อด้วยไอคอน ไม่ใช่สีเขียว/แดง** — ทุกตัวเลขใช้ `text-foreground`/`text-muted-foreground` · เชิงอรรถ: "ตัวเลขเทียบเป็นค่าเฉลี่ยต่อวันและสัดส่วนของวันที่บันทึก จึงเทียบกันได้แม้สองสัปดาห์บันทึกไม่เท่ากัน"

**Copy ที่ผู้ใช้เห็น**

- "สรุปสัปดาห์" · "ภาพรวมการกิน การนอน และการเคลื่อนไหวของคุณ พร้อมก้าวเล็ก ๆ สำหรับสัปดาห์หน้า"
- การ์ดเตือน: "สรุปนี้ยังไม่รวมบันทึกล่าสุดของคุณ" / "ข้อความสรุปด้านล่างสร้างไว้ก่อนที่คุณจะบันทึกเพิ่ม ส่วนตัวเลขที่เทียบกับสัปดาห์ก่อนคำนวณสดจากข้อมูลปัจจุบันเสมอ ทั้งสองอย่างจึงอาจไม่ตรงกัน"
- หัวข้อย่อย "ด้านการกิน" / "ด้านการนอน" / "ด้านการเคลื่อนไหว"
- การ์ดอื่น: "เทียบกับสัปดาห์ก่อน" · "จุดแข็งที่ควรรักษาไว้" · "ข้อเสนอสำหรับสัปดาห์หน้า" · ปุ่ม "ตั้งเป้าสัปดาห์หน้า"
- Week picker: ใบแรก "สัปดาห์ล่าสุด" ใบอื่นเป็นวันที่ไทยแบบสั้น

**a11y & interaction**

- h1 เดียว · หัวข้อย่อยในการ์ดเป็น `<h3>` (`CardTitle` เป็น `<div>` ไม่นับ)
- Week picker: `<nav aria-label="เลือกสัปดาห์">` · ลิงก์ `min-h-11` + `aria-current="page"` + `PendingBar` — เป็นตัวอย่างของ "รายการที่โตได้เรื่อย ๆ ให้เลื่อนแนวนอน" ใน DESIGN.md
- **ย่อหน้ายาวใช้ `text-base` ทุกจุด** ตรงตามสเกล DESIGN.md · ความกว้างบรรทัดคุมด้วย `max-w-3xl`
- สีไอคอนเสาไม่ hardcode: `PILLAR_COLORS` map ไป `var(--chart-1/2/3)`
- ⚠️ ไม่พบ `aria-live` ที่ประกาศผลลัพธ์หลัง generate เสร็จ — รับรู้ผ่านการเปลี่ยนของหน้าหลัง `router.refresh()` เท่านั้น

**ทำไมถึงเป็นแบบนี้**

- **การ์ด "เทียบกับสัปดาห์ก่อน" มีเพราะเกณฑ์ Reflection and Improvement** — [F6-03](../.scratch/f6-weekly-reflection/issues/03-week-comparison.md): "ตรวจ `src/lib` ทั้งหมดแล้วไม่มีการเทียบสัปดาห์ต่อสัปดาห์อยู่ที่ไหนเลย … แปลว่าเราจะเสียคะแนนเกณฑ์นี้แบบไม่รู้ตัว"
- **ตัวเลขเทียบคำนวณสดในโค้ด ไม่ใช้ AI และไม่ฝังใน cache** — [F6-03](../.scratch/f6-weekly-reflection/issues/03-week-comparison.md): "ไม่กินโควตา · unit test ได้ · ใช้ได้แม้ Gemini ล่ม" และ "ปาล์มมี reflection 4 สัปดาห์ cache อยู่แล้ว ถ้าฝังในนั้นต้องรัน backfill ใหม่ = เสียโควตาฟรี ๆ"
- **เทียบค่าเฉลี่ยต่อวัน/สัดส่วน ไม่ใช่ผลรวมดิบ** — [F6-03](../.scratch/f6-weekly-reflection/issues/03-week-comparison.md): "หลอกตาเมื่อจำนวนวันบันทึกไม่เท่ากัน"
- **การ์ดเตือนแทนที่จะกลบข้อความเก่า** — [F6-02](../.scratch/f6-weekly-reflection/issues/02-ui-history.md): "ข้อความ AI ถูก cache ไว้ ส่วนตัวเลขเทียบคำนวณสด → ขัดกันได้ · ไม่กลบ แต่ขึ้นการ์ด … เฉพาะสัปดาห์ล่าสุด"
- **บันทึก < 3 วัน ได้รายงานสั้น ไม่ยิง Gemini** — [F6-01](../.scratch/f6-weekly-reflection/issues/01-generation.md): "รายงานสั้นเชิงชวนกลับมา ไม่วิเคราะห์เกินข้อมูล"
# หน้าในแอป — โค้ชและเป้าหมาย

## `/coach` — คุยกับโค้ชสุขภาพ

| | |
| --- | --- |
| ไฟล์ | [page.tsx](../src/app/(app)/coach/page.tsx) · [chat-client.tsx](../src/components/coach/chat-client.tsx) · [message-variants.tsx](../src/components/coach/message-variants.tsx) · [formatted-message.tsx](../src/components/coach/formatted-message.tsx) |
| PageContainer | **ไม่ใช้** — หน้าเดียวในแอปที่เขียนความกว้างเอง `mx-auto w-full max-w-[46rem]` · DESIGN.md ระบุข้อยกเว้นนี้ไว้ตรง ๆ |
| h1 | "คุยกับโค้ชสุขภาพ" — **มองเห็น** พร้อมไอคอน `MessageCircle` สีเขียว |
| loading.tsx | มี — skeleton ทรงเดียวกับหน้าจริง (เทิร์นโค้ช + ฟองผู้ใช้ชิดขวา + แถวช่องพิมพ์) |
| Suspense | **ไม่มีเลย** — `await Promise.all([getChatHistory(), messagesLeftToday(), getCheckins(7)])` ทั้งหมดเป็น query DB · **ไม่มีการเรียก Gemini ตอนโหลดหน้า และไม่เสียโควตา** |

**โครงหน้า — กล่องแชท 3 ชั้น**

1. **หัวเรื่อง** `shrink-0` — h1 + "รับคำแนะนำเพื่อสร้างนิสัยการกิน การนอน และการเคลื่อนไหวที่ดี"
2. **ชั้นนอก** = ตัวคุมความสูง `h-[calc(100dvh-17.75rem-env(safe-area-inset-top,0px))] min-h-[24rem] flex flex-col` · **`lg:h-[calc(100dvh-13rem)]`** — เดสก์ท็อปหักน้อยกว่าเพราะไม่มี header sticky และไม่มีเมนูล่าง · ⚠️ **ตัวเลข 17.75rem / 13rem เป็นค่าคงที่ ไม่มีคอมเมนต์อธิบายที่มา**
3. **แถบควบคุมบนสุด** `min-h-9 shrink-0` — ซ้าย = ป้ายโควตา · ขวา = ปุ่มล้างประวัติ
4. **ชั้นกลาง** = กล่องการ์ด `flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-card` แบ่งอีก 2 ส่วน:
   - **รายการข้อความ** `role="log"` `flex min-h-0 flex-1 overflow-y-auto p-4` — **ส่วนเดียวที่เลื่อน**
   - **แผงล่าง (ปักติดขอบล่างของการ์ด)** `shrink-0 border-t p-4 bg-muted/10` — ใส่ chip / error / retry / notice โควตา / ฟอร์มพิมพ์ หรือสลับเป็น UI ของ guided flow ทั้งแผง
5. **หัวใจของ "input ปักล่าง"** คือ `min-h-0` + `flex-1` + `overflow-y-auto` บนรายการข้อความ — ความสูงเกินถูกดูดไปเป็น scroll ของกล่องข้อความเท่านั้น **ตัวหน้าไม่เลื่อน**
6. **auto-scroll** — เข้าหน้าครั้งแรกเลื่อนแบบ `instant` หลังจากนั้น `smooth` ทุกครั้งที่ `messages` / `isPending` / `guidedStep` เปลี่ยน

**ฟองข้อความ — โค้ชกับผู้ใช้ต่างกันยังไง**

| | ผู้ใช้ | โค้ช |
| --- | --- | --- |
| ตำแหน่ง | ชิดขวา `flex justify-end` | ชิดซ้าย `flex gap-2.5` |
| avatar | ไม่มี | วงกลม `size-8 bg-primary/10` + `MessageCircle` (`aria-hidden`) |
| ชื่อ | ไม่มี | "โค้ช" `text-xs font-medium text-muted-foreground` |
| พื้นฟอง | มี — `bg-primary text-primary-foreground rounded-2xl rounded-br-sm` มุมขวาล่างตัด | **ไม่มีพื้นฟอง** ข้อความวางบนพื้นการ์ดตรง ๆ |
| ความกว้าง | `max-w-[80%]` | เต็มคอลัมน์ (`min-w-0 flex-1`) |
| การเรนเดอร์ | plain text `whitespace-pre-wrap` | ผ่าน `FormattedMessage` |

ทั้งคู่ห่อด้วย `memo()` · **ไม่มี boolean prop เลย** ตรงกับกฎ DESIGN.md

**markdown ในคำตอบโค้ช (`FormattedMessage` — เขียนเอง ไม่มี library)**

| รองรับ | ผลลัพธ์ |
| --- | --- |
| `**ตัวหนา**` | `<strong className="font-semibold">` |
| bullet `* ` หรือ `- ` | `<ul>` แต่ละข้อขึ้นต้นด้วย `•` สี muted |
| เลขลำดับ `1. ` | `<ul>` เก็บเลขเดิมไว้เป็น marker (ไม่ใช่ `<ol>`) |
| ย่อหน้า | `<p className="whitespace-pre-wrap break-words">` เว้น `space-y-2.5` |

**ไม่รองรับ** (จะโผล่เป็นตัวอักษรดิบ): หัวข้อ `##`, ตัวเอียง, ลิงก์ `[]()`, code fence, ลิสต์ซ้อนชั้น · **ไม่มี `dangerouslySetInnerHTML` ที่ไหนเลย → raw HTML จาก LLM หลุดไม่ได้**

> ⚠️ AC ของ [F4-06](../.scratch/f4-coach/issues/06-markdown-bubbles.md) เขียนว่า "ฟองข้อความโค้ชไม่มี `**` `##` ดิบโผล่" — โค้ดปัจจุบันแก้ `**` แล้ว แต่ **`##` ยังไม่ถูกจัดการ**

**ช่องพิมพ์**

- `<textarea rows={1}>` ไม่ใช่ `<input>`
- **โตตามเนื้อหา**: `resizeTextarea()` ตั้ง `min(scrollHeight, 128)` px คู่กับ `max-h-32 min-h-11` — เกิน 128px แล้วเลื่อนในตัวเอง
- **Enter ส่ง · Shift+Enter ขึ้นบรรทัด** และเช็ค `!e.nativeEvent.isComposing` เพื่อไม่ให้ Enter ที่ยืนยันคำจาก IME กลายเป็นการส่ง
- ตัวนับตัวอักษรโผล่เมื่อพิมพ์เกิน 80% ของ 500 · `maxLength={500}`
- ปุ่มส่ง `size-11` มี `aria-label="ส่งข้อความ"` ปิดเมื่อโควตาหมด / กำลังส่ง / ช่องว่าง

**โควตา AI**

- ลิมิต **5 ข้อความ/วัน** นับเฉพาะ role `user` ตั้งแต่เที่ยงคืน +07:00
- **ป้ายโควตาโผล่เมื่อ `0 < quotaLeft ≤ 2`** เท่านั้น — ตรงกับ DESIGN.md ("โชว์เฉพาะเมื่อเหลือ ≤ 2")
- **โควตาหมด (= 0)** → `QuotaReachedNotice` · โทน **muted อบอุ่นจริง**: `border-border bg-muted/40` ไอคอน `Moon` สี `text-muted-foreground` ไม่มี `destructive` เลย → **ทำตาม DESIGN.md ถูกต้อง**
- ⚠️ **แต่ทางอื่นที่ข้อความโควตาโผล่ยังเป็นสีเตือนภัย**: กล่อง `error` ใช้ `border-destructive/20 bg-destructive/5 text-destructive` และข้อความที่ไหลเข้ากล่องนี้ได้มีทั้ง "วันนี้คุยกับโค้ชครบ 5 ข้อความแล้ว…" ([actions.ts:88](../src/lib/chat/actions.ts#L88)) และ "โควตา AI ของวันนี้หมดแล้ว…" ([errors.ts:14](../src/lib/ai/errors.ts#L14)) — **ขัดกฎ "โควตาหมด = muted ไม่ใช่ destructive"**

**guided flow "ตั้งเป้าสัปดาห์หน้า" — ทางเข้า 3 แบบ**

| ทางเข้า | อยู่ตรงไหน | เงื่อนไข |
| --- | --- | --- |
| chip ในข้อความเปิดของโค้ช | ในฟองโค้ชกลางกล่องแชท | ยังไม่มีประวัติ **และ** มี opener |
| chip "คำถามแนะนำ" ในแผงล่าง | เหนือช่องพิมพ์ | ไม่มีประวัติ + ไม่ pending + มีโควตา + ไม่มี opener |
| ปุ่ม "ตั้งเป้าสัปดาห์หน้า" + ไอคอน `Target` | เหนือช่องพิมพ์ | `messages.length > 0 && inputValue === ""` |

ทางเข้าที่ 3 มี e2e คุมตรง ๆ ("บัญชี demo มีประวัติแชทเสมอ — ถ้า chip หาย flow เดินโชว์บนเวทีไม่ได้")

> ⚠️ คอมเมนต์ที่ [chat-client.tsx:204](../src/components/coach/chat-client.tsx#L204) เขียนว่า "เข้า guided flow เฉพาะตอนกดปุ่ม starter — ข้อความที่ผู้ใช้พิมพ์เองต้องถึงโค้ชเสมอ" แต่โค้ดจริงเทียบด้วย `text === GOAL_STARTER` เฉย ๆ → **ถ้าผู้ใช้พิมพ์ "อยากตั้งเป้าสัปดาห์หน้า" เป๊ะ ๆ ก็จะเข้า flow ไม่ถึงโค้ช**

4 ขั้นของ flow (แผงล่างถูกแทนที่ทั้งแผง ช่องพิมพ์หายชั่วคราว):

| ขั้น | ผู้ใช้เลือกอะไร | ปุ่มออก |
| --- | --- | --- |
| `pillar` | 3 ปุ่มเต็มกว้าง "การกิน (กินครบมื้อ ปรับตารางกิน)" / "การนอน (นอนเร็วขึ้น พักระหว่างทำงาน)" / "การเคลื่อนไหว (ยืดเหยียด เดินเพิ่มขึ้น)" | "ยกเลิกการตั้งเป้าหมาย" |
| `busy_days` | pill 7 วัน จ–อา toggle ได้ (`aria-pressed`) | "ย้อนกลับ" · "ไม่มีวันยุ่งเป็นพิเศษ" · "ถัดไป" |
| `constraints` | 5 ข้อจำกัด `grid-cols-1 lg:grid-cols-2` | "ย้อนกลับ" · "ไม่มีข้อจำกัด" · "ถัดไป" |
| `select_goal` | ยิง `recommendGoals(...)` → การ์ดตัวเลือก 2 ข้อ (`aria-pressed`) + ช่องแก้ข้อความ (`maxLength=80`) | "ย้อนกลับ" · "บันทึกเป้าหมาย" |

ระหว่างรอ AI ขั้นสุดท้ายจะเห็นกล่องเส้นประ + `Loader2` + "กำลังดูบันทึกของคุณเพื่อเลือกเป้าหมายที่ทำได้จริง..."

ข้อความโค้ชทั้ง 4 ก้อนและข้อความตอบของผู้ใช้ใน flow เป็น **template ในโค้ด** — ไม่ยิง Gemini และไม่บันทึกลง `chat_messages` ([F4-03](../.scratch/f4-coach/issues/03-guided-goal-flow.md): "เจตนาคือแบบฟอร์มที่แต่งเป็นบทสนทนา")

**State ที่รองรับ**

| State | เงื่อนไข | ผู้ใช้เห็นอะไร | โค้ด |
| --- | --- | --- | --- |
| ปกติ (มีประวัติ) | `history.length > 0` | ฟองข้อความไล่จากเก่าไปใหม่ (สูงสุด 50) + ปุ่ม "ล้างประวัติ" + ปุ่ม "ตั้งเป้าสัปดาห์หน้า" ตอนช่องพิมพ์ว่าง | [queries.ts:28](../src/lib/chat/queries.ts#L28) |
| ว่าง — โค้ชทักก่อน | ไม่มีประวัติ **และ** เช็คอิน 7 วันล่าสุด ≥ 3 วัน | ฟองโค้ช: บรรทัด fact + คำถาม `text-lg font-medium` + chip 2 อัน + "หรือพิมพ์เล่าเรื่องของคุณด้านล่างได้เลย" | [opener.ts:39](../src/lib/chat/opener.ts#L39) |
| ว่าง — ข้อมูลไม่พอ | เช็คอิน < 3 วัน | ไอคอน `MessageSquare` + "เริ่มคุยกับโค้ชสุขภาพประจำตัวของคุณ" · chip ย้ายไปอยู่ในแผงล่าง | [opener.ts:10](../src/lib/chat/opener.ts#L10) |
| กำลังพิมพ์ (รอโค้ชตอบ) | `isPending` | `PendingReply` — avatar โค้ช + จุด 3 จุดเด้ง (delay 0/150/300ms) | [message-variants.tsx:41](../src/components/coach/message-variants.tsx#L41) |
| ส่งแล้วยังไม่มีคำตอบ | `needsReply(messages)` | แถบ muted "ข้อความล่าสุดยังไม่ได้รับคำตอบจากโค้ช" + ปุ่ม "ลองใหม่" ที่เรียก `retryCoachReply()` (ไม่ใช่ส่งซ้ำ) | [chat-client.tsx:369](../src/components/coach/chat-client.tsx#L369) |
| โควตาหมด | `quotaLeft === 0` | การ์ด muted + ไอคอน `Moon` "คุยกับโค้ชครบสำหรับวันนี้แล้ว" · textarea `disabled` placeholder เปลี่ยนเป็น "วันนี้โควตาแชทหมดแล้ว" | [chat-client.tsx:800](../src/components/coach/chat-client.tsx#L800) |
| error | action คืน `{error}` | กล่อง `role="alert"` โทน destructive · **ถ้าข้อความผู้ใช้ถูกบันทึกแล้วจะสลับ optimistic เป็นแถวจริง ถ้ายังไม่บันทึกจะถอนฟองออก คืนโควตา และเอาข้อความกลับใส่ช่องพิมพ์ให้** | [chat-client.tsx:244](../src/components/coach/chat-client.tsx#L244) |
| ยืนยันล้างประวัติ | กด "ล้างประวัติ" | ปุ่มเปลี่ยนเป็น `destructive` "ยืนยันล้างแชท" · **กลับสภาพเดิมอัตโนมัติใน 5 วินาที** | [chat-client.tsx:404](../src/components/coach/chat-client.tsx#L404) |

**Copy ที่ผู้ใช้เห็น**

- "คุยกับโค้ชสุขภาพ" / "รับคำแนะนำเพื่อสร้างนิสัยการกิน การนอน และการเคลื่อนไหวที่ดี"
- โควตา: "เหลือคุยกับโค้ชได้อีก {N} ข้อความวันนี้" · "คุยกับโค้ชครบสำหรับวันนี้แล้ว" / "พรุ่งนี้กลับมาคุยต่อได้เลย ระหว่างนี้ยังเช็คอินและดูข้อมูลย้อนหลังได้ตามปกติ"
- ว่างไม่มี opener: "เริ่มคุยกับโค้ชสุขภาพประจำตัวของคุณ" / "ปรึกษาเรื่องพฤติกรรมการกิน การนอน หรือการขยับร่างกายเพื่อช่วยปรับปรุงชีวิตประจำวัน"
- opener (ประกอบจากข้อมูลจริง): "{วันที่ไทย} เป็นวันที่พลังงานต่ำที่สุดในช่วงนี้ และเป็นวันที่มี{disruptor}ด้วย" + "วันนั้นเกิดอะไรขึ้นบ้าง" · กรณีถอย: "คืนที่นอนสั้นที่สุดช่วงนี้คือ {วันที่} — นอน {N} ชั่วโมง"
- chip: "ช่วยดู pattern สัปดาห์นี้" · "อยากตั้งเป้าสัปดาห์หน้า"
- placeholder: "คุยกับโค้ชได้เลย…" → "วันนี้โควตาแชทหมดแล้ว"
- error จาก AI: "โค้ชกำลังคุยกับหลายคนพร้อมกัน — รอสัก 1 นาทีแล้วกด "ลองใหม่" ได้เลย" · "โค้ชตอบไม่ได้ตอนนี้ — ข้อความของคุณถูกเก็บไว้แล้ว กด "ลองใหม่" ได้เลย"
- guided flow: "ยินดีครับ! มาวางแผนตั้งเป้าสุขภาพเล็กๆ สำหรับสัปดาห์หน้ากันดีกว่า" / "ถ้าเริ่มเปลี่ยนแค่ 1 อย่างในสัปดาห์หน้า คุณอยากเริ่มจากด้านไหนดีครับ?" / "สัปดาห์หน้ามีวันไหนที่คุณคิดว่าจะมีตารางเรียน/ทำงานที่แน่น หรือยุ่งเป็นพิเศษบ้างไหมครับ?"
- บันทึกสำเร็จ: "บันทึกเป้าหมาย "{title}" เรียบร้อยแล้วครับ" + "เป้าหมายนี้จะเริ่มมีผลในสัปดาห์หน้าทันที เปิดดูและติ๊กความคืบหน้าได้ในหน้า "เป้าหมาย" ครับ"

**a11y & interaction**

- ✅ `<h1>` เดียวมองเห็น · ผ่าน `expectUsablePage(page, "โค้ช")`
- ✅ รายการข้อความมี `role="log"` `aria-live="polite"` `aria-label="บทสนทนากับโค้ช"`
- ✅ textarea มี `aria-label="พิมพ์ข้อความถึงโค้ช"` · ปุ่มส่งมี `aria-label="ส่งข้อความ"`
- ✅ ปุ่ม toggle ใน guided flow มี `aria-pressed` ทุกอัน
- ✅ ทุกปุ่ม `min-h-11` · ปุ่มการ์ดเป้าหมายที่เขียนเองด้วย `<button>` ก๊อป focus ring มาครบ
- 🔴 **`<p className="text-[11px]">คำถามแนะนำ:</p>`** [chat-client.tsx:739](../src/components/coach/chat-client.tsx#L739) เป็น **ข้อความไทย 11px** ขัด DESIGN.md ข้อ 6 และ**ต่ำกว่าเกณฑ์ `expectNoTinyThai` ที่ตัดที่ 11.9px** — ที่ยังไม่แดงเพราะบล็อกนี้โผล่เฉพาะบัญชีที่ไม่มีประวัติแชทและไม่มี opener ซึ่งบัญชี demo ไม่เข้าเงื่อนไข · ตัวนับ `{n}/500` ก็ `text-[11px]` แต่เป็นตัวเลขล้วน = อยู่ในข้อยกเว้น
- ⚠️ `PendingReply` ใส่ `aria-label="โค้ชกำลังคิด"` บน `<div>` เปล่าที่ไม่มี role — ตามสเปกจะไม่ถูก expose
- ⚠️ textarea ใช้ `text-base … md:text-sm` — เป็นการใช้ `md:` ซึ่ง DESIGN.md บอกให้เลี่ยง
- ℹ️ `loading.tsx` ใช้ `17.5rem` ขณะที่หน้าจริงใช้ `17.75rem` + หัก safe-area — skeleton สูงกว่าของจริงเล็กน้อย

**ทำไมถึงเป็นแบบนี้**

- **ไม่ใช้ PageContainer / กว้าง 46rem / โครง 3 ชั้น** — DESIGN.md ระบุเป็นข้อยกเว้นที่ตั้งใจ: "แชทเป็นบทสนทนา ไม่ใช่ฟอร์ม · ให้ข้อความเลื่อนในกล่อง input ปักล่าง (โครง 3 ชั้นแบบ LINE/ChatGPT)"
- **โค้ชไม่มีพื้นฟอง มี avatar + ชื่อ** — DESIGN.md: "ตัวตนโค้ชชัด ตามโจทย์ Feature 4"
- **แยก variant แทน boolean prop** — [F4-01](../.scratch/f4-coach/issues/01-chat-ui-history.md): "ห้ามรวมเป็นคอมโพเนนต์เดียวแล้วสลับด้วย flag"
- **ปุ่มลองใหม่เรียก `retryCoachReply()`** — DESIGN.md: "ไม่งั้นประวัติจะมีข้อความผู้ใช้ซ้ำ 2 อัน"
- **เขียน markdown renderer เอง ไม่ลง library** — [F4-06](../.scratch/f4-coach/issues/06-markdown-bubbles.md) เลือกทางที่ "ไม่ลง lib ไม่แตะ prompt" เพราะแตะ `COACH_SYSTEM_PROMPT` จะทำให้หลักฐาน safety ทั้งกองเป็นโมฆะและกินโควตา Gemini ทั้งวัน
- **โค้ชทักก่อนด้วยข้อมูลจริง** — "ช่องแชทเปล่า + จุดกระพริบ = ภาพจำของ AI ทั่วโลก" และ "โยนภาระคิดคำถามให้ผู้ใช้ ทั้งที่โจทย์ Feature 4 บอกว่าหัวใจคือคำถามที่โค้ชถาม" · ตัวเลข/วันคำนวณในโค้ด ไม่ให้ LLM คิด ตามกฎเหล็กใน AGENTS.md
- **ล้างประวัติแล้วโควตากลับมาเต็ม** — คอมเมนต์ในโค้ด ("ลบแถวออก = `countMessagesToday()` กลับไปนับได้ใหม่") และ [F4-05](../.scratch/f4-coach/issues/05-delete-history.md) ที่แยกเป็น INFRA-20 — **คือรูที่รู้ตัว ไม่ใช่บั๊กที่หลุด**

---

## `/goals` — เป้าหมายสัปดาห์นี้

| | |
| --- | --- |
| ไฟล์ | [page.tsx](../src/app/(app)/goals/page.tsx) · [goal-suggestion-card.tsx](../src/components/goals/goal-suggestion-card.tsx) · [goal-progress-card.tsx](../src/components/goals/goal-progress-card.tsx) |
| PageContainer | `width="content"` (1024px) — ตรงตาม DESIGN.md: หน้าดูข้อมูลใช้ content |
| h1 | "เป้าหมายสัปดาห์นี้" — **มองเห็น** พร้อมไอคอน `Target` |
| loading.tsx | มี → `TextPageSkeleton` (การ์ดข้อความ 3 ใบ) · ⚠️ **ไม่ตรงทรงหน้าจริง** ซึ่งเป็นการ์ดขอเป้าหมาย + ตารางติ๊ก 7 ช่อง |
| Suspense | ครอบ `GoalSuggestionCard` ด้วย `CardSkeleton rows={2}` · ⚠️ **แต่การ์ดนี้เป็น `"use client"` ที่ไม่ await อะไรของตัวเอง** — ข้อมูล await ที่ระดับหน้าไปแล้ว จึงไม่มีอะไรถูก defer จริง fallback แทบไม่มีโอกาสแสดง · `GoalProgressCard` ไม่ถูกครอบเลย |

**โครงหน้า**

1. **หัวเรื่อง** — h1 + "ตั้งเป้าหมายย่อยเพื่อความต่อเนื่องและคอยติ๊กบันทึกทุก ๆ วัน"
2. **บล็อกคำแนะนำ** `GoalSuggestionCard` — เปลี่ยนรูปร่างตามสถานะ
3. **"เป้าหมายที่กำลังทำ"** — `<h3 className="text-sm font-semibold">` แสดงเมื่อ `goals.length > 0` ตามด้วยการ์ดเรียงลงมา
4. **ลิงก์ "ดูสรุปสัปดาห์"** ไป `/reflection` — `<Link>` ที่แต่งด้วย `buttonVariants({variant:"ghost", className:"w-full"})` จึงได้ `h-11` ตรงกฎ "Link ที่แต่งให้ดูเหมือนปุ่ม ก็ต้อง 44px"

**`lg:` เปลี่ยนอะไร** — น้อยมาก: ความกว้างขยายถึง 1024px, h1 เป็น `text-2xl`, และปุ่มคู่ "ขอใหม่ / รับเป้าหมาย" เรียงเป็น 2 คอลัมน์ · **ตารางติ๊ก 7 วันเป็น `grid-cols-7` ทุกจอ ไม่เปลี่ยนที่ lg**

**State ที่รองรับ**

| State | เงื่อนไข | ผู้ใช้เห็นอะไร | โค้ด |
| --- | --- | --- | --- |
| ยังไม่มีเป้า (ว่าง) | ไม่มีทั้ง goal และ suggestion | การ์ดเส้นประ `border-dashed border-primary/30` + ไอคอน `Zap` + "ยังไม่มีเป้าหมายสัปดาห์นี้" + ปุ่ม "ขอคำแนะนำเป้าหมาย" | [goal-suggestion-card.tsx:59](../src/components/goals/goal-suggestion-card.tsx#L59) |
| กำลังขอคำแนะนำ (AI) | `isPending` | ปุ่มเป็น `Loader2` + "กำลังประมวลผล…" และบรรทัดใต้ปุ่ม "ใช้เวลาราว 10 วินาที" | [goal-suggestion-card.tsx:74](../src/components/goals/goal-suggestion-card.tsx#L74) |
| มีข้อเสนอให้เลือก | `suggestions.length > 0` | การ์ด `border-primary/20` "คำแนะนำเป้าหมายสัปดาห์นี้" · ปุ่ม "ข้อที่ 1 / ข้อที่ 2" · "สถานการณ์: {label}" · กล่องข้อความ + "แก้ไขข้อความ" · ปุ่ม "ขอใหม่" / "รับเป้าหมาย" | [goal-suggestion-card.tsx:118](../src/components/goals/goal-suggestion-card.tsx#L118) |
| โหมดแก้ข้อความ | กด "แก้ไขข้อความ" | `Input` (`maxLength=80`) + ตัวนับ "{n}/80 ตัวอักษร" + ปุ่ม "เสร็จแก้ไข" | [goal-suggestion-card.tsx:172](../src/components/goals/goal-suggestion-card.tsx#L172) |
| มีเป้าอยู่แล้ว (ขอเพิ่ม) | มี goal แต่ยังไม่มี suggestion | ปุ่ม outline เต็มกว้าง "ขอคำแนะนำเป้าหมายเพิ่มเติม" | [goal-suggestion-card.tsx:92](../src/components/goals/goal-suggestion-card.tsx#L92) |
| มีเป้าอยู่ (การ์ดหลัก) | `status === "active"` และ `week_start` = จันทร์สัปดาห์ปัจจุบัน | ชื่อเป้า · "บริบท: {สถานการณ์}" หรือ "เป้าหมายทั่วไป" · ตารางติ๊ก 7 วัน · บรรทัดสรุป · ปุ่มปิดงาน 2 อัน | [goal-progress-card.tsx:61](../src/components/goals/goal-progress-card.tsx#L61) |
| ติ๊กความคืบหน้า | กดช่องวัน | optimistic toggle ทันที · ถ้า server พลาดจะย้อนค่ากลับ + โชว์ error | [goal-progress-card.tsx:36](../src/components/goals/goal-progress-card.tsx#L36) |
| วันในอนาคต | `dateStr > today()` | ปุ่ม `disabled` + `border-dashed text-muted-foreground` (กดไม่ได้ แต่ไม่ใช่สีเตือน) | [goal-progress-card.tsx:102](../src/components/goals/goal-progress-card.tsx#L102) |
| ทำสำเร็จ | กด "ทำเป้านี้สำเร็จ" | `router.refresh()` แล้ว **การ์ดหายไปจากหน้า** · ⚠️ **ไม่มีส่วน "เป้าที่ทำสำเร็จแล้ว" — ไม่พบในโค้ด** | [queries.ts:18](../src/lib/goals/queries.ts#L18) |
| ยกเลิกเป้า | status `dropped` | การ์ดหายไปเช่นกัน · ปุ่มเป็น `ghost text-muted-foreground` **ไม่ใช่ destructive** | [goal-progress-card.tsx:116](../src/components/goals/goal-progress-card.tsx#L116) |
| หมดสัปดาห์ | ข้ามวันจันทร์ | เป้าของสัปดาห์ก่อนหายจากหน้าเอง · ⚠️ **ไม่มีข้อความอธิบายว่าเป้าเก่าไปไหน** | [week.ts:5](../src/lib/goals/week.ts#L5) |
| ยังไม่มีบันทึกให้ AI ดู | `getCheckins(14).length === 0` | "ยังไม่มีบันทึกให้ดู — ลองเช็คอินสัก 2–3 วันก่อน แล้วค่อยกลับมาขอคำแนะนำ" | [actions.ts:70](../src/lib/goals/actions.ts#L70) |
| เป้าเต็มโควตา | มี active ครบ 2 | "สัปดาห์นี้มีเป้าหมายอยู่ 2 ข้อแล้ว — จบข้อเดิมก่อนค่อยเพิ่มใหม่ จะได้ไม่หนักเกินไป" | [actions.ts:99](../src/lib/goals/actions.ts#L99) |

**การ์ดแนะนำเป้าจาก AI แสดงเมื่อไหร่**

- **ไม่แสดงอัตโนมัติ** — ต้องกดปุ่มก่อนเสมอ
- ข้อเสนอ **อยู่แค่ใน state ไม่ลง DB** จนกว่าจะกด "รับเป้าหมาย" — [F5-02](../.scratch/f5-micro-goals/issues/02-goals-ui.md): "ข้อเสนอไม่ลง DB จนกว่าจะกด "รับ" (refresh แล้วหายคือถูกแล้ว)"
- อีกทางที่ได้เป้าคือ **ผ่าน guided flow ในหน้า `/coach`** ซึ่งเรียก `recommendGoals(context)` พร้อมด้าน/วันยุ่ง/ข้อจำกัด แล้ว `acceptGoal()` ตรง ๆ

**Copy ที่ผู้ใช้เห็น**

- "เป้าหมายสัปดาห์นี้" / "ตั้งเป้าหมายย่อยเพื่อความต่อเนื่องและคอยติ๊กบันทึกทุก ๆ วัน"
- ว่าง: "ยังไม่มีเป้าหมายสัปดาห์นี้" / "ขอคำแนะนำแผนงานประจำสัปดาห์จาก AI เพื่อเริ่มพัฒนาสุขภาพของคุณ"
- ความคืบหน้า: "ความคืบหน้าสัปดาห์นี้" · 0 วัน → **"ยังไม่ได้ติ๊กวันไหน — เริ่มวันนี้ได้เลย"** · 7 วัน → **"ทำได้ครบทุกวันเลยสัปดาห์นี้"** · อื่น ๆ → "ทำได้แล้ว {N} วันในสัปดาห์นี้"
- ปุ่มปิดงาน: "สัปดาห์นี้ไม่เหมาะ ไว้ลองใหม่" · "ทำเป้านี้สำเร็จ"
- ป้ายสถานการณ์: "มีเรียนหรือทำงานเช้า" · "มีเดดไลน์" · "นั่งหน้าจอนาน" · "เดินทางไกล" · "นอนดึกเพราะมือถือ" · "ไม่มีเวลาออกกำลังกาย"

**a11y & interaction**

- ✅ `<h1>` เดียวมองเห็น · ช่องติ๊กวันสูง `min-h-11` มี `aria-pressed` และ focus ring เขียนเอง + `active:scale-95`
- ✅ กล่อง error ทั้ง 2 การ์ดมี `role="alert"`
- ✅ ตัวอักษรไทย "จ. อ. พ. พฤ. ศ. ส. อา." เป็น `text-xs` ผ่านเกณฑ์ ≥12px
- ⚠️ **`aria-label={dateStr}` ของช่องติ๊กเป็น ISO ดิบ** เช่น "2026-07-22" ทั้งที่โปรเจกต์มี `formatThaiDate()` อยู่แล้ว
- ⚠️ ปุ่ม "ข้อที่ 1 / ข้อที่ 2" **ไม่มี `aria-pressed`** ต่างจากการ์ดตัวเลือกใน guided flow
- ⚠️ `<h3>` "เป้าหมายที่กำลังทำ" **ข้ามระดับจาก h1 → h3** (ไม่มี h2 ในหน้า)

**ทำไมถึงเป็นแบบนี้**

- **ภาษาปุ่มยกเลิกไม่ตำหนิ** — [F5-02](../.scratch/f5-micro-goals/issues/02-goals-ui.md) เขียนเป็นงานเลย: "ภาษา dropped ต้องไม่ตำหนิ ("สัปดาห์นี้ไม่เหมาะ ไว้ลองใหม่")" · สอดคล้องกับกฎสี DESIGN.md — ปุ่มนี้จึงเป็น `ghost` ไม่ใช่ `destructive`
- **จำกัด 2 เป้าต่อสัปดาห์** — `MAX_ACTIVE_GOALS = 2` พร้อมเหตุผลอยู่ในข้อความ error เอง ("จะได้ไม่หนักเกินไป")
- **การ์ด goal ปัจจุบันโผล่บน dashboard ด้วย** ([current-goal-card.tsx](../src/components/goals/current-goal-card.tsx) ไม่ได้ถูกใช้ในหน้า `/goals` เลย) — ข้อกำหนดใน [F5-02](../.scratch/f5-micro-goals/issues/02-goals-ui.md)
- **สัปดาห์เริ่มวันจันทร์** — `weekStart()` คำนวณ `(weekday + 6) % 7` · ⚠️ ไม่พบเอกสารอธิบายเหตุผลของการเลือกวันจันทร์
# หน้านอกแอป — ทางเข้า ตั้งค่า และหน้าพัง

## `/` — หน้าแรก (landing)

| | |
| --- | --- |
| ไฟล์ | [page.tsx](../src/app/page.tsx) |
| PageContainer | ไม่ใช้ — เขียน `<main className="flex min-h-dvh flex-col items-center p-3 text-center xs:p-4">` เอง เพราะอยู่นอกกลุ่ม `(app)` จึงไม่มี layout ที่ให้ `<main>` มาให้ |
| h1 | "Cadence" — **มองเห็น** พร้อม `BrandMark` `text-4xl font-bold tracking-tight` |
| loading.tsx | **ไม่มี** — ไม่พบไฟล์ `src/app/loading.tsx` |
| Suspense | ไม่มี |

**โครงหน้า**

1. wrapper `my-auto … gap-8 py-8` — ดัน hero ให้อยู่กลางจอแนวตั้ง
2. h1 โลโก้ + "Cadence" → บรรทัด `AI Personal Health Coach` (`uppercase tracking-widest`) → ย่อหน้าอธิบาย `max-w-md`
3. แถวป้าย 3 เสา — `<ul>` pill `rounded-full border bg-card` วนจาก `PILLAR_ORDER` ไอคอน Lucide สีจาก `PILLAR_COLORS` (`--chart-2/1/3`)
4. CTA คอลัมน์เดียว `max-w-xs` เท่ากันทั้งคู่: "เข้าสู่ระบบ" (primary) บน / "สมัครสมาชิก" (outline) ล่าง
5. `SafetyNotice` นอก wrapper `my-auto` จึงถูกดันไปชิดล่างของ `min-h-dvh`

**ไม่มี `lg:` เลยทั้งหน้า** — ต่างกันแค่ `xs:` (375px) ที่ขยาย padding จาก 12px เป็น 16px

**State ที่รองรับ**

| State | เงื่อนไข | ผู้ใช้เห็นอะไร | โค้ด |
| --- | --- | --- | --- |
| ปกติ (ยังไม่ล็อกอิน) | `getUser()` คืน `null` | hero + CTA + safety notice | [page.tsx:12-16](../src/app/page.tsx#L12) |
| ล็อกอินอยู่แล้ว | มี `user` | **ไม่เห็นหน้านี้เลย** — `redirect("/checkin")` ทันทีฝั่ง server | [page.tsx:16](../src/app/page.tsx#L16) |

**Copy ที่ผู้ใช้เห็น**

- "Cadence" · "AI Personal Health Coach"
- "ผู้ช่วยดูแลสุขภาพประจำวันสำหรับนักศึกษาและคนเริ่มทำงาน — เห็น pattern การกิน การนอน การเคลื่อนไหว แล้วเริ่มจากก้าวเล็ก ๆ ที่ทำได้จริง"
- ป้าย: "การกิน" · "การนอน" · "การเคลื่อนไหว" · ปุ่ม: "เข้าสู่ระบบ" · "สมัครสมาชิก"

**a11y & interaction**

- h1 ตัวเดียวมองเห็นจริง · `BrandMark` เป็น `aria-hidden`
- CTA เป็น `<Link>` ที่สวม `buttonVariants()` → 44px · focus ring มาจาก `buttonVariants`
- ป้าย 3 เสาเป็น `<li>` ไม่ใช่ปุ่ม — กดไม่ได้ ไม่ต้องการ 44px
- ⚠️ ไม่มี `sr-only` label สำหรับกลุ่มป้าย 3 เสา

**ทำไมถึงเป็นแบบนี้**

- ปุ่มเรียงแนวตั้ง + safety notice ปักล่างสุด มาจาก [F0-04](../.scratch/f0-account-onboarding/issues/04-landing-cta-github.md) — เดิมตั้งใจใส่ลิงก์ GitHub ล่างสุด PM เปลี่ยนใจตัดออกแล้วให้ safety notice ไปอยู่แทน
- DESIGN.md บอกว่า "เราไม่มี landing page ไม่มี hero" — หน้านี้จึงเป็นข้อยกเว้นที่จงใจให้บางที่สุด และเด้งเข้า `/checkin` ทันทีถ้าล็อกอินแล้ว

---

## `/login` — เข้าสู่ระบบ

| | |
| --- | --- |
| ไฟล์ | [page.tsx](../src/app/(auth)/login/page.tsx) · shell: [layout.tsx](../src/app/(auth)/layout.tsx) · [login-form.tsx](../src/components/auth/login-form.tsx) |
| PageContainer | ไม่ใช้ — `(auth)/layout.tsx` ให้ `<main className="flex min-h-dvh flex-col items-center justify-center gap-5 p-3 xs:p-4">` + กล่อง `w-full max-w-sm` |
| h1 | "เข้าสู่ระบบ" — **มองเห็น** แต่ ⚠️ **ซ้อนอยู่ใน `CardTitle`** จึงได้สไตล์ `text-base font-medium` ของการ์ด **ไม่ใช่ `text-xl` ตามสเกล DESIGN.md** |
| loading.tsx | **ไม่มี** ทั้งใน `(auth)/` และในหน้า |
| Suspense | ไม่มี |
| metadata | `title: "เข้าสู่ระบบ"` → "เข้าสู่ระบบ · Cadence" |

**โครงหน้า** — Card กลางจอ `max-w-sm` (384px) เท่ากันทุกจอ **ไม่มี `lg:` ใด ๆ ในสายนี้**

1. CardHeader: h1 + "Cadence — ผู้ช่วยดูแลสุขภาพประจำวัน"
2. CardContent `space-y-4`: แถบยืนยันเมื่อ `?deleted=1` (ลบบัญชีสำเร็จ) → แถบ error OAuth (เมื่อ `?error=oauth`) → ปุ่ม Google เต็มกว้าง → เส้นคั่น "หรือ" → ฟอร์มอีเมล/รหัสผ่าน → ปุ่ม submit → ลิงก์ไป `/register`
   > **ไม่มีลิงก์ "ลืมรหัสผ่าน?"** — ถอดออกเมื่อ 25 ก.ค. (ดูหัวข้อ [หน้ากู้รหัสผ่าน](#หน้ากู้รหัสผ่าน-เพิ่ม-24-กค--ยังไม่เปิดใช้))
3. `SafetyNotice className="max-w-sm"` ใต้การ์ด (อยู่ใน layout ใช้ร่วมกับ `/register`)

**State ที่รองรับ**

| State | เงื่อนไข | ผู้ใช้เห็นอะไร | โค้ด |
| --- | --- | --- | --- |
| กำลังส่ง | `pending` จาก `useActionState` | ปุ่มขึ้น "กำลังเข้าสู่ระบบ…" + `disabled` | [login-form.tsx:32-34](../src/components/auth/login-form.tsx#L32) |
| กรอกไม่ครบ | อีเมลหรือรหัสผ่านว่าง (เช็คฝั่ง server) | "กรอกอีเมลและรหัสผ่านให้ครบ" | [actions.ts:27-29](../src/lib/auth/actions.ts#L27) |
| รหัสผ่านผิด | `signInWithPassword` error | "อีเมลหรือรหัสผ่านไม่ถูกต้อง" + **โฟกัสเด้งกลับช่องอีเมล** | [login-form.tsx:17-19](../src/components/auth/login-form.tsx#L17) |
| OAuth ล้มเหลว | `?error=oauth` | "เข้าสู่ระบบด้วย Google ไม่สำเร็จ ลองใหม่อีกครั้ง" | [page.tsx:25-27](../src/app/(auth)/login/page.tsx#L25) |
| สำเร็จ | มี session | `redirect("/")` ถ้า onboard แล้ว มิฉะนั้น `/onboarding` | [actions.ts:37-40](../src/lib/auth/actions.ts#L37) |
| หลังลบบัญชี | ถูกส่งมาที่ `/login?deleted=1` | ⚠️ **ไม่มีข้อความใด ๆ** — หน้านี้อ่านเฉพาะ `error` ไม่อ่าน `deleted` | [actions.ts:54](../src/lib/account/actions.ts#L54) |

**Copy ที่ผู้ใช้เห็น**

- "เข้าสู่ระบบ" · "Cadence — ผู้ช่วยดูแลสุขภาพประจำวัน" · "ดำเนินการต่อด้วย Google" · "หรือ" · "อีเมล" · "รหัสผ่าน" · ปุ่ม "เข้าสู่ระบบ" / "กำลังเข้าสู่ระบบ…" · "ยังไม่มีบัญชี? สมัครสมาชิก"

**a11y & interaction**

- ข้อความ error ทุกแบบผ่าน `AuthMessage` ซึ่งมี `role="alert"` — **มี e2e คุมว่าต้องเป็น `role=alert` และไม่บอกว่าช่องไหนผิด**
- `Label htmlFor="email"` ผูกกับ `Input id="email"` ตรงกัน · `autoComplete="email"` / `"current-password"` ครบ
- **ปุ่มดู/ซ่อนรหัสผ่าน: มี** — `size-11` `aria-label` สลับ "แสดงรหัสผ่าน" ↔ "ซ่อนรหัสผ่าน" + `aria-pressed` · มี e2e คุมว่าสลับ `type` จริง
- Input สูง `h-11` · ลิงก์ "สมัครสมาชิก" ใช้ `inline-flex min-h-11`
- โลโก้ Google เป็น `<svg aria-hidden>` — ข้อความปุ่มอ่านออกได้เอง

**ทำไมถึงเป็นแบบนี้**

- มี 2 ทางเข้าเพราะ [ADR-0005](adr/0005-auth-google-oauth-plus-password.md): Google = low-burden กดปุ่มเดียว · **รหัสผ่านคงไว้เพราะ demo/seed account สร้างด้วย password ไม่ใช่ Google จริง** และเป็น fallback เผื่อ OAuth ล่มวัน pitch (consent screen ยังไม่ publish → กรรมการนอกทีมอาจล็อกอิน Google ไม่ได้)
- error รหัสผ่านผิดใช้ข้อความรวม ไม่แยกว่าอีเมลไม่มีอยู่ — e2e ระบุเจตนานี้ไว้ในชื่อเทสต์

---

## `/register` — สมัครสมาชิก

โครงเดียวกับ `/login` เป๊ะ ๆ **ต่างกัน 4 จุด**:

1. CardDescription เป็น "เริ่มดูแลสุขภาพประจำวันกับ Cadence"
2. `GoogleButton from="/register"` → ถ้า OAuth พังจะเด้งกลับ `/register?error=oauth`
3. `PasswordField` ส่ง `minLength={6}` + `hint="อย่างน้อย 6 ตัวอักษร"`
4. รองรับ state เพิ่ม 1 แบบ: **notice** (ต้องยืนยันอีเมล) ซึ่ง `/login` ไม่มี

| State | เงื่อนไข | ผู้ใช้เห็นอะไร | โค้ด |
| --- | --- | --- | --- |
| รหัสผ่านสั้น | `password.length < 6` (เช็คซ้ำฝั่ง server) | "รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร" | [actions.ts:48-50](../src/lib/auth/actions.ts#L48) |
| อีเมลซ้ำ | error ของ Supabase เข้า regex `already registered\|already exists` | "อีเมลนี้ถูกใช้สมัครแล้ว ลองเข้าสู่ระบบแทน" | [actions.ts:18-23](../src/lib/auth/actions.ts#L18) |
| error อื่น | error อื่นของ `signUp` | "สมัครไม่สำเร็จ ลองใหม่อีกครั้ง" | [actions.ts:22](../src/lib/auth/actions.ts#L22) |
| **ต้องยืนยันอีเมล** | `signUp` สำเร็จแต่ไม่ได้ session | กล่อง**โทน primary ไม่ใช่แดง** ไอคอน `MailCheck`: "สมัครสำเร็จแล้ว — เราส่งลิงก์ยืนยันไปที่อีเมลของคุณ กดลิงก์นั้นแล้วกลับมาเข้าสู่ระบบ" | [auth-message.tsx:14-16](../src/components/auth/auth-message.tsx#L14) |
| สำเร็จทันที | ได้ session กลับมาเลย | `redirect("/onboarding")` | [actions.ts:64-65](../src/lib/auth/actions.ts#L64) |

**a11y** — เหมือน `/login` ทุกข้อ ต่างแค่ `autoComplete="new-password"` · กล่อง notice ใช้ `role="alert"` เหมือนกล่อง error (component เดียวกัน แยกแค่ `tone`) สอดคล้องกับกฎ "ห้าม boolean prop คุมพฤติกรรม"

---

## `/onboarding` — ตั้งค่าเริ่มต้น

| | |
| --- | --- |
| ไฟล์ | [page.tsx](../src/app/onboarding/page.tsx) · [onboarding-form.tsx](../src/components/onboarding/onboarding-form.tsx) |
| PageContainer | ไม่ใช้ — ฟอร์มเขียน `<main className="flex min-h-dvh items-center justify-center p-3 xs:p-4">` เองแล้วครอบ `<Card className="w-full max-w-md">` |
| h1 | "ตั้งค่าเริ่มต้น Cadence" — **`sr-only`** เพราะหัวข้อที่มองเห็นอยู่ใน `CardTitle` แล้ว ตามกฎ DESIGN.md |
| loading.tsx | มี — **skeleton รูปทรงตรงกับการ์ดจริง** (หัวข้อ + คำอธิบาย + แถบ progress + พื้นที่เนื้อหา `min-h-54` สูงเท่าของจริง + ตัวเลือก 2 แถว + ปุ่ม) |
| Suspense | ไม่มี |

**โครงหน้า**

1. การ์ดกลางจอ `max-w-md` (448px) — **ไม่มี `lg:` เลย** เดสก์ท็อปได้การ์ดขนาดเดิม
2. CardHeader: "ตั้งค่าเริ่มต้น" + "ขั้นที่ N จาก 5 · ใช้เวลาไม่ถึง 1 นาที" + แถบ progress `role="progressbar"` กว้างตามสัดส่วน `(step+1)/5`
3. พื้นที่คำถาม `min-h-54` — **ตั้งความสูงขั้นต่ำไว้ให้การ์ดไม่กระตุกเวลาสลับขั้น**
4. บรรทัด hint/error → แถวปุ่ม "ย้อนกลับ" + "ถัดไป" หรือ "รับทราบและเริ่มใช้งาน"

**5 ขั้น (client-side ทั้งหมด ไม่เปลี่ยน URL)**

| ขั้น | คำถาม | ตัวเลือก | ข้ามได้? |
| --- | --- | --- | --- |
| 1 | "เรียกคุณว่าอะไรดี" + "ตอนนี้คุณเป็น" | input ชื่อเล่น (`maxLength` 30) + Chip: นักศึกษา / First jobber | **ไม่ได้** — บังคับทั้งชื่อและสถานะ |
| 2 | "วันไหนที่มักมีเรียนหรือทำงานช่วงเช้า" | Chip จ อ พ พฤ ศ ส อา (หลายอัน) | ได้ — "เลือกได้หลายวัน (ข้ามได้ถ้าไม่แน่ใจ)" |
| 3 | "ช่วงไหนที่งานมักหนักหรือมีเดดไลน์" | ช่วงสอบ / ส่งโปรเจกต์ / สิ้นเดือน / ทุกสัปดาห์ / ไม่แน่นอน | ได้ |
| 4 | "มีข้อจำกัดอะไรในการดูแลสุขภาพบ้าง" | ไม่ค่อยมีเวลา / ไม่มีสถานที่ / งบจำกัด / พักผ่อนไม่พอ / เดินทางนาน | ได้ |
| 5 | Safety disclaimer + checkbox รับทราบ | — | **ไม่ได้** |

**ขั้นที่ 5 — disclaimer (FR-0.3)**

ข้อความเต็มคำต่อคำ ในกล่อง `rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground`:

> Cadence เป็นผู้ช่วยดูแลสุขภาพประจำวัน (wellness coach) ไม่ใช่บริการทางการแพทย์ — ไม่วินิจฉัยโรค ไม่แนะนำยาหรืออาหารเสริม ไม่ให้แผนลดน้ำหนัก หากมีอาการผิดปกติหรือกังวลเรื่องสุขภาพ ควรปรึกษาแพทย์หรือผู้เชี่ยวชาญ

ข้อความข้าง checkbox:

> ฉันเข้าใจว่า Cadence เป็นผู้ช่วยดูแลสุขภาพทั่วไป ไม่ใช่คำแนะนำทางการแพทย์

**ปุ่มรับทราบเขียนว่า "รับทราบและเริ่มใช้งาน"** และ **ข้ามไม่ได้ด้วยกลไก 3 ชั้น**:

1. ปุ่ม `disabled={!accepted || pending}` — ไม่ติ๊ก checkbox กดไม่ได้
2. แถว `profiles` ถูกสร้างพร้อม `disclaimer_accepted_at` ในการเขียนครั้งเดียวกัน — **ไม่มีทางมีโปรไฟล์โดยไม่มีเวลารับทราบ**
3. `(app)/layout.tsx` เช็ค `hasCompletedOnboarding()` ทุกครั้ง ถ้าไม่มีเด้งกลับ — **พิมพ์ URL ตรงเข้าแอปไม่ได้**

**State ที่รองรับ**

| State | เงื่อนไข | ผู้ใช้เห็นอะไร | โค้ด |
| --- | --- | --- | --- |
| ปกติ | ล็อกอินแล้วแต่ยังไม่มีโปรไฟล์ | การ์ด 5 ขั้น · **ชื่อเล่นเติมมาให้ล่วงหน้า**จาก `full_name` → `name` → ส่วนหน้าอีเมล | [page.tsx:13-20](../src/app/onboarding/page.tsx#L13) |
| ยังไม่ล็อกอิน | `getCurrentUser()` null | `redirect("/login")` | [page.tsx:10](../src/app/onboarding/page.tsx#L10) |
| onboard แล้ว | มีแถว `profiles` | `redirect("/")` | [page.tsx:11](../src/app/onboarding/page.tsx#L11) |
| กรอกไม่ครบ (ขั้น 1) | กด "ถัดไป" ทั้งที่ยังไม่ครบ | บรรทัด **สีเขียว primary ไม่ใช่สีแดง**: "กรอกชื่อเล่นและเลือกสถานะก่อนไปต่อนะ" | [onboarding-form.tsx:197-199](../src/components/onboarding/onboarding-form.tsx#L197) |
| validation ฝั่ง server | `validateOnboarding` ไม่ผ่าน | `text-destructive` — "กรอกชื่อเล่นก่อน" / "ชื่อเล่นยาวเกิน 30 ตัวอักษร" / "เลือกสถานะก่อน" ฯลฯ | [types.ts:75-96](../src/lib/onboarding/types.ts#L75) |
| error จากเซิร์ฟเวอร์ | `upsert` ล้มเหลว | "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง" | [actions.ts:29-31](../src/lib/onboarding/actions.ts#L29) |

**a11y & interaction**

- h1 `sr-only` 1 อันตามกฎ · Chip ทุกตัว `min-h-11` + `aria-pressed` + focus ring + `active:scale-95`
- `Label htmlFor="displayName"` ผูกกับ input ตรงกัน — ⚠️ **แต่ label ของกลุ่ม Chip เป็น `<Label>` ลอย ๆ ไม่ได้ผูกด้วย `aria-labelledby` / `role="group"`**
- ⚠️ แถบ progress มี `role="progressbar"` + `aria-valuenow/min/max` **แต่ไม่มี `aria-label`**
- checkbox ขั้น 5: input จริงซ่อนด้วย `opacity-0` วาง `absolute inset-0` ในกล่อง `size-5` แล้วอยู่ใน `<label>` → คลิกข้อความติ๊กได้ และ Space ติ๊กได้ปกติ — ⚠️ **แต่ไม่พบสไตล์ focus ที่มองเห็น**

**ทำไมถึงเป็นแบบนี้**

- disclaimer + ปุ่มรับทราบเป็นข้อบังคับของ **FR-0.3** ซึ่ง [docs/04](04-requirements.md) ระบุว่า **ห้ามตัดแม้เวลาไม่พอ** เพราะเป็นเกณฑ์ให้คะแนน Safety โดยตรง · [docs/08](08-safety-privacy.md) เรียกสิ่งนี้ว่า "ชั้นการป้องกันที่ 1 (UI)" ของระบบ 3 ชั้น
- [F0-03](../.scratch/f0-account-onboarding/issues/03-disclaimer.md) บันทึกกติกา "profile row สร้างตอนรับทราบเท่านั้น" — เป็นเหตุผลที่ทั้งฟอร์มยิง DB ครั้งเดียวตอนจบ ไม่ใช่ save ทีละขั้น
- ขั้นที่ 3 (ช่วงงานหนัก) มาทีหลัง — [F0-02](../.scratch/f0-account-onboarding/issues/02-onboarding-profile.md) ระบุ 4 ขั้น ส่วน **FR-0.2** เพิ่ม `busy_periods` ทำให้ปัจจุบันเป็น 5 ขั้น
- ⚠️ **"แก้ไขข้อมูล onboarding ภายหลัง" ยังไม่มีในแอป** — [F0-02](../.scratch/f0-account-onboarding/issues/02-onboarding-profile.md) ติ๊กค้างไว้ว่าเลื่อนไป F7 และไม่พบ UI แก้โปรไฟล์ในหน้า settings

---

## `/settings/privacy` — ความเป็นส่วนตัว

| | |
| --- | --- |
| ไฟล์ | [page.tsx](../src/app/(app)/settings/privacy/page.tsx) · [delete-zone.tsx](../src/components/settings/delete-zone.tsx) |
| PageContainer | `width="content"` (≤1024px) แล้วบีบเนื้อหาด้านในอีกชั้นด้วย `mx-auto max-w-3xl space-y-6` |
| h1 | "ความเป็นส่วนตัว" — **มองเห็น** พร้อมไอคอน `Shield` ตรงตามสเกล |
| loading.tsx | มี → `TextPageSkeleton` (การ์ด **3 ใบ** ⚠️ **ทั้งที่หน้าจริงมี 7 ใบ**) |
| Suspense | ไม่มี — หน้านี้เป็น static server component ไม่ `await` ข้อมูลอะไรเลย |

**โครงหน้า** — **ไม่มี `lg:` ในตัวหน้าเลย** คอลัมน์เดียวเหมือนกันทุกจอ ต่างแค่ความกว้างสูงสุด 768px

1. หัวข้อ + "นโยบายความเป็นส่วนตัวและสิทธิ์ในการควบคุมข้อมูลของท่าน"
2. การ์ดสรุป (พื้น `bg-accent/20`) — ย่อหน้าเดียวตอบว่าเก็บอะไร ใช้ทำอะไร ไม่แชร์ให้ใคร
3. การ์ด **ประเภทข้อมูลที่จัดเก็บ** — ตาราง 3 คอลัมน์ 4 แถว มี `Badge` กำกับชนิด: `สุขภาพ` / `ส่วนบุคคล` / `บริบท` · ตารางห่อด้วย `overflow-x-auto` **ให้เลื่อนในตัวเอง ไม่ทำให้ทั้งหน้าเลื่อนแนวนอน**
4. การ์ด **ข้อมูลที่ไม่มีการจัดเก็บ (Data Minimization)** — `ul grid-cols-2`: น้ำหนัก / ส่วนสูง / BMI / แคลอรี / รูปถ่ายร่างกาย-อาหาร / ตำแหน่งที่อยู่
5. การ์ด **การป้องกันทางเทคนิค** — RLS / สิทธิ์การเข้าถึงของ AI / ความปลอดภัยระดับสากล
6. การ์ด **การระบุตัวตนและการรวมข้อมูล** — ไม่ anonymize เพราะต้องดึงบันทึกกลับมาให้เจ้าตัวดู / ไม่มี dashboard องค์กร
7. การ์ด **สิทธิ์การจัดการข้อมูล** — ปุ่มลิงก์เต็มกว้างไป `/checkin/history`
8. การ์ด **โซนอันตรายสูง** (`border-destructive/30`) — `DeleteZone`

**ผู้ใช้ทำอะไรได้จากหน้านี้**

| สิทธิ์ | ทำได้จริงตรงไหน |
| --- | --- |
| **ดู/แก้** ข้อมูลตัวเอง | ปุ่มลิงก์ "ดู แก้ไข หรือลบบันทึกของฉัน" → `/checkin/history` (หน้านี้เป็นทางผ่าน ไม่มีฟอร์มแก้เอง) |
| **ลบข้อมูลทั้งหมด** (เก็บบัญชี) | ปุ่ม "ลบข้อมูลทั้งหมด" ใน DeleteZone |
| **ลบบัญชีถาวร** | ปุ่ม "ลบบัญชีถาวร" ใน DeleteZone |
| แก้ไขโปรไฟล์ (ชื่อเล่น/สถานะ/ข้อจำกัด) | ⚠️ **ไม่มีในหน้านี้ และไม่พบในโค้ดที่อื่น** |

**โซนลบบัญชี — ยืนยัน 2 ชั้น** (ไม่ใช่ modal — เปลี่ยนเนื้อในการ์ดที่เดิม)

1. **ชั้นที่ 1** กดปุ่มเปิดโหมด → การ์ดสลับไปแสดงคำอธิบายผลลัพธ์ + ช่องพิมพ์ยืนยัน
2. **ชั้นที่ 2** ต้องพิมพ์วลีให้ตรงเป๊ะ ปุ่ม "ยืนยัน" ถึงจะกดได้ — วลีคือ **"ลบข้อมูลทั้งหมด"** และ **"ลบบัญชีถาวร"**

ข้อความเตือน คำต่อคำ:

- หัวการ์ด **"โซนอันตรายสูง"** / "การลบทำทันทีและกู้คืนไม่ได้ ต้องพิมพ์ยืนยันก่อนทุกครั้ง"
- โหมดลบข้อมูล: "ลบบันทึกทั้งหมด เป้าหมาย ประวัติแชท และผลวิเคราะห์ — บัญชียังอยู่ แต่ต้องเริ่มตั้งค่าใหม่ตั้งแต่ต้น"
- โหมดลบบัญชี: "ลบบัญชีและข้อมูลทั้งหมดอย่างถาวร กู้คืนไม่ได้ และจะออกจากระบบทันที"
- label ช่องยืนยัน: "พิมพ์ "ลบข้อมูลทั้งหมด" เพื่อยืนยัน" / "พิมพ์ "ลบบัญชีถาวร" เพื่อยืนยัน"

**State ที่รองรับ**

| State | เงื่อนไข | ผู้ใช้เห็นอะไร | โค้ด |
| --- | --- | --- | --- |
| เตรียมลบ | กดปุ่มลบ | คำอธิบายผล + ช่องพิมพ์ยืนยัน + "ยกเลิก" / "ยืนยัน" (ยืนยันยังกดไม่ได้) | [delete-zone.tsx:94-131](../src/components/settings/delete-zone.tsx#L94) |
| พิมพ์ยังไม่ตรง | `confirmText !== phrase` | ปุ่ม "ยืนยัน" จาง กดไม่ได้ | [delete-zone.tsx:126](../src/components/settings/delete-zone.tsx#L126) |
| กำลังลบ | `isPending` | `Loader2` + "กำลังลบ…" · ช่องกรอกและปุ่มยกเลิก disabled | [delete-zone.tsx:128-129](../src/components/settings/delete-zone.tsx#L128) |
| ลบข้อมูลสำเร็จ | `deleteAllData()` ok | `router.push("/onboarding")` — เพราะ `profiles` ถูกลบไปด้วย ต้องตั้งค่าใหม่ | [delete-zone.tsx:62](../src/components/settings/delete-zone.tsx#L62) |
| ลบบัญชีสำเร็จ | `deleteAccount()` ผ่าน | server sign out + `redirect("/login?deleted=1")` — ⚠️ **แต่หน้า login ไม่แสดงข้อความอะไรกับพารามิเตอร์นี้** | [actions.ts:52-54](../src/lib/account/actions.ts#L52) |
| ลบข้อมูลบางตารางพลาด | error จาก Supabase | "ลบข้อมูลไม่สำเร็จ (<ชื่อตาราง>) — ลองใหม่อีกครั้ง" | [actions.ts:23](../src/lib/account/actions.ts#L23) |
| **ไม่มี service role key** | env ไม่ถูกตั้ง | ข้อความยาวเชิงทีมงาน: "เครื่องนี้ไม่มี service role key จึงลบบัญชีไม่ได้ — เป็นเรื่องปกติบน dev (key อยู่กับ A คนเดียว) ไม่ใช่โค้ดคุณผิด · ปุ่ม "ลบข้อมูลทั้งหมด" เทสต์ได้ตามปกติ ส่วนขั้นนี้ A ตรวจบน production ให้" | [actions.ts:40-45](../src/lib/account/actions.ts#L40) |

**Copy สำคัญ** — ย่อหน้าสรุป: "Cadence เก็บบันทึกการกิน การนอน และการเคลื่อนไหวที่คุณกรอกเอง เพื่อแสดง pattern และให้คำแนะนำสำหรับคุณเท่านั้น ข้อมูลของคุณไม่ถูกแชร์ให้ผู้ใช้คนอื่นหรือบุคคลที่สาม คุณแก้ไขหรือลบข้อมูลทั้งหมดได้ทุกเมื่อจากหน้านี้ ระบบนี้เป็นผู้ช่วยดูแลสุขภาพทั่วไป ไม่ใช่บริการทางการแพทย์"

**a11y & interaction**

- h1 มองเห็น 1 อัน · e2e คุมหน้านี้ผ่าน `expectUsablePage`
- ตารางใช้ `<th>` จริงในหัวแถว และห่อ `overflow-x-auto` — หน้าไม่เลื่อนแนวนอน
- ช่องพิมพ์ยืนยันผูก label ด้วย `useId()` — INFRA รอบ F7-02 แก้จุดนี้ให้
- ⚠️ **กล่อง error ใน DeleteZone ไม่มี `role="alert"`** ต่างจาก `AuthMessage` ของหน้า auth — screen reader ไม่ถูกประกาศเมื่อลบพลาด
- ปุ่มลบใช้สี destructive ผ่าน token ทั้งหมด มี `dark:` variant กำกับ ไม่ hardcode

**ทำไมถึงเป็นแบบนี้**

- เนื้อหาทั้งหน้าเป็นการถอด [docs/08 Part 2](08-safety-privacy.md) ลงเป็น UI — ย่อหน้าสรุปคัดลอกคำต่อคำ
- **FR-7.2** บังคับว่าหน้า privacy ต้องอธิบายว่าเก็บอะไร ใช้อย่างไร + ปุ่มลบข้อมูล/ลบบัญชี และ [docs/04](04-requirements.md) ห้ามตัด FR-7.x
- การ์ด "การระบุตัวตนและการรวมข้อมูล" ถูก **เติมทีหลัง** เพราะตอน review พบว่าตอบโจทย์ข้อ 9 ได้แค่ 4/6 ([F7-01](../.scratch/f7-privacy/issues/01-privacy-page.md))
- คอลัมน์เดียว `max-w-3xl` มาจาก [INFRA-18](../.scratch/infra/issues/18-privacy-declutter.md) ที่**เลิก `lg:columns-2` (masonry) เพราะคอลัมน์เบี้ยวและช่องว่างล่างขวาโหว่**
- DeleteZone แยกเป็น client component เพื่อ **คืนหน้า privacy ให้เป็น server component** ([F7-02](../.scratch/f7-privacy/issues/02-delete-all.md))
- ลิงก์ไป `/checkin/history` ถูกล็อกเป็น contract ข้ามสาย ("URL คือ `/checkin/history` ใช้ตัวนี้เป๊ะ ๆ อย่าเดาเอง")

---

## หน้าพัง — error / not-found ทั้ง 4 ไฟล์

ทั้ง 4 ไฟล์ประกอบร่างจาก **component เดียวกัน** คือ [status-screen.tsx](../src/components/status-screen.tsx) ซึ่งให้:

- กล่องกลางจอ `min-h-[60dvh]` (**ไม่ใช่ `min-h-screen`** ตามกฎ DESIGN.md)
- วงกลมไอคอน `size-14` — `bg-destructive/10 text-destructive` เมื่อ `tone="error"` หรือ `bg-primary/10 text-primary` เมื่อ neutral
- **`<h1>` เป็นตัวหัวเรื่องของ StatusScreen เอง** — **ทุกหน้าพังจึงมี h1 ที่มองเห็นโดยอัตโนมัติ ไม่มีวันขาด**
- คำอธิบาย `text-sm text-muted-foreground` ใน `max-w-md` + แถวปุ่ม `flex-wrap justify-center`

### แยกกันยังไง (root vs (app))

| | ไฟล์ | ครอบอะไร | `<main>` | ปุ่ม |
| --- | --- | --- | --- | --- |
| error ทั่วไป | [error.tsx](../src/app/error.tsx) | `/`, `/login`, `/register`, `/onboarding` | **ห่อ `<main className="min-h-dvh">` เอง** | "ลองใหม่อีกครั้ง" (`reset()`) + "กลับหน้าแรก" |
| error ในแอป | [(app)/error.tsx](../src/app/(app)/error.tsx) | ทุกหน้าหลังล็อกอิน | **ไม่ห่อ** เพราะ layout มี `<main>` ให้แล้ว — **เมนูล่าง/sidebar + safety notice ยังอยู่ครบ** | "ลองใหม่อีกครั้ง" + "ไปหน้าภาพรวม" |
| 404 ทั่วไป | [not-found.tsx](../src/app/not-found.tsx) | URL ที่ไม่ match route ใดเลย | **ห่อเอง** | "กลับหน้าแรก" |
| 404 ในแอป | [(app)/not-found.tsx](../src/app/(app)/not-found.tsx) | `notFound()` ในกลุ่ม `(app)` — **จุดเดียวคือหน้าแก้บันทึกย้อนหลัง** | **ไม่ห่อ** | "ดูบันทึกย้อนหลัง" (primary) + "ไปหน้าภาพรวม" (outline) |

⚠️ **ไม่มี `global-error.tsx`** ในเรโป — error ที่เกิดใน root layout เองจึงตกไปที่หน้า default ของ Next ไม่ใช่ StatusScreen

⚠️ **ไม่มีการ log error ที่ไหนเลย** — ทั้งสองไฟล์รับ prop `error: Error` แต่ไม่ได้ใช้และไม่ได้ log (destructure เฉพาะ `reset`)

**Copy ที่ผู้ใช้เห็น (ครบทุกไฟล์)**

- [error.tsx](../src/app/error.tsx): "ระบบขัดข้องชั่วคราว" / "ไม่ใช่ความผิดของคุณ ลองใหม่อีกครั้ง หรือกลับไปหน้าแรกก่อนก็ได้"
- [(app)/error.tsx](../src/app/(app)/error.tsx): "ระบบขัดข้องชั่วคราว" / "ไม่ใช่ความผิดของคุณ และบันทึกที่เคยบันทึกไว้ยังอยู่ครบ ลองใหม่อีกครั้งได้เลย"
- [not-found.tsx](../src/app/not-found.tsx): "ไม่พบหน้าที่ต้องการ" / "ลิงก์นี้อาจเก่าไปแล้ว หรือพิมพ์ที่อยู่ไม่ตรง ลองกลับไปเริ่มใหม่จากหน้าแรกได้เลย"
- [(app)/not-found.tsx](../src/app/(app)/not-found.tsx): "ไม่พบบันทึกที่ต้องการ" / "บันทึกนี้อาจถูกลบไปแล้ว หรืออยู่นอกช่วง 30 วันที่ย้อนกลับไปแก้ไขได้"

**ทำไมถึงเป็นแบบนี้**

- โทน "ไม่ใช่ความผิดของคุณ" และ "บันทึกที่เคยบันทึกไว้ยังอยู่ครบ" สอดคล้องกับกติกาเนื้อหาใน [docs/08](08-safety-privacy.md) ที่กำหนดว่า "ภาษาไม่ตัดสิน ไม่ทำให้รู้สึกผิด" — เขียนไว้สำหรับ AI output แต่ทั้งแอปเดินตามโทนเดียวกัน
- แยก 2 ชั้นเพราะปลายทางที่มีประโยชน์ต่างกัน: คนที่ยังไม่ล็อกอินไปได้แค่หน้าแรก ส่วนคนที่อยู่ในแอปแล้วควรถูกส่งกลับเข้า dashboard/history **โดยไม่หลุดออกจากเมนู**
- ข้อความ 404 ในแอปพูดถึง "30 วัน" เพราะ trigger เดียวที่มีจริงคือหน้าแก้บันทึกย้อนหลังที่เช็ค `isWithinBackfillWindow`

---


> **อัปเดต 24 ก.ค. 2026 — หลัง UX/UI audit เต็มระบบ** · ลิสต์นี้เดิมมี 42 ข้อ ปิดไปแล้ว 22 ข้อในรอบเดียว
> `✅ ปิดแล้ว` = แก้ในโค้ดและผ่าน CI + e2e แล้ว · `⬜ ยังค้าง` = ยังเป็นอย่างที่เขียนไว้
> รายละเอียดว่าแก้อย่างไรดูได้จาก git log ของ branch `fix/ux-audit-polish`

## พบเอง (chrome กลาง)

1. ✅ **ปิดแล้ว — จำนวนปุ่มเมนู** — DESIGN.md เคยเขียน "เมนูล่าง 4 ปุ่ม" ทั้งที่โค้ดมี 5 · แก้เอกสารตามโค้ดแล้ว (เช็คอิน ภาพรวม เป้าหมาย โค้ช ตั้งค่า)
2. ⬜ **ยังค้าง — ขอบเขต SafetyNotice** — [docs/08-safety-privacy.md:15](08-safety-privacy.md#L15) เขียนว่าข้อความถาวรอยู่ "ใต้หน้า coach/dashboard" · โค้ดจริงแสดงใน 3 layout = แทบทุกหน้า (รวม landing และ login)

## พบจากสายเช็คอิน

3. ✅ **ปิดแล้ว — Breakpoint นอก `lg`** — `sm:`/`xl:` ถูกแทนด้วย `lg:` หมดแล้วใน `checkin-history` · `pattern-table` · `day-lines` (ดูข้อ 15, 21 ด้วย) · ที่เหลือมีแต่ใน shadcn primitive
4. ✅ **ปิดแล้ว — skeleton ความกว้างไม่ตรงหน้าจริง** — `FormSkeleton` ใช้ `width="content"` + คอลัมน์ฟอร์ม `max-w-md` + step rail ตรงกับหน้าจริงแล้ว
5. ✅ **ปิดแล้ว — skeleton รูปทรงไม่ตรงหน้าจริง** — เพิ่ม `HistorySkeleton` เป็น grid การ์ดแบ่งตามเดือน ตรงกับหน้าจริง
6. ⬜ **ยังค้าง — copy ปุ่มผิดบริบทในหน้า backfill** — ปุ่มสุดท้ายเขียน "บันทึกเช็คอินวันนี้" hardcode ในแกน `checkin-form.tsx` → หน้า `/checkin/edit/[date]` ที่กรอกย้อนหลังก็ยังขึ้นคำว่า "วันนี้"
7. ✅ **กลายเป็นของที่ตั้งใจแล้ว — `/checkin/edit/<วันที่ของวันนี้>` เข้าได้** — ยังไม่มี guard ข้ามเที่ยงคืนเหมือนเดิม **แต่ตอนนี้เป็นทางเข้าฟอร์มโดยตรง** สำหรับวันที่ `/checkin` แสดงหน้าสรุปแทน (ดูข้อ 43) · ใช้ตอนเดโมจับเวลาได้

## ช่องโหว่ a11y ที่พบ (สายเช็คอิน)

8. ✅ **ปิดแล้ว — ไม่มี `aria-live` และไม่ย้าย focus** — ข้อความ "เลือกสักอันก่อนไปต่อนะ" เป็น `role="alert"` · error ใช้ `<ErrorNotice>` ที่มี `role="alert"` ในตัว · `goForward()` ย้าย focus ไปชิปตัวแรกของช่องที่ขาดแล้ว
9. ✅ **ปิดแล้ว — กลุ่มชิปไม่ผูกกับคำถาม** — ทุกกลุ่มเป็น `role="group"` + `aria-labelledby` ชี้ไปที่ label และ `aria-describedby` ชี้ไปที่คำใบ้/ข้อความเตือน
10. ⬜ **ยังค้าง — nudge เป็น `<Link>` จัดสไตล์เอง** — [page.tsx:26](../src/app/(app)/checkin/page.tsx#L26) ไม่ได้ใช้ `buttonVariants()`/`min-h-11` ความสูงมาจาก padding + 2 บรรทัด

## พบจากสายภาพรวม + สรุปสัปดาห์

11. ✅ **ปิดแล้ว — `--chart-6` อยู่นอกช่วงที่เอกสารระบุ** — DESIGN.md ข้อ 4 อัปเดตเป็น `--chart-1` ถึง `--chart-6` พร้อมระบุความหมายครบทุกตัวแล้ว
12. ✅ **ปิดแล้ว — ใช้สี destructive กับข้อความชวนบันทึก** — เพิ่ม `<GentleNotice>` / `<ErrorNotice>` ([notice.tsx](../src/components/ui/notice.tsx)) แล้วย้าย **6 สถานะที่ไม่ใช่ความผิดผู้ใช้**ออกจากกล่องแดง: ข้อมูลไม่พอ (insight/reflection) · ยังไม่มีบันทึกให้แนะนำเป้า · ครบ 2 เป้าหมาย · โควตาแชทหมด · ข้ามเที่ยงคืน
13. ✅ **ปิดแล้ว — marker ปัจจัยรบกวนไม่มี focus ring** — เพิ่ม `focus-visible:ring-3` แล้ว · พร้อมกับอีก 3 จุดที่เป็นอาการเดียวกัน (แท็บกราฟ · ปุ่มช่วงเวลา · week picker)
14. ⬜ **ยังค้าง — สเปก reflection ไม่ตรงกับของที่ลงจริง** — [F6-01](../.scratch/f6-weekly-reflection/issues/01-generation.md) เขียนว่า generate อัตโนมัติ · โค้ดจริงต้องกดปุ่มเอง (จงใจเพื่อกันโควตา แต่ issue ไม่ได้อัปเดต)
15. ✅ **ปิดแล้ว — `day-lines.tsx` ใช้ `sm:`** — เปลี่ยนเป็น `lg:` แล้ว (รวมในข้อ 3)
16. ⬜ **ยังค้าง — `/reflection` ประกาศ `export const dynamic = "force-dynamic"`** โดยไม่มีคำอธิบาย [page.tsx](../src/app/(app)/reflection/page.tsx) — หมายเหตุ: `/goals` ก็ประกาศเหมือนกัน จึงไม่ใช่หน้าเดียวอีกต่อไป

## พบจากสายโค้ช + เป้าหมาย

17. ✅ **ปิดแล้ว — `text-[11px]` กับข้อความไทย** — "คำถามแนะนำ:" เป็น `text-xs` แล้ว · และเพิ่มด่าน e2e ที่**กดเข้า guided flow ก่อนแล้วค่อยกวาด** เพื่อปิดรูที่ทำให้จุดนี้รอดมาได้ (ด่านเดิมกวาดแค่ตอนเปิดหน้า)
18. ✅ **ปิดแล้ว — ข้อความโควตาหมดโผล่ในกล่องสีเตือนภัย** — `ChatResult` แยก `notice` ออกจาก `error` แล้ว · โควตาส่วนตัวและโควตา Gemini รวมของแอปเข้าโทน muted ทั้งคู่
19. ⬜ **ยังค้าง — `##` ยังไม่ถูกแปลง** — `FormattedMessage` แก้ `**` และ bullet แล้ว แต่ไม่ได้จัดการ `##` (ตรงกับ f4/06 ที่ยังค้างใน BOARD)
20. ⬜ **ยังค้าง — คอมเมนต์ในโค้ดไม่ตรงกับพฤติกรรม** — โค้ดเทียบ `text === GOAL_STARTER` เฉย ๆ → พิมพ์ข้อความนั้นเป๊ะ ๆ ก็เข้า flow ไม่ถึงโค้ช
21. ✅ **ปิดแล้ว — `md:` ในช่องกรอก** — ตัด `md:text-sm` ออกจาก `input` · `textarea` · textarea ของแชท → ทุกช่องเป็น 16px ทุกจอ (iPad เลิก zoom ตอน focus ไปด้วย)
22. ✅ **ปิดแล้ว — `aria-label` บน `<div>` เปล่า** — `PendingReply` เป็น `role="status"` + ข้อความ `sr-only` แล้ว
23. ✅ **ปิดแล้ว — Suspense ที่ไม่ได้ defer อะไรจริง** — เอา Suspense ที่ไม่ทำงานออกจาก `/goals` แล้ว (หน้ามี `loading.tsx` คุมอยู่แล้ว)
24. ✅ **ปิดแล้ว — `aria-label` เป็น ISO ดิบ** — ใช้ชื่อวัน + วันที่ไทยแล้ว
25. ✅ **ปิดแล้ว — ปุ่ม "ข้อที่ 1 / ข้อที่ 2"** — เปลี่ยนเป็นการ์ดตัวเลือกเต็มข้อความที่มี `aria-pressed` (แบบเดียวกับ guided flow) → เทียบสองข้อได้โดยไม่ต้องสลับแท็บ
26. ✅ **ปิดแล้ว — ลำดับหัวข้อข้าม h2** — แก้ทั้ง 3 จุด (`/goals` · `/reflection` · การ์ดขอเป้าหมาย) เป็น `<h2>` แล้ว
27. ⬜ **ค้างบางส่วน — skeleton ไม่ตรงทรง** — `/coach` แก้ความสูงให้ตรงแล้ว (`17.75rem` + safe-area) · **`/goals` ยังใช้ `TextPageSkeleton`** ที่ไม่ตรงกับการ์ดขอเป้า + ตารางติ๊ก 7 ช่อง
28. ✅ **ปิดแล้ว — เป้าที่ทำสำเร็จหายไปเงียบ ๆ** — กด "ทำเป้านี้สำเร็จ" แล้วขึ้นการ์ดสรุปผลพร้อมจำนวนวันที่ทำได้ก่อน · และเพิ่มส่วน "สัปดาห์ที่แล้ว" ([last-week-goals.tsx](../src/components/goals/last-week-goals.tsx)) ที่แสดงเป้าเก่าพร้อมผลลัพธ์แทนการหายไปเฉย ๆ

## พบจากสายทางเข้า + ตั้งค่า + หน้าพัง

29. ✅ **ปิดแล้ว — ลบบัญชีแล้วผู้ใช้ไม่ได้รับการยืนยันอะไรเลย** — หน้า login อ่าน `deleted=1` แล้วขึ้นข้อความยืนยัน · และการลบข้อมูล (ไม่ลบบัญชี) ก็มีการ์ดยืนยันก่อนพาไป onboarding
30. ⬜ **ยังค้าง — h1 ของ `/login` และ `/register` ผิดสเกล** — ซ้อนใน `CardTitle` จึงได้ `text-base font-medium` แทน `text-xl font-semibold lg:text-2xl` (หน้า `/forgot-password` กับ `/reset-password` ที่เพิ่มใหม่ใช้ทรงเดียวกัน จึงมีอาการเดียวกัน)
31. ⬜ **ยังค้าง — ไม่มีการ log error ที่ไหนเลย** — `error.tsx` ทั้งสองไฟล์ยัง destructure เฉพาะ `reset` · หมายเหตุ: server action มี `console.error` แล้วใน `generateInsight` · `generateReflection` · `deleteAllData`
32. ⬜ **ยังค้าง — ไม่มี `global-error.tsx`**
33. ⬜ **ยังค้าง — ไม่มี UI แก้โปรไฟล์เลยทั้งแอป** — ผู้ใช้แก้ชื่อเล่น/สถานะ/ข้อจำกัดไม่ได้หลัง onboarding
34. ⬜ **ยังค้าง — skeleton `/settings/privacy` ไม่ตรงทรง** — ใช้ `TextPageSkeleton` 3 การ์ด ทั้งที่หน้าจริงมี 7 การ์ด
35. ✅ **ปิดแล้ว — `DeleteZone` ไม่มี `role="alert"`** — ใช้ `<ErrorNotice>` ที่มี `role="alert"` แล้ว · พร้อมกันนั้นเพิ่มโฟกัสช่องยืนยันอัตโนมัติ · กด Escape ยกเลิกได้ · ถอด placeholder ที่บอกวลีคำตอบ · และลดปุ่ม "ลบบัญชีถาวร" จากปุ่มแฝดเป็นลิงก์ใต้เส้นคั่น
36. ✅ **ปิดแล้ว — onboarding progressbar ไม่มี `aria-label`**
37. ⬜ **ยังค้าง — onboarding checkbox รับทราบไม่มีสไตล์ focus ที่มองเห็น** — ยังมีแค่ `has-checked:` ไม่มี `has-focus-visible:` (เป็นด่านบังคับ FR-0.3 จึงควรเก็บ)
38. ⬜ **ยังค้าง — onboarding กลุ่ม Chip ไม่ได้ผูกกับ label** — หน้าเช็คอินแก้แล้ว (ข้อ 9) แต่ onboarding ยังไม่ได้แก้
39. ⬜ **ยังค้าง — landing / login / register ไม่มี `loading.tsx`** — รวมถึง `/forgot-password` และ `/reset-password` ที่เพิ่มใหม่

## เรื่องที่ผู้ใช้ไม่มีทางรู้ (ไม่ใช่บั๊ก แต่ควรรู้ตอนตอบกรรมการ)

40. **โควตา Gemini หมด = ผู้ใช้ไม่รู้เลย (บน insight/reflection)** — ทั้งสองหน้า fallback ไปใช้ template เงียบ ๆ ตัวเลขยังจริงเพราะมาจาก `lib/patterns` — เป็นการตัดสินใจที่บันทึกไว้ใน [F3-03](../.scratch/f3-pattern-analysis/issues/03-insight-endpoint-cache.md) · **ต่างจากหน้าแชท** ที่ตอนนี้บอกตรง ๆ ด้วยโทน muted (ข้อ 18)
41. ✅ **ปิดแล้ว — cache hit ตอนกดปุ่มไม่มีข้อความบอก** — การ์ดวิเคราะห์แสดง "วิเคราะห์เมื่อ {วันที่}" แล้ว → แยกออกว่าเป็นของเดิมจาก cache หรือของที่เพิ่งสร้าง
42. ⬜ **ยังค้าง — DB error ตอนดึง checkin ถูกกลืน** — `getCheckins` คืน `[]` → ผู้ใช้เห็นหน้า "ยังไม่มีข้อมูลสุขภาพ" เหมือนผู้ใช้ใหม่ ทั้งที่จริงคือระบบพัง

## พบเพิ่มจาก UX/UI audit เต็มระบบ (24 ก.ค.) — ปิดแล้วทั้งหมด

43. ✅ **`/checkin` ที่บันทึกแล้วเปิดมาเจอ wizard ไม่ใช่สรุป** — ผู้ใช้ไม่รู้ว่าบันทึกติดหรือยัง · ตอนนี้เปิดมาเห็นการ์ดสรุปก่อน กด "แก้ไขบันทึกนี้" เพื่อเข้าฟอร์ม
44. ✅ **ไม่มีทางเข้าบันทึกย้อนหลังเกิน 1 วัน** — ระบบรองรับ 30 วันแต่ UI มี nudge แค่ "เมื่อวาน" · หน้าประวัติแทรกการ์ดเส้นประของทุกวันที่ขาดแล้ว พร้อมแบ่งหน้าครั้งละ 14 วัน
45. ✅ **guard ข้ามเที่ยงคืนเขียนคำตอบผิดวัน** — เดิมย้ายคำตอบของเมื่อวานมาเป็นวันใหม่ · ตอนนี้พาไปบันทึกเป็นวันเดิมที่กรอกไว้
46. ✅ **มื้อที่ข้ามขัดกับจำนวนมื้อ แล้วไปแตกที่ขั้น 4** — จำกัดตั้งแต่ขั้นที่ 1 (ปิดชิปเกินโควตา + ตัดค่าเก่าเมื่อเปลี่ยนจำนวนมื้อ)
47. ✅ **disruptor marker ใช้ 6 สีแยกชนิด** — ขัดกฎ DESIGN.md ที่สั่งปะการังสีเดียว และยืมสี pillar มาใช้จนอ่านกราฟสับสน · ตอนนี้ปะการังสีเดียว แยกชนิดด้วยไอคอน
48. ✅ **marker หายเงียบในโหมด 30 วัน** — Recharts ข้าม tick แล้ว marker ที่อยู่ใน tick หายตาม · บังคับ `interval={0}` แล้ว (ยืนยัน 22 จุดครบ) และย่อ badge เป็นจุดเมื่อวันชิดกัน
49. ✅ **popover ปัจจัยรบกวนโดนการ์ดตัด** — clamp ตำแหน่งให้อยู่ในกรอบแล้ว
50. ✅ **แท็บกราฟ 4 ตัวตกบรรทัดที่ 320px** — เปลี่ยนเป็น `w-full` + `flex-1` แบบเดียวกับปุ่มช่วงเวลา (วัดจริงแล้วอยู่แถวเดียว สูง 44px ไม่มี horizontal scroll)
51. ✅ **สีกราฟ light mode ตกเกณฑ์ contrast 3:1** — 4 ใน 6 token ตก (อำพัน 2.03 · เขียว 2.70 · ม่วง 2.72 · ปะการัง 2.90) · ทำให้เข้มขึ้นจนผ่านทั้งหมดโดยคงความหมายสีเดิม · ขอบช่องกรอกก็ตก (1.42) แก้เป็น 3.34 แล้ว — **โทน dark ผ่านอยู่แล้วจึงไม่แตะ**
52. ✅ **UI พูดไม่ตรงกับที่โค้ดทำ 3 จุด** — "เป้าหมายจะเริ่มมีผลในสัปดาห์หน้าทันที" (ของจริงบันทึกเป็นสัปดาห์นี้) · step rail อ้างว่าเก็บ draft ให้ (ของจริงหายเมื่อปิดแท็บ) · "ยังไม่เคยบันทึกวันนี้" บนหน้าแก้ไขวันในอดีต
53. ✅ **ฟองข้อความที่ระบบสร้างแทนผู้ใช้ลงท้าย "ครับ"** — ผู้ใช้หญิงเห็นตัวเอง "พูด" ผิด register ในฟองของตัวเอง
54. ⬜ **ยังค้าง (ตั้งใจ) — ไม่มี flow ลืมรหัสผ่าน** — ผู้ใช้ email/password ที่ลืมรหัสยังเป็นทางตัน · **เขียนโค้ดไว้ครบแล้ว** (`/forgot-password` + `/reset-password` + 2 server action) **แต่ถอดลิงก์ออกจากหน้า login เมื่อ 25 ก.ค.** เพราะยังพิสูจน์ไม่ได้ว่าอีเมลส่งออกจริง — ปล่อยไว้จะกลายเป็นหน้าจอที่บอกว่า "ส่งลิงก์แล้ว" ทั้งที่ไม่มีอะไรมาถึง ซึ่งแย่กว่าทางตันเดิม · บรีฟ §7 ไม่ได้บังคับเรื่องนี้ จึงเลื่อนไปเป็นงาน "ถ้าไปต่อ" ตามที่ audit ระบุไว้แต่แรก
    **ระหว่างทำพบบั๊กจริง 1 ข้อและแก้แล้ว:** `PUBLIC_PATHS` ใน [proxy.ts](../src/proxy.ts) ไม่ครอบคลุมเส้นทางใหม่ → ผู้ใช้ที่ยังไม่ล็อกอิน (ซึ่งคือทุกคนที่ลืมรหัสผ่าน) ถูก middleware เด้งกลับหน้า login · มีเทสต์ e2e คุมไว้แล้ว
55. ✅ **ล้างประวัติแชทรีเซ็ตโควตา 5 ข้อความ/วัน** — โควตาเคยนับจากแถวที่ลบได้ · เพิ่ม `chat_daily_usage` (migration 0004) เป็นตัวนับแบบเพิ่มอย่างเดียว **เก็บแค่ตัวเลข ไม่มีเนื้อหาข้อความ** คำสัญญาเรื่องการลบในหน้า privacy จึงยังจริงครบ
56. ✅ **คำถามเปิดของโค้ชไม่เคยถูกส่งเข้า context ของ AI** — ผู้ใช้ตอบคำถามที่โมเดลไม่เคยเห็น · ยัดกลับเข้า turns แล้วเมื่อข้อความแรกในประวัติเป็นของผู้ใช้

## บทเรียนจาก audit รอบนี้ (บันทึกไว้กันพลาดซ้ำ)

- **ตัวกรองคำต้องห้ามเกือบถูกเอาไปใช้กับคำตอบแชท** — ระหว่าง audit มีข้อเสนอให้เอา `findForbiddenTerms()` ไปกรองคำตอบโค้ชด้วย โดยอ้าง CONTEXT.md ที่เขียนว่า "ทุก feature ที่มี AI output ต้องผ่าน guardrail เดียวกัน" · **เกือบทำจริงแล้วจึงพบว่าผิด** — [docs/08](08-safety-privacy.md) ระบุไว้ว่าจงใจไม่กรอง เพราะคำปฏิเสธที่ถูกต้องต้องเอ่ยคำต้องห้ามเอง และ [หลักฐาน QA-01](../.scratch/ai-safety-test/verdicts-2026-07-19.md) ยืนยันว่าคำตอบที่ผ่านการตรวจมีคำเหล่านั้นอยู่จริง · ถ้าปล่อยไป **การสาธิตปฏิเสธสดบนเวทีจะได้ข้อความ fallback แทนคำปฏิเสธจริง** → มีเทสต์ใน [language.test.ts](../src/lib/safety/language.test.ts) เตือนไว้แล้ว
- **อ่าน CONTEXT.md อย่างเดียวไม่พอ** — กฎที่ดูขัดกันมักมีเหตุผลบันทึกไว้ใน docs/08 หรือ ADR · ก่อนแก้อะไรที่เกี่ยวกับ safety ให้เปิดทั้งสองที่
- **ด่าน e2e เดิมกวาดแค่ตอนเปิดหน้า** — สถานะที่ต้องกดก่อนถึงจะโผล่ (guided flow, โหมดยืนยันลบ) ไม่เคยถูกตรวจ ซึ่งเป็นเหตุผลที่ไทย 11px รอดมาได้ · เพิ่มด่านที่กดก่อนแล้วค่อยกวาดแล้ว แต่ยังครอบไม่ครบทุกหน้า
