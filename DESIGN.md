# ⚠️ อ่านตรงนี้ก่อน — Cadence คือ "แอปมือถือ" ไม่ใช่ "เว็บไซต์"

> Theme ชื่อ **"มิ้นต์สด"** — พื้นขาว + เขียวมรกตสด + มิ้นต์อ่อน · เดิมยืมพาเลตต์จากเว็บการตลาดของ Cohere ซึ่งเย็นและเป็นทางการเกินกว่าเสียงของแอป
> เราไม่มี landing page ไม่มี hero — เรามีฟอร์ม, dashboard, เมนูล่าง
>
> สี/ฟอนต์/มุมโค้ง **ฝังใน `globals.css` ให้แล้ว** เขียน UI ด้วย class ปกติ (`bg-primary`, `text-muted-foreground`) **ห้าม hardcode สี** · รายละเอียด theme อยู่ท้ายไฟล์

## กฎ Layout ของแอปเรา (บังคับใช้จริง)

**1. หน้าใหม่ไม่ต้องเขียนโครงเอง** — `src/app/(app)/layout.tsx` ให้ guard + เมนู + safety notice แล้ว

```tsx
export default async function MyPage() {
  return (
    <PageContainer>              {/* หรือ width="content" */}
      <h1 className="sr-only">ชื่อหน้า</h1>
      ...
    </PageContainer>
  );
}
```

- ❌ **ห้ามใส่ `<main>` ในหน้า** — layout ใส่ให้แล้ว จะกลายเป็น `<main>` ซ้อนกัน (HTML ผิด)
- ❌ **ห้ามกำหนดความกว้างเอง** (`max-w-7xl`, `container`) — ใช้ `<PageContainer>`
- ✅ **ทุกหน้าต้องมี `<h1>` 1 อัน** — `CardTitle` เป็นแค่ `<div>` ไม่นับเป็นหัวข้อ ถ้าหัวข้อที่เห็นอยู่ในการ์ดแล้ว ใช้ `className="sr-only"`

**2. `<PageContainer>` มี 2 แบบเท่านั้น**

| | ความกว้าง | ใช้กับ |
| --- | --- | --- |
| `<PageContainer>` | 448px ทุกจอ | **ฟอร์ม** (เช็คอิน, onboarding, แชท) — ฟอร์มแคบกรอกง่ายกว่า |
| `<PageContainer width="content">` | ถึง 1024px | **หน้าดูข้อมูล** (dashboard, ประวัติ, privacy) |

> **ความกว้างสำหรับอ่าน** — หน้าที่เนื้อหาเป็นย่อหน้ายาว (สรุปสัปดาห์, นโยบายความเป็นส่วนตัว) ห่อเนื้อหาไว้ใน `mx-auto max-w-3xl` อีกชั้นได้ · ไม่ใช่ความกว้างที่ 3 ของ container แต่เป็น **measure ของการอ่าน** — ปล่อยบรรทัดไทยยาวเต็ม 1024px จะอ่านยากกว่า
>
> **ยกเว้น: หน้าแชท** (`/coach`) ไม่ใช้ `<PageContainer>` — แชทเป็นบทสนทนา ไม่ใช่ฟอร์ม · ใช้ `max-w-[46rem]` + ความสูง `calc(100dvh - chrome)` ให้ข้อความเลื่อนในกล่อง input ปักล่าง (โครง 3 ชั้นแบบ LINE/ChatGPT) · ฟอร์มแคบเพราะกรอกง่าย แต่แชทยิ่งแคบยิ่งอึดอัด

**หลักการหน้าแชท** (message-variants.tsx): ข้อความโค้ช = avatar `MessageCircle` + ชื่อ "โค้ช" ชิดซ้าย ไม่มีพื้นฟอง (ตัวตนโค้ชชัด ตามโจทย์ Feature 4) · ข้อความผู้ใช้ = ฟองเขียวชิดขวา · คำตอบโค้ช render markdown ผ่าน `FormattedMessage` (เขียนเอง ไม่มี library ไม่มี raw HTML) · ช่องพิมพ์เป็น textarea โตตามเนื้อหา Enter ส่ง Shift+Enter ขึ้นบรรทัด · **โควตาหมด = โทน muted อบอุ่น ไม่ใช่ destructive** (โจทย์ข้อ 8 ห้ามกดดัน) · ป้ายโควตาโชว์เฉพาะเมื่อเหลือ ≤ 2

**3. Breakpoint ที่ใช้จริงมีตัวเดียว: `lg` (1024px)**

| | < 1024px | ≥ 1024px |
| --- | --- | --- |
| เมนู | เมนูล่าง 5 ปุ่ม (เช็คอิน · ภาพรวม · เป้าหมาย · โค้ช · ตั้งค่า) | **Sidebar ซ้าย** |
| Header | sticky บนสุด | ไม่มี (โลโก้อยู่ใน sidebar) |
| Layout ในหน้า | คอลัมน์เดียว | ใช้ `lg:grid-cols-*` ได้ |

อย่าใช้ `sm:` / `md:` พร่ำเพรื่อ — ออกแบบมือถือให้จบก่อน แล้วเพิ่ม `lg:` เฉพาะตอนที่เดสก์ท็อปต้องต่างจริง ๆ

**ฟอร์มโล่งบนเดสก์ท็อป?** อย่าขยายฟอร์ม (แคบ = กรอกง่ายกว่า) — เติม side panel ข้าง ๆ แทน: หน้าใช้ `width="content"`, ห่อฟอร์มไว้ใน `lg:grid` โดยคอลัมน์ฟอร์มยังคุมด้วย `max-w-md` (`mx-auto` ต่ำกว่า `lg`) · ตัวอย่าง: step-rail หน้า check-in (INFRA-17)

## กฎที่ห้ามพัง (ตรวจแล้วผ่านทั้งแอป — อย่าทำหลุด)

1. **ปุ่ม/ลิงก์/ช่องกรอก ต้องสูง ≥ 44px** — ผู้ใช้เรากรอกตอนตี 1 มือเดียว ง่วง ๆ
   ⚠️ **`<Link>` ที่แต่งให้ดูเหมือนปุ่ม ก็ต้อง 44px ด้วย** (ใช้ `buttonVariants()` หรือ `min-h-11`) — จุดนี้เคยหลุดมาแล้ว
2. **Dark mode: ตามค่าเครื่อง จนกว่าผู้ใช้จะกดปุ่มสลับ** — ทุกสีต้องมาจาก token ถ้า hardcode `bg-white` มันจะขาวโพลนตอนกลางคืน
   ธีมที่ใช้จริงอยู่ที่ `data-theme="light|dark"` บน `<html>` (ตั้งโดย inline script ก่อน paint — ดู `components/theme-script.tsx`) · `dark:` ใน Tailwind ผูกกับ attribute นี้ **ไม่ใช่ `prefers-color-scheme`** แล้ว
   ⚠️ ถ้าต้องเขียน CSS/`<style>` เองที่แยกโหมด ให้ใช้ `[data-theme="dark"]` ห้ามใช้ `@media (prefers-color-scheme: dark)` — มันจะไม่ตามปุ่ม
3. **ห้าม hardcode สี** — ใช้ `bg-primary` / `text-muted-foreground` / `border` เสมอ
4. **กราฟใช้ `--chart-1` ถึง `--chart-6`** (นอน=1, กิน=2, เคลื่อนไหว=3, พลังงาน=4, **ปัจจัยรบกวน=5**, เครื่องดื่มหวาน=6) — ผูกกับ dark mode ให้แล้ว
5. **ไม่ใช้ emoji เป็นไอคอน** — ใช้ Lucide (emoji ในข้อความปกติได้)
6. **ข้อความไทยที่มองเห็นถาวรต้อง ≥ 12px** (`text-xs` ขึ้นไป) — สระ/วรรณยุกต์ซ้อนกันที่ 10px จะติดกัน · ตัวเลขล้วนในบริบทแน่น (แกนกราฟ/ตัวนับ) ต่ำสุด 11px · **ห้าม `text-[10px]`** — มีด่าน e2e คุมแล้ว
7. **ปุ่มกลุ่มแบบ pill ต้องจบแถวเดียวเสมอ** — รายการคงที่ให้กาง `w-full` + `flex-1` แล้วย่อ padding จนพอดีที่ 320px (แท็บกราฟ 4 ตัว นอน/กิน/ขยับ/พลังงาน กับปุ่มช่วงเวลา 7/14/30 ใช้ทรงนี้) · รายการที่โตได้เรื่อย ๆ ให้เลื่อนแนวนอนแบบ week picker · **ห้ามใช้ `flex-wrap`** — มันไม่ทำให้เกิด horizontal scroll ด่าน e2e จึงจับไม่ได้ ต้องดูด้วยตาที่ 320px

## สเกลที่ใช้ทั้งแอป (ก๊อปได้เลย ไม่ต้องเดา)

| อะไร | ใช้ | หมายเหตุ |
| --- | --- | --- |
| หัวข้อหน้า (ที่มองเห็น) | `text-xl font-semibold lg:text-2xl` | ถ้าหัวข้ออยู่ในการ์ดแล้ว h1 เป็น `sr-only` |
| เนื้อความทั่วไป | `text-sm` | **`text-xs` เฉพาะ caption/meta** (เช่น `CardDescription`) — ห้ามใช้เป็นเนื้อความหลัก |
| **ย่อหน้ายาว** (reflection, บทความ) | `text-base` (16px) | ตัวไทยดูเล็กกว่า Latin ที่ px เท่ากัน · ย่อหน้าอ่านยาวบนมือถือต้องการ 16px |
| line-height | ตั้งใน `@theme` แล้ว | ไทยมี 4 ชั้นต่อบรรทัด (วรรณยุกต์/สระบน/ตัว/สระล่าง) — leading ตั้งไว้ 1.65–1.75 ให้อัตโนมัติ **ไม่ต้องใส่ `leading-*` เอง** |
| ระยะห่างระหว่าง section ในหน้า | `space-y-6` | |
| ระยะห่างในการ์ด | `space-y-4` | |
| ระยะห่างใน field (label + input) | `space-y-2` | |
| กลุ่ม Chip | `gap-2` | |
| ความสูงเต็มจอ | `min-h-dvh` | **ห้าม `min-h-screen`** — 100vh บนมือถือสูงเกินจอจริง |
| z-index | **ห้ามเพิ่มค่าใหม่** | ทั้งแอปมี 2 ชั้นเท่านั้น: `z-10` = แถบที่ sticky (header มือถือ) · `z-50` = ของที่ต้องลอยเหนือทุกอย่าง (popover ของ disruptor, skip link) — ถ้าจะเพิ่มชั้นที่ 3 ให้ถามก่อน |
| Interactive ที่สร้างเอง | ต้องมี focus ring | ก๊อป `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50` จาก Button — คนใช้คีย์บอร์ดต้องเห็นว่า focus อยู่ไหน |

## ทุกหน้าใหม่ต้องมี `loading.tsx` — ห้ามลืม

หน้าเราเป็น **dynamic ทั้งหมด** (อ่าน cookie/auth) → **ถ้าไม่มี `loading.tsx` Next จะไม่ prefetch และหน้าจอจะค้างแช่ตอนกด** จนกว่า server จะตอบ (0.3–0.8 วิ)

```tsx
// src/app/(app)/<หน้าใหม่>/loading.tsx
import { ContentSkeleton } from "@/components/page-skeleton";   // หน้าดูข้อมูล
// import { FormSkeleton } from "@/components/page-skeleton";   // ฟอร์ม

export default function Loading() {
  return <ContentSkeleton />;
}
```

- **ไม่มี default `(app)/loading.tsx` ครอบให้** — ทุก route ต้องมีของตัวเอง และ **skeleton ที่รูปทรงตรงกับหน้าจริงจะรู้สึกเร็วกว่ามาก**
- ต่อชิ้นเองใช้ `<Skeleton className="h-4 w-32" />` (`@/components/ui/skeleton`)
- **Link ที่พาไปหน้าอื่น ให้ feedback ทันทีที่แตะ** — ใช้ `<NavIcon>` / `<PendingBar>` จาก `@/components/nav-pending` (ใช้ `useLinkStatus` ข้างใน ต้องเป็นลูกของ `<Link>`)

## การ์ดที่ดึงข้อมูลเอง = ต้องครอบ `<Suspense>` เสมอ

Server Component ที่ `await` ข้อมูลของตัวเอง **จะบล็อกทั้งหน้าจนกว่ามันจะเสร็จ**
พอ AI ลง (F5-01 goal · F6-01 reflection) การ์ดพวกนี้จะเรียก Gemini ที่ใช้เวลา **~10 วินาที**
→ ถ้าไม่ครอบ Suspense **dashboard ทั้งหน้าจะค้าง 10 วิ** ทั้งที่กราฟพร้อมแสดงตั้งนานแล้ว

```tsx
import { Suspense } from "react";
import { CardSkeleton } from "@/components/page-skeleton";

<Suspense fallback={<CardSkeleton rows={1} />}>
  <CurrentGoalCard />        {/* async — ดึงข้อมูลเอง */}
</Suspense>
```

**เรียก DB/AI จากหลายที่ในหน้าเดียว?** ไม่ต้องกลัวซ้ำ — `createClient()` และ `getCurrentUser()` ถูก `cache()` ไว้แล้ว **หนึ่ง request สร้าง client ครั้งเดียว ยิง auth ครั้งเดียว**

```tsx
import { getCurrentUser, getProfile } from "@/lib/auth/user";   // cache แล้ว เรียกกี่ครั้งก็ยิงจริงครั้งเดียว
```

## กฎ Component: ห้ามใช้ boolean prop คุมพฤติกรรม

boolean 1 ตัว = 2 สถานะ · 2 ตัว = 4 · 3 ตัว = 8 — **conditional จะบานจนไม่มีใครกล้าแก้**

```tsx
❌ <Message isUser isPending isFailed isRetrying />     // เรนเดอร์อะไรออกมา? ต้องเปิดเข้าไปอ่าน
✅ <UserMessage text={...} />                            // อ่าน call site แล้วรู้เลย
✅ <CoachMessage text={...} />
✅ <PendingMessage />
✅ <FailedMessage onRetry={...} />
```

**ทำ variant ที่ชัดเจน แล้วให้ทุกตัวประกอบจาก "เครื่องยนต์" ตัวเดียวกัน**
ตัวอย่างจริงในโปรเจกต์: `TodayCheckinForm` / `BackfillCheckinForm` → ทั้งคู่ใช้ `CheckinForm` เป็นแกน
**แกนไม่รู้จักคำว่า "backfill" เลย** — variant เป็นคนฉีดพฤติกรรมเข้าไปผ่าน `beforeSave`

```tsx
// เครื่องยนต์ — ไม่มี flag ไม่มีโหมด
function CheckinForm({ date, existing, heading, beforeSave }: {...})

// variant — บอกชัดว่าตัวเองต่างยังไง
export function TodayCheckinForm({ date, existing }) {
  return <CheckinForm ... heading="เช็คอิน" beforeSave={stillToday} />;   // มี guard เที่ยงคืน
}
export function BackfillCheckinForm({ date, existing }) {
  return <CheckinForm ... heading="บันทึกย้อนหลัง" />;                     // ไม่ต้อง guard
}
```

### 📣 ถึงสาย 🟩 โค้ช — Chat UI คือที่ที่กฎนี้สำคัญที่สุด

แชทมี state เยอะมาก (กำลังส่ง / ส่งพลาด / โควตาหมด / ครบ 5 ข้อความ / กำลังรอโค้ชตอบ)
**ถ้าเริ่มด้วย `<Message isUser isPending .../>` มันจะกลายเป็นนรก conditional ภายใน 2 วัน**

```tsx
// ✅ แยก variant ตั้งแต่แรก — แต่ละตัวสั้น อ่านจบใน 10 วินาที
<MessageList>
  {history.map(m => m.role === "user"
    ? <UserMessage key={m.id} message={m} />
    : <CoachMessage key={m.id} message={m} />)}

  {waiting && <CoachThinking />}
  {needsReply(history) && <RetryPrompt onRetry={retryCoachReply} />}
</MessageList>
```

- **ข้อความว่างเปล่าตอนโควตาหมด** ก็เป็น variant ของตัวเอง (`<QuotaReachedNotice />`) ไม่ใช่ prop
- **ปุ่ม "ลองใหม่" ต้องเรียก `retryCoachReply()` ไม่ใช่ `sendCoachMessage()` ซ้ำ** — ไม่งั้นประวัติจะมีข้อความผู้ใช้ซ้ำ 2 อัน
- ไม่ต้องใช้ `forwardRef` — React 19 รับ `ref` เป็น prop ปกติแล้ว

## กราฟ (🟦 อ่านตรงนี้ก่อนเขียนบรรทัดแรก)

**ใช้ `color: "var(--chart-N)"` เท่านั้น — ห้ามใช้ `theme: { light, dark }`**

```tsx
const config = {
  sleep:    { label: "นอน (ชม.)",       color: "var(--chart-1)" },
  meals:    { label: "มื้ออาหาร",        color: "var(--chart-2)" },
  movement: { label: "เคลื่อนไหว (นาที)", color: "var(--chart-3)" },
} satisfies ChartConfig;

<ChartContainer config={config} className="h-64 w-full">
  <BarChart data={data}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="day" tickLine={false} axisLine={false} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <ChartLegend content={<ChartLegendContent />} />
    <Bar dataKey="sleep" fill="var(--color-sleep)" radius={4} />
  </BarChart>
</ChartContainer>
```

- **นอน = `--chart-1` ฟ้า · กิน = `--chart-2` อำพัน · เคลื่อนไหว = `--chart-3` มิ้นต์** — สีถูกเลือกให้ตรงกับความหมาย อ่านกราฟออกโดยไม่ต้องดู legend
- token พลิก dark mode ให้เอง — **อย่า hardcode hex ในกราฟ**
- **วันที่ขาดบันทึกต้องเป็นช่องว่าง ไม่ใช่ 0** (0 แปลว่า "นอน 0 ชม." ซึ่งไม่จริง) → ส่ง `null` เข้า data point
- กราฟต้องมี **legend + tooltip** — ห้ามสื่อความหมายด้วยสีอย่างเดียว (คนตาบอดสีอ่านไม่ออก)

## เช็กก่อนเปิด PR ที่แตะ UI

- [ ] เปิดบนมือถือจริง (หรือย่อ browser เป็น 390px) — ไม่มี horizontal scroll
- [ ] กดปุ่มทุกอันด้วยนิ้วโป้งได้ ไม่พลาด
- [ ] ตั้งมือถือเป็น dark mode → เปิดดู ไม่มีจุดไหนขาวโพลน **และกราฟยังเห็นแท่ง/เส้นชัด**
- [ ] กด Tab ไล่ทั้งหน้า — เห็น focus ตลอดเส้นทาง
- [ ] มี `<h1>` 1 อันในหน้า
- [ ] หน้าใหม่มี `loading.tsx` — กดเมนูแล้วเห็นอะไรทันที ไม่ค้างแช่
- [ ] การ์ดที่ดึงข้อมูล/เรียก AI เอง ครอบ `<Suspense>` แล้ว — ไม่บล็อกส่วนอื่นของหน้า
- [ ] ไม่มี boolean prop ที่คุมพฤติกรรม — อ่าน call site แล้วรู้ว่าเรนเดอร์อะไร

---

# 🎨 ที่มาของ theme

> พาเลตต์ปัจจุบันคือ **"มิ้นต์สด"** (ปรับ 20 ก.ค.) · ก่อนหน้านั้นยืมสีจากเว็บการตลาดของ Cohere — เอกสารต้นฉบับอยู่ใน git history ของไฟล์นี้

## ใช้ยังไง

1. **สี/มุมโค้ง/ฟอนต์ ถูก map ลง `src/app/globals.css` แล้ว** — เขียน UI ด้วย semantic class ของ shadcn ตามปกติ (`bg-primary`, `text-muted-foreground`, `border`, `rounded-lg`) จะได้ theme นี้อัตโนมัติ **ห้าม hardcode hex ในหน้าไหนทั้งนั้น** · ข้อยกเว้นเดียวคือ **โลโก้แบรนด์ภายนอก** (เช่น ตัว G ของ Google ใน `google-button.tsx`) — สีแบรนด์ต้องคงที่ ห้ามพลิกตาม dark mode ตามข้อกำหนดของเจ้าของแบรนด์
2. **ฟอนต์**: Unica77/CohereText เป็นฟอนต์ proprietary + ไม่รองรับภาษาไทย → แทนด้วย **IBM Plex Sans Thai** (UI ทั้งหมด) และ **IBM Plex Mono** (ตัวเลข/label เชิงเทคนิค เช่น ค่าสถิติใน dashboard — ใช้ class `font-mono`) โหลดผ่าน `next/font` ใน `layout.tsx` แล้ว
3. **สีหลัก = เขียวมรกต `#06805a`** (`bg-primary`) — ปุ่มหลัก/จุดเน้น · พื้นหลังขาว การ์ดขาว แยกด้วยขอบมิ้นต์ `#dcefe6` · พื้นรอง/ไฮไลต์เป็นมิ้นต์อ่อน (`bg-muted` `bg-accent`)
   **`--border` กับ `--input` ไม่ใช่ค่าเดียวกันโดยตั้งใจ** — `--border` เป็นขอบตกแต่งของการ์ด ให้จางไว้ตามหน้าตาที่ต้องการ ส่วน `--input` เป็นขอบของ**ตัวควบคุม** จึงต้อง ≥ 3:1 (ผู้ใช้ต้องมองเห็นว่าช่องกรอกอยู่ตรงไหน)
4. **สีกราฟ**: `--chart-1` ฟ้า (นอน) · `--chart-2` อำพัน (กิน) · `--chart-3` เขียวมรกต (ขยับ) · `--chart-4` ม่วง (พลังงาน) · `--chart-5` ปะการัง (ปัจจัยรบกวน) · `--chart-6` เขียวน้ำทะเล (เครื่องดื่มหวาน)
   ⚠️ **โทน light ถูกทำให้เข้มขึ้นเมื่อ 24 ก.ค. เพื่อให้แท่ง/จุดบนพื้นขาวได้ contrast ≥ 3:1 (WCAG 1.4.11)** — เหตุผลเดียวกับที่ `--primary` เลือกเขียวเข้ม ไม่ใช่เขียวสด · ถ้าจะปรับให้สดขึ้นอีก ต้องคำนวณกับพื้นขาวก่อน ไม่ใช่เลือกด้วยตา · โทน dark ผ่านอยู่แล้วจึงไม่แตะ
5. **ปุ่มเป็น pill ทั้งแอป** (แก้ใน `components/ui/button.tsx` แล้ว) ตาม `button-primary` ของ design

## ส่วนที่"ไม่"เอามาใช้ (เป็นของ marketing site ไม่ใช่แอปเรา)

- Hero display 96px/72px, announcement bar, trust-logo strip, blog filter chips, dark feature band ยาว 80px padding — แอปเราเป็นฟอร์ม + dashboard บนมือถือ หัวข้อใหญ่สุดที่ใช้จริงคือระดับ `text-2xl`–`text-4xl`
- อย่าทำหน้าแอปเป็น landing page — ยึด: พื้นขาว การ์ดเรียบ ไม่มีเงาหนัก ช่องว่างเยอะ ปุ่ม pill เขียวมรกต

## หมายเหตุที่จงใจต่างจากต้นฉบับ

- `--primary` เลือก `#06805a` ไม่ใช่เขียวที่สดกว่านี้ เพราะตัวหนังสือขาวบนปุ่มต้องได้ contrast ≥ 4.5:1 — เขียวสดกว่านี้ตกด่าน `e2e`
- Dark mode ใช้พื้น **น้ำเงินหมึก `#0d1526`** (ไม่ใช่เขียวหรือโทนอุ่น) — พื้นน้ำเงินทำให้การ์ด `#16203a` ลอยเป็นชั้นชัด และมิ้นต์ primary ตัดแรงกว่าบนพื้นเขียว · แท่งนอน dark ใช้ฟ้าสว่าง `#7dd3fc` แยกจากพื้นด้วยความสว่าง · **เคยลองครีม/แอปริคอตแล้วออกมาน้ำตาล เคยลองพื้นเขียวแล้วย้อมสีกราฟ**

## กฎสี: ห้ามใช้สีเตือนภัยกับพฤติกรรมผู้ใช้

`--destructive` **สงวนไว้ให้ error ของระบบเท่านั้น** (บันทึกไม่สำเร็จ, เชื่อมต่อไม่ได้)

โจทย์ข้อ 8 สั่งว่าห้ามกดดัน ห้ามตัดสิน ห้ามทำให้ผู้ใช้รู้สึกล้มเหลว — นอน 4 ชม. กับ 8 ชม. จึงใช้**สีเดียวกัน** ความหมายอยู่ที่ความยาว ไม่ใช่สี

- พลังงาน ต่ำ/กลาง/สูง → badge `secondary` **สีเดียวกันทั้งสามระดับ** (ความหมายอยู่ที่ข้อความ ไม่ใช่สี)
- **สถานะที่ไม่ใช่ความผิดผู้ใช้ห้ามใช้กล่องแดง** — ข้อมูลยังไม่พอ · โควตาหมด · ครบ 2 เป้าหมายแล้ว · ข้ามเที่ยงคืน → ใช้ `<GentleNotice>` (`components/ui/notice.tsx`) · `<ErrorNotice>` สงวนให้ error ระบบเท่านั้น
- วันที่ไม่ได้บันทึก → เส้นประจาง ไม่ใช่ 0 ไม่ใช่ "streak ขาด"
- เส้นอ้างอิงในกราฟ → `--muted-foreground` ไม่ใช่แดง
- ไม่มีคะแนน ไม่มีเปอร์เซ็นต์รวม ไม่มีเกรด
- **วันที่มีปัจจัยรบกวนใช้ `--chart-5` ปะการัง** ไม่ใช่ `--accent` (มิ้นต์ จะกลืนพื้น) และไม่ใช่อำพัน (บน navy ผสมเป็นโอลีฟน้ำตาล) · โทนอุ่นตัดสนามน้ำเงินได้ดี และ disruptor คือบริบท ไม่ใช่ "เรื่องแย่"
  ⚠️ **ปะการังสีเดียวทุกชนิด** ทั้งใน marker บนกราฟและแถบใน "คืนสู่เช้า" — แยกชนิดด้วย **ไอคอน Lucide เท่านั้น** ห้ามแจกสีตามชนิด (เคยหลุดมาแล้ว: ยืมสี pillar มาใช้จนอ่านกราฟสับสน)
