# INFRA-24: goal ของ demo account เน่าเมื่อข้ามสัปดาห์

Status: ready-for-agent
Owner: A
Sprint: 3
Priority: M — กระทบ demo วัน pitch โดยตรง (Prototype Quality)
Refs: scripts/seed.ts, src/components/goals/current-goal-card.tsx, src/lib/goals/week.ts

## อาการ

Dashboard ของปาล์มขึ้นการ์ด "เป้าหมายสัปดาห์นี้" เป็น empty state **"ยังไม่ได้ตั้งเป้าหมายสัปดาห์นี้"** เมื่อวันปัจจุบันข้ามไปสัปดาห์ ISO ใหม่หลังรัน seed

จับได้จาก e2e (`routes.spec.ts:164`) พังวันที่ 20 ก.ค. (จันทร์ = สัปดาห์ใหม่) ทั้งที่ 19 ก.ค. ยังเขียว

## Root cause

- `seed.ts` insert goal ด้วย `week_start: weekStart()` = สัปดาห์ที่รัน seed (ค่าคงที่)
- `getActiveGoals()` ดึงเฉพาะ goal ของสัปดาห์ปัจจุบัน (`weekStart()` ตอน query)
- พอข้ามสัปดาห์ → goal เดิม inactive → การ์ดขึ้น empty state

## ผลกระทบ

1. **Demo วัน pitch** — ถ้าไม่ re-seed ในสัปดาห์เดียวกับ pitch dashboard โชว์ "ยังไม่ได้ตั้งเป้าหมาย" กลางเวที (เสีย Prototype Quality)
2. e2e เปราะ — เคยพังเพราะ locator กำกวมด้วย (แก้แล้วใน QA-05: ใส่ `{ exact: true }`)

## ทางแก้ (เลือก)

- **สั้น (ทำแล้ว):** เพิ่ม checklist "re-run seed ในสัปดาห์ที่ pitch" ใน docs/pitch/README + แก้ e2e locator
- **ยั่งยืน (ค้าง):** ให้ seed ตั้ง goal แบบ relative หรือมี script `refresh-demo-week` ที่เลื่อน week_start ของปาล์มมาสัปดาห์ปัจจุบันโดยไม่ต้อง reseed ทั้งชุด — พิจารณาถ้ามีเวลา ก่อน freeze

## หมายเหตุ

ข้อมูล check-in ของปาล์มไม่เน่าแบบนี้ (ผูกกับ "กี่วันก่อน" ไม่ใช่ absolute week) — เฉพาะ goal ที่ผูก week_start
