# ⚠️ อ่านตรงนี้ก่อน — HealthCoach คือ "แอปมือถือ" ไม่ใช่ "เว็บไซต์"

> Theme อิง design ของ Cohere แต่ **เอามาใช้แค่สีกับฟอนต์** — Layout/Grid ของมันเป็นของเว็บไซต์การตลาด ไม่ใช่ของเรา
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

**3. Breakpoint ที่ใช้จริงมีตัวเดียว: `lg` (1024px)**

| | < 1024px | ≥ 1024px |
| --- | --- | --- |
| เมนู | เมนูล่าง 4 ปุ่ม | **Sidebar ซ้าย** |
| Header | sticky บนสุด | ไม่มี (โลโก้อยู่ใน sidebar) |
| Layout ในหน้า | คอลัมน์เดียว | ใช้ `lg:grid-cols-*` ได้ |

อย่าใช้ `sm:` / `md:` พร่ำเพรื่อ — ออกแบบมือถือให้จบก่อน แล้วเพิ่ม `lg:` เฉพาะตอนที่เดสก์ท็อปต้องต่างจริง ๆ

**ฟอร์มโล่งบนเดสก์ท็อป?** อย่าขยายฟอร์ม (แคบ = กรอกง่ายกว่า) — เติม side panel ข้าง ๆ แทน: หน้าใช้ `width="content"`, ห่อฟอร์มไว้ใน `lg:grid` โดยคอลัมน์ฟอร์มยังคุมด้วย `max-w-md` (`mx-auto` ต่ำกว่า `lg`) · ตัวอย่าง: step-rail หน้า check-in (INFRA-17)

## กฎที่ห้ามพัง (ตรวจแล้วผ่านทั้งแอป — อย่าทำหลุด)

1. **ปุ่ม/ลิงก์/ช่องกรอก ต้องสูง ≥ 44px** — ผู้ใช้เรากรอกตอนตี 1 มือเดียว ง่วง ๆ
   ⚠️ **`<Link>` ที่แต่งให้ดูเหมือนปุ่ม ก็ต้อง 44px ด้วย** (ใช้ `buttonVariants()` หรือ `min-h-11`) — จุดนี้เคยหลุดมาแล้ว
2. **Dark mode ตามค่าเครื่องอัตโนมัติ** — ทุกสีต้องมาจาก token ถ้า hardcode `bg-white` มันจะขาวโพลนตอนกลางคืน
3. **ห้าม hardcode สี** — ใช้ `bg-primary` / `text-muted-foreground` / `border` เสมอ
4. **กราฟใช้ `--chart-1` ถึง `--chart-5`** (นอน=1, กิน=2, เคลื่อนไหว=3) — ผูกกับ dark mode ให้แล้ว
5. **ไม่ใช้ emoji เป็นไอคอน** — ใช้ Lucide (emoji ในข้อความปกติได้)

## สเกลที่ใช้ทั้งแอป (ก๊อปได้เลย ไม่ต้องเดา)

| อะไร | ใช้ | หมายเหตุ |
| --- | --- | --- |
| หัวข้อหน้า (ที่มองเห็น) | `text-xl font-semibold lg:text-2xl` | ถ้าหัวข้ออยู่ในการ์ดแล้ว h1 เป็น `sr-only` |
| เนื้อความ | `text-sm` ขึ้นไป | **`text-xs` เฉพาะ caption/meta** (เช่น `CardDescription`) — ห้ามใช้เป็นเนื้อความหลัก |
| ระยะห่างระหว่าง section ในหน้า | `space-y-6` | |
| ระยะห่างในการ์ด | `space-y-4` | |
| ระยะห่างใน field (label + input) | `space-y-2` | |
| กลุ่ม Chip | `gap-2` | |
| ความสูงเต็มจอ | `min-h-dvh` | **ห้าม `min-h-screen`** — 100vh บนมือถือสูงเกินจอจริง |
| z-index | **ห้ามเพิ่มใหม่** | ทั้งแอปมีจุดเดียว: header มือถือ `z-10` — ถ้าคิดว่าต้องใช้ ให้ถามก่อน |
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

- มี `(app)/loading.tsx` เป็น default ครอบให้อยู่แล้ว — แต่ **skeleton ที่รูปทรงตรงกับหน้าจริงจะรู้สึกเร็วกว่ามาก**
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

- **นอน = `--chart-1` · กิน = `--chart-2` · เคลื่อนไหว = `--chart-3`** (ล็อกไว้แล้ว ใช้ให้ตรงกันทั้งแอป)
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

# 🎨 ที่มาของ theme (Cohere design → HealthCoach)

> Theme มาจากการวิเคราะห์ design ของ Cohere — เอกสารฉบับเต็ม (~470 บรรทัด) ถูกตัดออกเพราะ token ทั้งหมด **ฝังลง `globals.css` แล้ว** ไม่ต้องเปิดเทียบสีเอง · อยากอ่านต้นฉบับ: git history ของไฟล์นี้ (ก่อน 20 ก.ค. 2026)

### ใช้ยังไง

1. **สี/มุมโค้ง/ฟอนต์ ถูก map ลง `src/app/globals.css` แล้ว** — เขียน UI ด้วย semantic class ของ shadcn ตามปกติ (`bg-primary`, `text-muted-foreground`, `border`, `rounded-lg`) จะได้ theme นี้อัตโนมัติ **ห้าม hardcode hex ในหน้าไหนทั้งนั้น**
2. **ฟอนต์**: Unica77/CohereText เป็นฟอนต์ proprietary + ไม่รองรับภาษาไทย → แทนด้วย **IBM Plex Sans Thai** (UI ทั้งหมด) และ **IBM Plex Mono** (ตัวเลข/label เชิงเทคนิค เช่น ค่าสถิติใน dashboard — ใช้ class `font-mono`) โหลดผ่าน `next/font` ใน `layout.tsx` แล้ว
3. **สีหลัก = deep green `#003c33`** (`bg-primary`) — ปุ่มหลัก/จุดเน้น; พื้นรอง `soft-stone` = `bg-secondary`/`bg-muted`; ไฮไลต์บวก `pale-green` = `bg-accent`
4. **สีกราฟ (สาย Dashboard)**: ใช้ `--chart-1` ถึง `--chart-5` (เขียวเข้ม/น้ำเงิน/coral/เทา/ม่วง) — เช่น นอน=chart-1, กิน=chart-2, เคลื่อนไหว=chart-3
5. **ปุ่มเป็น pill ทั้งแอป** (แก้ใน `components/ui/button.tsx` แล้ว) ตาม `button-primary` ของ design

### ส่วนที่"ไม่"เอามาใช้ (เป็นของ marketing site ไม่ใช่แอปเรา)

- Hero display 96px/72px, announcement bar, trust-logo strip, blog filter chips, dark feature band ยาว 80px padding — แอปเราเป็นฟอร์ม + dashboard บนมือถือ หัวข้อใหญ่สุดที่ใช้จริงคือระดับ `text-2xl`–`text-4xl`
- อย่าทำหน้าแอปเป็น landing page — ยึด: พื้นขาว การ์ดเรียบ ไม่มีเงาหนัก ช่องว่างเยอะ ปุ่ม pill เขียวเข้ม

### หมายเหตุที่จงใจต่างจากต้นฉบับ

- `muted-foreground` ใช้ `#616161` (body-muted) ไม่ใช่ `#93939f` — ตัวหลังอ่อนเกินสำหรับตัวหนังสือเล็กบนพื้นขาว (contrast ไม่ผ่าน)
- Error ใช้ `#b30000` ตาม design (แทนแดง default ของ shadcn)
