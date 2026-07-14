# F2-02: กราฟ 3 pillars + energy

Status: ready-for-human
Owner: 🟦 กราฟ
Sprint: 1
Priority: M
Refs: FR-2.1, docs/05
Blocked by: 01

## งาน

- [ ] นอน: กราฟแท่งชั่วโมงนอนรายวัน + เส้นอ้างอิง 6 ชม. (จุดสังเกต ไม่ใช่เกณฑ์ตัดสิน)
- [ ] กิน: มื้อที่กิน/ข้ามรายวัน + จำนวนเครื่องดื่มหวาน
- [ ] เคลื่อนไหว: นาทีเคลื่อนไหวรายวัน แยกสีตามชนิด
- [ ] Energy: แถบ low/medium/high รายวัน วางให้เทียบสายตากับกราฟอื่นได้
- [ ] วันที่ไม่มีบันทึกแสดงเป็นช่องว่าง ไม่ใช่ศูนย์ (กันกราฟโกหก)

## Acceptance criteria

- ดูกราฟนอน + energy คู่กันแล้ว "เห็น" ความสัมพันธ์ได้ด้วยตาจาก seed data
- ไม่มีการให้คะแนน/เกรดสุขภาพที่ไหนเลย

## Comments

---

2026-07-14 (kickoff → สาย 🟦 กราฟ): **เริ่มได้เดี๋ยวนี้ ไม่ต้องรอใคร**

**โซนของคุณ (ไม่มีใครแตะ):** `src/components/dashboard/` · `src/app/(app)/dashboard/page.tsx`

**⚠️ อ่านก่อนเขียนโค้ดกราฟบรรทัดแรก** — โปรเจกต์มี skill ชื่อ `dataviz` ที่บอกกฎการทำกราฟไว้ครบ (สี, dark mode, วันขาดข้อมูล) **ขอให้ A รันให้ก่อน** จะได้ไม่ต้องรื้อทำใหม่

**ดึงข้อมูล — มีให้แล้ว ไม่ต้องแตะ Supabase เลย:**

```tsx
import { getCheckins } from "@/lib/checkins/queries";
import { MOVEMENT_TYPE_LABELS, DISRUPTOR_LABELS } from "@/lib/checkins/labels";

const checkins = await getCheckins(days);   // Checkin[] เรียงจากเก่าไปใหม่
```

**หน้า dashboard เป็น Server Component แล้ว** — รับ `?days=` จาก URL ให้เรียบร้อย ส่ง `Checkin[]` ลงมาให้เลย
คุณเขียนแค่ component กราฟที่รับ `checkins` เข้าไปวาด

**กฎที่ห้ามพลาด (มีในโจทย์):**

- **วันที่ไม่มีบันทึกต้องเป็นช่องว่าง ไม่ใช่ 0** — ไม่งั้นกราฟโกหก (วันที่ลืมกรอกจะดูเหมือนวันที่นอน 0 ชม.)
- **สีใช้ `--chart-1` ถึง `--chart-5` เท่านั้น** (นอน=1, กิน=2, เคลื่อนไหว=3) — ผูกกับ dark mode ให้แล้ว **ห้าม hardcode สี**
- **ห้ามให้คะแนน/เกรดสุขภาพที่ไหนเลย**
- ชื่อไทยของค่าต่าง ๆ ใช้จาก `labels.ts` **อย่าพิมพ์เอง**

**ความกว้างที่ต้องรองรับ 2 ขนาด:** มือถือ ~400px · เดสก์ท็อป ~640px (dashboard เป็น grid บนจอใหญ่แล้ว)

**งานถัดไปในสายคุณ:** F2-02 → F2-03 (disruptor overlay) → **F2-04 (ตาราง pattern)**

**F2-04 พร้อมให้ทำแล้ว** — ข้อมูลมีครบ:

```tsx
import { getLatestInsight } from "@/lib/ai-outputs/queries";
import { generateInsight } from "@/lib/ai-outputs/actions";
import { formatMetric } from "@/lib/ai-outputs/format";

const insight = await getLatestInsight(days);   // อ่าน cache เร็ว ไม่เรียก AI
// ถ้า null → โชว์ปุ่ม "วิเคราะห์" → กดแล้วเรียก generateInsight(days) (~10 วิ มี loading)
```

`insight.patterns[]` แต่ละตัวมี:

| ฟิลด์ | ใช้ทำอะไร |
| --- | --- |
| `pillars` | คอลัมน์ "ด้าน" |
| `observation` | คอลัมน์ "Pattern ที่พบ" |
| `meaning` | คอลัมน์ "ความหมาย" |
| `nextStep` | คอลัมน์ "Next Step" |
| `evidence.groupA / groupB` | **โชว์หลักฐาน** — `{label, days, value}` เช่น "นอนน้อยกว่า 6 ชม. (5 วัน)" |

**`evidence` สำคัญมาก** — โชว์ให้ผู้ใช้เห็นว่าตัวเลขมาจากไหน (`formatMetric(metric, value)` แปลงเป็นข้อความให้แล้ว) นี่คือสิ่งที่พิสูจน์ว่า AI ไม่ได้มโน

---

2026-07-15 (A → 🟦): ⚠️ **กับดักที่จะทำให้กราฟหายไปใน dark mode — อ่านก่อนเขียนโค้ด**

ผมทดสอบ stack กราฟทั้งเส้นให้แล้ว (`recharts@3.8` + shadcn `ui/chart.tsx` + token ของเรา) **ใช้ได้จริง** — แต่เจอบั๊ก 2 จุด แก้ให้แล้ว:

### 1. shadcn ผูก dark mode ไว้กับคลาส `.dark` — แต่แอปเราไม่มีคลาสนั้น

```ts
const THEMES = { light: "", dark: ".dark" }   // ← ของเดิมใน shadcn
```

dark mode ของเราคือ `@media (prefers-color-scheme: dark)` (ตามค่าเครื่อง) **ไม่มีคลาส `.dark` อยู่ที่ไหนเลยทั้งแอป**

**ผลถ้าไม่แก้ (วัดจริงบนเบราว์เซอร์):** ใช้ `theme: { light: "#003c33", dark: "#edfce9" }` แล้ว dark mode จะได้สี **light** มาใช้
→ แท่ง "นอน" สี `#003c33` บนพื้นหลัง `#17171c` = **contrast 1.44:1** → **แทบมองไม่เห็น**
→ และคุณจะไม่รู้เลย เพราะ **light mode ดูปกติดี**

**แก้แล้ว** — `chart.tsx` ฉีด `@media (prefers-color-scheme: dark)` แทน `.dark` · แต่ยังไงก็ **ใช้ `color: "var(--chart-N)"` เถอะ ง่ายกว่าและปลอดภัยกว่า**

### 2. `--chart-3` (เคลื่อนไหว) contrast ไม่ผ่านบนพื้นขาว

`#ff7759` บนขาว = **2.61:1** ต่ำกว่าเกณฑ์ non-text 3:1 ของ WCAG
→ เปลี่ยนเป็น `#ff5e3a` (เฉดเดิม 11° ความอิ่มตัวเดิม แค่เข้มขึ้น 6%) = **3.04:1** ✅ · dark mode คงเดิม (6.83:1)

### ✅ ยืนยันแล้วว่าใช้ได้ (build + เบราว์เซอร์จริง)

- recharts 3.8 เข้ากับ shadcn `chart.tsx` ได้ — **14 แท่ง + legend + tooltip render ครบ**
- token พลิก dark mode ถูกต้อง (`--color-sleep` → `#edfce9` เมื่อเครื่องเป็น dark)
- **ตัวอย่างโค้ดที่ใช้ได้จริงอยู่ใน `DESIGN.md` หัวข้อ "กราฟ"** — ก๊อปไปวางได้เลย

### 📌 อย่าลืม

- **นอน = `--chart-1` · กิน = `--chart-2` · เคลื่อนไหว = `--chart-3`**
- **วันที่ขาดบันทึก = ช่องว่าง ไม่ใช่ 0** (ปาล์มขาดบันทึกเสาร์-อาทิตย์ 2 สัปดาห์แรก → ถ้าพล็อตเป็น 0 จะอ่านว่า "นอน 0 ชม." ซึ่งไม่จริง)
- ล็อกอิน `palm@example.com / PalmDemo2026!` → มีข้อมูล 24 วันพร้อม pattern ให้เทสต์เลย
