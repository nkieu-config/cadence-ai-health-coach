# INFRA-14: กราฟจะหายไปใน dark mode — และ 🟦 จะไม่มีทางรู้

Status: done
Owner: A
Sprint: 2
Priority: M — 🟦 เริ่ม F2-02 พรุ่งนี้
Refs: DESIGN.md, NFR-1, skill `tailwind-design-system`
Blocked by: —

## ที่มา

ตรวจ Tailwind v4 design system ก่อน 🟦 เริ่มทำกราฟ — **สิ่งที่สำคัญกว่าความสวยของ token คือ "เขามีของครบจะเริ่มได้จริงไหม"**

`recharts@3.8` + shadcn `ui/chart.tsx` มีครบ ✅ **แต่ `ui/chart.tsx` ไม่เคยถูก import เลย = ไม่เคยถูก compile หรือ render จริง**

## 🔴 1. shadcn ผูก dark mode ของกราฟไว้กับคลาส `.dark` — แอปเราไม่มีคลาสนั้น

```ts
const THEMES = { light: "", dark: ".dark" } as const   // shadcn ของเดิม
```

มันสร้าง CSS ว่า `.dark [data-chart=x] { --color-sleep: <สี dark> }`
แต่ dark mode ของเราคือ **`@media (prefers-color-scheme: dark)`** (ตามค่าเครื่อง — ตัดสินใจไว้ตั้งแต่รอบ UI/UX)
→ **ไม่มีคลาส `.dark` อยู่ที่ไหนเลยทั้งแอป** → กฎนั้นไม่เคย match

### วัดจริงบนเบราว์เซอร์ (เครื่องอยู่ dark mode)

| | CSS ที่ฉีดออกมา | สีที่ browser ใช้จริง |
|---|---|---|
| **ก่อนแก้** | `.dark [data-chart=x] { --color-sleep: #edfce9 }` | **`#003c33`** (สี light!) |
| **หลังแก้** | `@media (prefers-color-scheme: dark) { … }` | `#edfce9` ✅ |

**ผลก่อนแก้:** แท่ง "นอน" สี `#003c33` บนพื้นหลัง `#17171c`
→ **contrast 1.44:1** (เกณฑ์ non-text ต้อง ≥ 3:1) → **แทบมองไม่เห็น**
→ หลังแก้: **16.76:1** ✅

**และ 🟦 จะไม่มีทางรู้** เพราะ **light mode ดูปกติดีทุกอย่าง**

## 🔴 2. `--chart-3` (เคลื่อนไหว) contrast ไม่ผ่านบนพื้นขาว

`#ff7759` บนขาว = **2.61:1** — ต่ำกว่าเกณฑ์ non-text 3:1
และ chart-3 คือ **1 ใน 3 pillar ที่ต้องพล็อต** ไม่ใช่สีตกแต่ง

→ `#ff5e3a` — **เฉดเดิม (hue 11°) ความอิ่มตัวเดิม (100%) แค่ lightness ลด 6%** → **3.04:1** ✅
ตาแทบไม่เห็นต่าง แต่ข้ามเกณฑ์แล้ว · dark mode คงเดิม `#ff7759` (6.83:1 ✅)

## ✅ พิสูจน์ว่า stack ใช้งานได้จริง (สร้าง probe แล้วลบทิ้ง)

- **recharts 3.8 เข้ากับ shadcn `chart.tsx` ได้** — build ผ่าน · **14 แท่ง + legend + tooltip render ครบ**
- token พลิก dark mode ถูกต้อง (`--color-sleep` → `#edfce9` เมื่อเครื่องเป็น dark)
- contrast สีกราฟทั้ง 5 ตัว ผ่านเกณฑ์ 3:1 ทั้ง 2 โหมดแล้ว
- **ตัวอย่างโค้ดที่ใช้ได้จริงเขียนลง `DESIGN.md` + kickoff ของ F2-02 แล้ว** — 🟦 ก๊อปไปวางได้เลย

## ⛔ OKLCH — สกิลแนะนำ แต่จงใจไม่ทำ

สกิลบอกให้ใช้ `oklch()` แทน hex ("better color perception") · **ประเมินแล้วว่าไม่คุ้ม:**

- เราไม่ได้ generate เฉดสีอัตโนมัติ (สีมาจาก palette ที่เลือกมือแล้ว)
- `color-mix(in oklch, …)` ที่ `button.tsx` ใช้อยู่ **ทำงานกับ hex ได้อยู่แล้ว** (เบราว์เซอร์แปลงให้)
- dark mode ใช้สีที่เลือกมือทีละตัว ไม่ได้คำนวณจาก lightness
- เหลือ 14 วันถึง freeze — **แปลง 40+ token ทั้งไฟล์เพื่อผลลัพธ์ทางสายตาเท่าเดิม = ความเสี่ยงล้วน ๆ**

## ✅ ที่ตรวจแล้วผ่านอยู่แล้ว

- `@import "tailwindcss"` + `@theme inline` — ตรงตาม v4 (ไม่มี `tailwind.config.ts` ตกค้าง)
- token เป็น **semantic** ทั้งหมด (`--color-primary` ไม่ใช่ `--color-green-700`)
- `@custom-variant dark (@media (prefers-color-scheme: dark))` + `color-scheme` — ครบ
- `prefers-reduced-motion` มีแล้ว

## Comments
