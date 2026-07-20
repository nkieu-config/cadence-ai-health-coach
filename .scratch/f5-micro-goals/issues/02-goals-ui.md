# F5-02: Goals UI — รับ/ปรับ/ปฏิเสธ + ติ๊กรายวัน

Status: done
Owner: 🟨 สิทธิ์+เป้าหมาย (A แก้ต่อยอดใน PR #54)
Sprint: 2
Priority: M
Refs: FR-5.2
Blocked by: 01

## งาน

- [x] หน้า goals: goal ที่ระบบเสนอ (รับ/ขอตัวใหม่/แก้ข้อความเอง), goal ปัจจุบัน + ติ๊กความคืบหน้ารายวัน (`progress_dates`)
- [x] จบสัปดาห์ mark done/dropped ได้ — ภาษา dropped ต้องไม่ตำหนิ ("สัปดาห์นี้ไม่เหมาะ ไว้ลองใหม่")
- [x] การ์ด goal ปัจจุบันโผล่บน dashboard ด้วย

## Acceptance criteria

- เดินเรื่องครบ: เสนอ → รับ → ติ๊ก 3 วัน → จบสัปดาห์ → โผล่ใน weekly reflection (ประสาน F6-01)

## Comments

---

15 ก.ค. (A) — kickoff · **ไม่ต้องรอ F5-01** — `recommendGoals()` ใช้ได้แล้ววันนี้ AI มาเสียบทีหลังหน้าตาเดิม

**ไฟล์**

- สร้าง `src/components/goals/` — การ์ดข้อเสนอ + การ์ด goal พร้อมช่องติ๊ก 7 วัน
- แก้ `src/app/(app)/goals/page.tsx` — แทน placeholder · สร้าง `loading.tsx` คู่กัน
- **ห้ามแตะ dashboard** — การ์ด goal บนนั้นมีแล้ว (`components/goals/current-goal-card.tsx`)

**เรียกใช้**

- `getGoals()` / `getActiveGoals()` — `@/lib/goals/queries`
- `recommendGoals()` → 2 ข้อเสนอ · `acceptGoal(title, situation)` · `toggleGoalDay(id, date)` · `updateGoalStatus(id, "done" | "dropped")` — `@/lib/goals/actions`
- `weekDates()` — `@/lib/goals/week` → วันทั้ง 7 ของสัปดาห์ ไว้วาดช่องติ๊ก
- ป้ายชื่อ: `SITUATION_LABELS` `GOAL_STATUS_LABELS` `MAX_ACTIVE_GOALS` — `@/lib/goals/types`

**Flow:** ยังไม่มี goal → ปุ่ม "ขอคำแนะนำ" → รับ / แก้ข้อความเอง / ขอใหม่ → มี goal → ติ๊กรายวัน → จบสัปดาห์ done/dropped

**ระวัง**

1. ข้อเสนอ**ไม่ลง DB จนกว่าจะกด "รับ"** — refresh แล้วหายคือพฤติกรรมที่ถูก
2. เกิน 2 goal → `acceptGoal` คืน `error` พร้อมคำอธิบายเอง — แค่แสดง
3. ภาษา dropped ใช้ `GOAL_STATUS_LABELS.dropped` ("สัปดาห์นี้ไม่เหมาะ ไว้ลองใหม่") — ห้ามตำหนิ

---

17 ก.ค. (A) — **ปิด** · งานหลักโดย 🟨 ใน PR #54 · A แก้ต่อยอด (เจ้าของ PR ยังเป็น 🟨)

**ของ 🟨 ถูกต้องดี:** error handling ตรง shape จริงทุกจุด · `weekDates` เริ่มจันทร์ตรงกับ label จ./อ./... · เคารพ "ห้ามแตะ dashboard" · safety guardrail คุม goal ที่พิมพ์เอง · จำกัด 4 ไฟล์ (ยัด empty state ลง page)

**A แก้ 5 จุด (โค้ดทำงานได้อยู่แล้ว แต่ควรเก็บ):**

1. `window.location.reload()` × 3 → `router.refresh()` ตาม convention (checkin/reflection/delete-zone ใช้อยู่) — ติ๊กวันแล้วไม่แฟลชทั้งหน้า
2. ลบ `components/coming-soon.tsx` — ตายสนิทหลัง F5-02 (ตาม INFRA-21 สั่งลบตอนนี้)
3. กันติ๊กวันอนาคต — future days `disabled` + จางด้วย `opacity` (ไม่ใช่ alpha ในสี ไม่งั้น contrast guard แดง) · WCAG ยกเว้น disabled control
4. ลบ dead branch `Array.isArray(result)` + cast `as string` ที่ไม่จำเป็น (discriminated union narrow เอง)
5. `maxLength` ใช้ `GOAL_TITLE_MAX_LENGTH` แทน 80 hardcode

**พิสูจน์:** e2e **39/39** · format/lint/tsc/test 135 · build ผ่าน · เรนเดอร์จริง: future days จางแต่อ่านออก, past/today กดได้, วันเรียงถูก

**ค้างไว้ (ไม่ใช่ของใบนี้):** goal ทดสอบค้าง 2 อันของปาล์ม (ชื่อยาว "จันทร์/อังคาร/พุธ...") ยังอยู่ — ล้างก่อน pitch ตาม QA-03
