# F7-02: ลบข้อมูลทั้งหมด / ลบบัญชี

Status: ready-for-human
Owner: 🟨 สิทธิ์+เป้าหมาย
Sprint: 1
Priority: M — ห้ามตัด (เกณฑ์ Privacy)
Refs: FR-7.2, docs/05 (on delete cascade)
Blocked by: 01

## งาน

- [ ] ปุ่ม "ลบข้อมูลทั้งหมด" (เหลือบัญชี) และ "ลบบัญชีถาวร" — confirm 2 ชั้นพิมพ์ยืนยัน
- [ ] ลบบัญชีผ่าน service role ฝั่ง server → cascade ลบทุกตาราง
- [ ] ทดสอบว่าไม่เหลือข้อมูลตกค้างตารางไหนเลย

## Acceptance criteria

- ลบบัญชีแล้ว query ทุกตารางด้วย user_id เดิม = 0 แถว (บันทึกหลักฐานใน Comments)

## Comments

---

2026-07-14 (kickoff → สาย 🟨): **เริ่มได้เดี๋ยวนี้ — โค้ดส่วนอันตรายเขียนให้แล้ว**

**โซนของคุณ (ไม่มีใครแตะ):** `src/app/(app)/settings/` · `src/app/(app)/goals/` · `src/app/(app)/reflection/` · `src/components/goals/` · `src/components/reflection/`

## 🛡️ ส่วนที่แตะ service role key (พลาดแล้วลบข้อมูลทั้งทีม) — A เขียนให้แล้ว

```tsx
import { deleteAllData, deleteAccount } from "@/lib/account/actions";
```

| ฟังก์ชัน | ทำอะไร |
| --- | --- |
| `deleteAllData()` | ลบข้อมูลทุกตาราง **เหลือบัญชี** → ผู้ใช้ต้อง onboarding ใหม่ |
| `deleteAccount()` | **ลบบัญชีถาวร** → cascade ลบทุกตาราง แล้ว sign out + เด้งไป `/login` |

**คุณทำแค่ UI:** ปุ่ม + **confirm 2 ชั้นแบบพิมพ์ยืนยัน** + ข้อความเตือนว่ากู้คืนไม่ได้

**ปิด AC ยังไง (พิสูจน์ว่าไม่เหลือแถวตกค้าง):**

```bash
npm run verify:user -- <email>     # รันก่อนลบ → จด user-id ที่พิมพ์ออกมา
# ... ลบผ่าน UI ...
npm run verify:user -- <user-id>   # รันหลังลบ → ต้องขึ้น "✅ ไม่เหลือข้อมูลตกค้าง"
```
**ก๊อปผลลัพธ์มาแปะใน Comments ของ issue นี้** = ปิด AC

⚠️ **ทดสอบกับบัญชีทิ้งที่สมัครใหม่เท่านั้น** ห้ามทดสอบกับบัญชีตัวเองหรือของเพื่อน

## งานถัดไปในสายคุณ

**F5-02 (หน้า goals)** — `src/app/(app)/goals/page.tsx` มี placeholder รออยู่แล้ว

```tsx
import { getGoals, getActiveGoals } from "@/lib/goals/queries";
import { recommendGoals, acceptGoal, toggleGoalDay, updateGoalStatus } from "@/lib/goals/actions";
import { SITUATION_LABELS, GOAL_STATUS_LABELS, MAX_ACTIVE_GOALS } from "@/lib/goals/types";
import { weekDates } from "@/lib/goals/week";
```

Flow: ไม่มี goal → ปุ่ม **"ขอคำแนะนำ"** → `recommendGoals()` คืน 2 ข้อเสนอ → **รับ / แก้ข้อความเอง / ขอใหม่** → `acceptGoal(title, situation)`
มี goal แล้ว → ติ๊กความคืบหน้ารายวัน `toggleGoalDay(id, date)` (ใช้ `weekDates()` วาด 7 ช่อง) → จบสัปดาห์ `updateGoalStatus(id, "done" | "dropped")`

- **จำกัด 2 goal/สัปดาห์** — `acceptGoal()` ปฏิเสธข้อที่ 3 พร้อมข้อความอธิบาย (แค่โชว์ `error` ที่มันคืนมา)
- **ข้อเสนอไม่ถูกบันทึกลง DB** จนกว่าจะกด "รับ" → refresh แล้วหายเป็นเรื่องปกติ
- **ภาษา `dropped` ห้ามตำหนิ** — ใช้ `GOAL_STATUS_LABELS.dropped` = "สัปดาห์นี้ไม่เหมาะ ไว้ลองใหม่"
- **การ์ด goal บน dashboard A วางให้แล้ว** ที่ `components/goals/current-goal-card.tsx` → **คุณไม่ต้องแตะ dashboard เลย**

**F6-02 (หน้าสรุปสัปดาห์)** — `src/app/(app)/reflection/page.tsx`

```tsx
import { getLatestReflection } from "@/lib/ai-outputs/queries";
import { generateReflection } from "@/lib/ai-outputs/actions";
```
`null` → ปุ่ม "สร้างสรุปสัปดาห์" · มีแล้ว → แสดง `{ daysRecorded, totalDays, pillars[{pillar, summary}], nextWeek }`
**การ์ดบน dashboard A วางให้แล้ว** เช่นกัน

---

2026-07-15 (A → 🟨): ⚠️ **ปุ่ม "ลบบัญชี" จะ error บนเครื่องคุณ — เป็นเรื่องปกติ ไม่ใช่โค้ดคุณผิด**

`deleteAccount()` ต้องใช้ **service role key** ซึ่งทีมตกลงกันว่า **A ถือคนเดียว** (มันข้าม RLS ได้ทั้งฐานข้อมูล = เห็นข้อมูลสุขภาพของทุกคน)

| ปุ่ม | เทสต์บนเครื่องตัวเองได้ไหม |
|---|---|
| **ลบข้อมูลทั้งหมด** (`deleteAllData`) | ✅ **ได้เต็ม** — ใช้ RLS client ปกติ |
| **ลบบัญชี** (`deleteAccount`) | ⚠️ ได้ถึงขั้นกดปุ่ม + ยืนยัน แล้วจะขึ้นข้อความบอกว่าเครื่องนี้ไม่มี key |

เดิมมันจะ **crash ทั้งหน้า** (`Error: SUPABASE_SERVICE_ROLE_KEY is not set`) แล้วคุณจะนึกว่าตัวเองเขียนผิด
**แก้แล้ว** — ตอนนี้คืนข้อความบอกตรง ๆ ว่าเป็นเรื่องปกติบน dev → **UI flow ทั้งเส้นเทสต์ได้ตามปกติ**

**สิ่งที่คุณต้องทำ:** วาง UI + ยืนยัน 2 จังหวะ + แสดง `error` ที่ action คืนมา · **ขั้นสุดท้าย A ตรวจบน production ให้** ด้วย `npm run verify:user` (พิสูจน์ว่าเหลือ 0 แถวทั้ง 5 ตาราง — เป็นหลักฐานปิด AC ของ issue นี้)
