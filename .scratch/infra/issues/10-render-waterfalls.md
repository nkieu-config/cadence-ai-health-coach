# INFRA-10: Waterfall ในการ render — dashboard บล็อกตัวเองรอทีละอย่าง

Status: done
Owner: A
Sprint: 2
Priority: M — **ต้องแก้ก่อน F5-01/F6-01** ไม่งั้นการ์ดที่เรียก Gemini จะบล็อก dashboard ทั้งหน้า ~10 วิ
Refs: NFR-2, skill `vercel-react-best-practices` (async-suspense-boundaries, server-cache-react, async-defer-await)
Blocked by: —

## ปัญหา

ตรวจโค้ดตามกฎ Priority 1 (`async-`) และ Priority 3 (`server-`) ของ Vercel

### 🔴 1. Dashboard เป็น waterfall — และจะระเบิดตอน AI ลง

`CurrentGoalCard` กับ `ReflectionCard` เป็น **async Server Component ที่ดึงข้อมูลเอง**

```
getCheckins(30)  ──await──▶  page คืน JSX  ──▶  getActiveGoals() ∥ getLatestReflection()
```

การ์ดเริ่มดึงข้อมูล**หลัง** `getCheckins()` เสร็จเท่านั้น → เสีย 1 round-trip ฟรี ๆ

**และนี่คือระเบิดเวลา:** F5-01 (goal AI) กับ F6-01 (reflection AI) จะทำให้การ์ดพวกนี้เรียก Gemini
→ **Gemini ตอบ ~10 วินาที → dashboard ทั้งหน้าค้างรอ 10 วิ** ทั้งที่กราฟกับตาราง pattern พร้อมแสดงตั้งนานแล้ว

### 🔴 2. สร้าง Supabase client ใหม่ทุกครั้ง

`getCheckins()` · `getActiveGoals()` · `getLatestReflection()` ต่างคนต่างเรียก `createClient()`
→ dashboard เดียว **สร้าง client 3 ตัว อ่าน cookie 3 รอบ**

และพอ F4-02 (coach context) ลง มันต้องใช้ user + profile + checkins + goals + insight **ในการ render เดียว** → ยิ่งซ้ำหนัก

### 🟡 3. `searchParams` บล็อก `getCheckins` โดยไม่จำเป็น

```tsx
const period = parsePeriod((await searchParams).days);   // ⏳ รอตรงนี้
const recent = await getCheckins(MAX_PERIOD);            // ...ค่อยเริ่มยิง DB
```

สองอย่างนี้ไม่เกี่ยวกันเลย — ยิงพร้อมกันได้

### ✅ ที่ตรวจแล้วผ่าน

- `bundle-barrel-imports` — `lucide-react` อยู่ใน default `optimizePackageImports` ของ Next แล้ว
- `rendering-conditional-render` — ไม่มีที่ไหนใช้ `{number && ...}` (ที่จะเรนเดอร์เลข 0 ออกมา)
- `server-auth-actions` — ทุก server action เช็ค `getUser()` ก่อนทำงาน

## งาน

- [x] `server-cache-react`: `createClient()` ห่อด้วย `cache()` → หนึ่ง request หนึ่ง client
- [x] เพิ่ม `getCurrentUser()` ที่ cache แล้ว → layout + component ไหนก็เรียกได้ ยิง auth ครั้งเดียว
- [x] `async-suspense-boundaries`: ครอบ `CurrentGoalCard` / `ReflectionCard` ด้วย `<Suspense>` + skeleton
- [x] `async-defer-await`: เริ่ม `getCheckins()` ก่อน `await searchParams`
- [x] เขียนกฎลง DESIGN.md ให้ 3 สายทำตาม (การ์ดที่ดึงข้อมูลเอง = ต้องมี Suspense)

## Acceptance criteria

- การ์ดที่ช้า (goal/reflection) **ไม่บล็อก** ส่วนอื่นของ dashboard
- หนึ่ง request สร้าง Supabase client ครั้งเดียว
- lint + test + build ผ่าน · ไม่มีการเปลี่ยน behavior

## Comments

2026-07-14 (A): เสร็จแล้ว — ตรวจตาม skill `vercel-react-best-practices` ของ Vercel

**ความเสี่ยงที่ต้องพิสูจน์ก่อนลงมือ:** คู่มือ Next เขียนว่า `cache()` dedupe *"within a single render pass"*
→ **Server Action กับ Route Handler ไม่ใช่ render pass** ถ้ามัน throw = auth ล่มทั้งแอป
→ **ทดสอบจริงด้วยเบราว์เซอร์บน production build ก่อน**: login (server action ที่เรียก `createClient()` ที่ถูก cache) ผ่าน · เช็คอิน (server action เขียน DB) ผ่าน · dashboard render ผ่าน · 0 console errors
→ สรุป: `cache()` **ไม่ throw** นอก render — แค่ไม่ memoize ให้ ซึ่งปลอดภัย

**ผลลัพธ์:**

| กฎ | แก้อะไร |
|---|---|
| `server-cache-react` | `createClient()` + `getCurrentUser()` + `getProfile()` ห่อ `cache()` → **หนึ่ง request สร้าง client ครั้งเดียว ยิง auth ครั้งเดียว** (เดิม dashboard สร้าง 3 ตัว) |
| `async-suspense-boundaries` | `<Suspense>` ครอบ `CurrentGoalCard` / `ReflectionCard` → **การ์ดที่ช้าไม่บล็อกกราฟกับตาราง pattern อีกต่อไป** |
| `async-defer-await` | เริ่ม `getCheckins()` ก่อน `await searchParams` → 2 อย่างที่ไม่เกี่ยวกันไม่ต้องรอกัน |

**ตัวที่สำคัญที่สุดคือ Suspense** — มันไม่ได้แก้ปัญหาวันนี้ แต่**กันระเบิดของวันข้างหน้า**: พอ F5-01/F6-01 ทำให้การ์ดเรียก Gemini (~10 วิ) ถ้าไม่มี Suspense dashboard จะค้างทั้งหน้า

**เก็บกวาด:** ลบ `lib/auth/onboarding.ts` (signature เก่ารับ `supabase` + `userId`) → รวมเป็น `lib/auth/user.ts` ที่ cache แล้ว · ผู้เรียกทั้ง 4 จุดอัปเดตครบ

**ที่ตรวจแล้วผ่านอยู่แล้ว:** `bundle-barrel-imports` (Next optimize `lucide-react` ให้เอง) · `rendering-conditional-render` (ไม่มี `{number && ...}`) · `server-auth-actions` (ทุก action เช็ค user ก่อน)
