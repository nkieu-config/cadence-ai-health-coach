# INFRA-11: วาง pattern component ก่อน 3 สายเริ่มเขียนของใหม่

Status: done
Owner: A
Sprint: 2
Priority: S — แต่ต้องทำ **ก่อน** 3 สายเริ่ม ไม่งั้นแก้ทีหลัง = แก้โค้ดคนอื่น
Refs: DESIGN.md, skill `vercel-composition-patterns`
Blocked by: —

## ที่มา

ตรวจ component API ตามกฎ composition ของ Vercel ก่อนปล่อย 3 สายลงเขียน component ใหม่

**ทำไมตอนนี้:** `components/coach/` **ยังว่างเปล่า** — 🟩 จะเขียน Chat UI จากศูนย์ และ Chat คือแหล่งกำเนิด boolean-prop hell คลาสสิกที่สุด

## ผลตรวจ

| กฎ | ผล |
|---|---|
| `architecture-avoid-boolean-props` | 🔴 **`isBackfill?: boolean`** ใน `CheckinForm` |
| `react19-no-forwardref` | ✅ ไม่มี `forwardRef` เลยทั้ง repo |
| `patterns-children-over-render-props` | ✅ ไม่มี `renderX` prop |
| `state-lift-state` | ✅ ไม่มี state ที่พี่น้องต้องแชร์กันแบบผิดที่ |
| `architecture-compound-components` | ✅ ยังไม่มี component ที่ซับซ้อนพอต้องใช้ |

### 🔴 `isBackfill` ซ่อน conditional ไว้ 2 จุด

```tsx
<CheckinForm date={date} existing={existing} />              // ...โหมดไหน?
<CheckinForm date={date} existing={existing} isBackfill />
```

ข้างในมันแตกเป็น 2 พฤติกรรม:

1. **guard เที่ยงคืน** — `if (!isBackfill && today() !== date)` (หน้า `/checkin` derive วันเอง ถ้าเปิดค้างข้ามเที่ยงคืนต้องกัน · หน้า edit วันมาจาก URL ไม่ต้องกัน)
2. **ชื่อหัวข้อ** — `date === today() ? "เช็คอิน" : "บันทึกย้อนหลัง"`

boolean 1 ตัว = 2 สถานะ · เพิ่มอีกตัว = 4 · นี่คือจุดเริ่มของ conditional ที่ maintain ไม่ไหว

## งาน

- [x] แตกเป็น variant ที่ชัดเจน: `TodayCheckinForm` + `BackfillCheckinForm` (ตามกฎ `patterns-explicit-variants`)
- [x] `CheckinForm` เหลือเป็น "เครื่องยนต์" ที่**ไม่รู้จักคำว่า backfill อีกเลย** — รับ `heading` + `beforeSave?` (inject พฤติกรรม ไม่ใช่ flag)
- [x] เขียนกฎ composition ลง DESIGN.md **พร้อมตัวอย่าง Chat message ที่ 🟩 กำลังจะเขียน**

## Acceptance criteria

- ไม่มี boolean prop ที่คุม behavior เหลือใน `src/components/` (นอก `ui/`)
- อ่าน call site แล้วรู้ทันทีว่าเรนเดอร์อะไร ไม่ต้องเปิดเข้าไปดูข้างใน
- lint + test + build ผ่าน · เช็คอิน + บันทึกย้อนหลัง ยังทำงานเหมือนเดิม (ทดสอบบนเบราว์เซอร์จริง)

## Comments

2026-07-15 (A): เสร็จแล้ว — ตรวจตาม skill `vercel-composition-patterns`

**แก้ `isBackfill` แล้ว** — call site อ่านรู้เรื่องทันทีโดยไม่ต้องเปิดเข้าไปดูข้างใน

```tsx
<TodayCheckinForm date={date} existing={existing} />       // มี guard เที่ยงคืน
<BackfillCheckinForm date={date} existing={existing} />    // ไม่ต้องมี
```

`CheckinForm` เหลือเป็นเครื่องยนต์ที่**ไม่รู้จักคำว่า "backfill" อีกเลย** — รับแค่ `heading` + `beforeSave?` (ฉีดพฤติกรรมเข้าไป ไม่ใช่ flag) · ผลพลอยได้: ternary ที่ซ่อนอยู่ในชื่อหัวข้อ (`date === today() ? ... : ...`) หายไปด้วย

**ทดสอบด้วยเบราว์เซอร์จริงบน production build** — refactor นี้แตะฟอร์มเช็คอินที่ทีม dogfood ทุกวัน จะเชื่อแค่ tsc ไม่ได้:

| | ผล |
|---|---|
| หัวข้อ 2 variant | "เช็คอิน · กิน" / "บันทึกย้อนหลัง · กิน" ✅ |
| **บันทึกย้อนหลัง** (10 ก.ค.) | ✅ สำเร็จ · **guard ไม่บล็อกผิด** ← ความเสี่ยงหลักของ refactor นี้ |
| **เช็คอินวันนี้** (15 ก.ค.) | ✅ สำเร็จ · guard ปล่อยผ่านถูกต้อง |

**ของสำคัญที่สุดที่ได้จากงานนี้: กฎ + ตัวอย่างใน DESIGN.md สำหรับ 🟩**

`components/coach/` ยังว่างเปล่า — 🟩 จะเขียน Chat UI จากศูนย์ และแชทมี state เยอะมาก (กำลังส่ง / ส่งพลาด / โควตาหมด / ครบ 5 ข้อความ / รอโค้ชตอบ)
**ถ้าเริ่มด้วย `<Message isUser isPending isFailed />` จะกลายเป็นนรก conditional ภายใน 2 วัน**
→ DESIGN.md มีตัวอย่าง `<UserMessage>` / `<CoachMessage>` / `<CoachThinking>` / `<RetryPrompt>` ให้ก๊อปแล้ว พร้อมเตือนเรื่อง `retryCoachReply()` ห้ามเรียก `sendCoachMessage()` ซ้ำ

**ที่ตรวจแล้วผ่านอยู่แล้ว:** ไม่มี `forwardRef` เลยทั้ง repo (React 19 ✅) · ไม่มี `renderX` prop · ไม่มี state ที่พี่น้องต้องแชร์แบบผิดที่
