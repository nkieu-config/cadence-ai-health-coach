# INFRA-13: ทำให้บั๊กที่เคยชิปไปแล้ว เป็นไปไม่ได้ตั้งแต่ compile

Status: done
Owner: A
Sprint: 2
Priority: S
Refs: skill `typescript-advanced-types`, F3-05
Blocked by: —

## ที่มา

ตรวจ TypeScript ทั้ง repo ตามสกิล — และมันชี้กลับมาที่**บั๊กที่ผมชิปไปเองแล้ว**

## 🔴 ต้นเหตุเดียว ทำให้เกิด fallback เงียบ 3 จุด

`PatternCandidate.id` และ `.metric` เป็นแค่ `string` → ทุกอย่างที่ lookup ด้วยมันต้องมี fallback

| จุด | ผลถ้าลืม |
|---|---|
| `TEMPLATES: Record<string, Template>` → `if (!template) return null` | **candidate หายไปเฉย ๆ ไม่มีใครรู้** |
| `METRIC_LABELS[metric] ?? metric` | ผู้ใช้เห็น `high_energy_rate_next_day` โผล่กลางหน้าจอภาษาไทย |
| `formatMetric` → `default: String(value)` | ผู้ใช้เห็น `0.67` แทน `67%` |

**ข้อแรกเกิดขึ้นจริงแล้ว:** `eating-on-time-energy` ที่เพิ่มใน F1-05 **คำนวณเสร็จแล้วถูกกรองทิ้ง ไม่เคยขึ้นหน้าจอ** เพิ่งมาเจอตอนทำ F3-05
ตอนนั้นแก้ด้วย **test** ซึ่งจับได้ตอนรัน — แต่ type system ทำให้มัน**เขียนผิดไม่ได้ตั้งแต่แรก**

## แก้ยังไง

```ts
export type PatternId = "sleep-eating-skip-breakfast" | ... | "online-class-movement";   // 10 ตัว
export type PatternMetric = "skip_breakfast_rate" | ... | "high_energy_rate";            // 7 ตัว

export type PatternCandidate = { id: PatternId; metric: PatternMetric; ... };

const TEMPLATES: Record<PatternId, Template> = { ... };        // ครบทุกตัว ไม่งั้น compile error
export const METRIC_LABELS: Record<PatternMetric, string>;     // ครบทุกตัว
function formatMetric(metric: PatternMetric): string { switch (...) { default: { const unhandled: never = metric; ... } } }
```

`toInsightPattern()` เลิกคืน `| null` → `.filter(p => p !== null)` ทั่ว codebase หายไปด้วย

## ✅ พิสูจน์ว่ากันได้จริง — จำลองบั๊กเดิม

**เพิ่ม candidate ใหม่โดยลืม template:**

```
error TS2345: Argument of type '"sleep-and-mood"' is not assignable to parameter of type 'PatternId'.
```

**แก้ตามที่มันบอก (เพิ่ม id เข้า union) → มันบังคับต่อทันที:**

```
error TS2741: Property '"sleep-and-mood"' is missing in type '{...}'
              but required in type 'Record<PatternId, Template>'.
```

**โซ่ปิดสนิท — หลุดไม่ได้อีกแล้ว** · และ `verify-seed.ts` ก็ได้ประโยชน์: พิมพ์ pattern id ผิดตอนนี้เป็น compile error แทนที่จะรายงาน "❌ ไม่เจอ" เงียบ ๆ

## 🟡 `process.env.X!` → `lib/env.ts`

เพื่อนตั้ง `.env.local` ไม่ครบ → เดิมได้ error งง ๆ จาก Supabase · ตอนนี้ได้ **"ขาด environment variable: NEXT_PUBLIC_SUPABASE_URL — คัดลอก .env.example เป็น .env.local"**

⚠️ **กับดักที่เกือบพลาด — `env.ts` ต้องมีแต่ตัวแปร public เท่านั้น**
ถ้าเอา `SUPABASE_SERVICE_ROLE_KEY` มารวมด้วย แล้ว client component เผลอ import อะไรสักตัวจากโมดูลนี้ → **โมดูลทั้งก้อนถูกดึงเข้า browser bundle** · service role key อยู่ที่ `admin.ts` แยกต่างหากพร้อม check ของตัวเอง (ดีอยู่แล้ว)

**พิสูจน์แล้วทั้ง 2 ทาง (production build):**

- ✅ พอมี client component import `lib/supabase/client.ts` จริง → Next **inline `NEXT_PUBLIC_*` เข้า client bundle สำเร็จ** → `required()` ไม่ throw ในเบราว์เซอร์
- ✅ **ไม่มี service role key ใน `.next/static/` เลย**

## 📌 เจอระหว่างทาง: `lib/supabase/client.ts` เป็น dead code

ไม่มีใคร import เลยทั้ง repo → **เก็บไว้** เพราะ 🟩 อาจต้องใช้ถ้าทำ realtime และตอนนี้พิสูจน์แล้วว่ามันทำงานได้จริงเมื่อถูกเรียกใช้

## ✅ ที่ตรวจแล้วผ่าน

- **ไม่มี `any` เลยทั้ง repo**
- `Record<Enum, string>` ใน `labels.ts` / `goals/types.ts` เป็น exhaustive อยู่แล้ว → เพิ่ม enum โดยลืมชื่อไทย = compile error
- `as` ใน `mapper.ts` — ตอนนี้มี **CHECK constraint ใน DB หนุนหลัง** (INFRA-12) แล้ว ไม่ใช่การเดา
