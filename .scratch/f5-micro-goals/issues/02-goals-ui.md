# F5-02: Goals UI — รับ/ปรับ/ปฏิเสธ + ติ๊กรายวัน

Status: ready-for-human
Owner: 🟨 สิทธิ์+เป้าหมาย
Sprint: 2
Priority: M
Refs: FR-5.2
Blocked by: 01

## งาน

- [ ] หน้า goals: goal ที่ระบบเสนอ (รับ/ขอตัวใหม่/แก้ข้อความเอง), goal ปัจจุบัน + ติ๊กความคืบหน้ารายวัน (`progress_dates`)
- [ ] จบสัปดาห์ mark done/dropped ได้ — ภาษา dropped ต้องไม่ตำหนิ ("สัปดาห์นี้ไม่เหมาะ ไว้ลองใหม่")
- [ ] การ์ด goal ปัจจุบันโผล่บน dashboard ด้วย

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
