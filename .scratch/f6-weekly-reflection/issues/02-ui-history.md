# F6-02: Reflection UI + ดูย้อนหลัง

Status: ready-for-human
Owner: 🟨 สิทธิ์+เป้าหมาย
Sprint: 3
Priority: M (ย้อนหลัง = S)
Refs: FR-6.1, FR-6.2
Blocked by: 01

## งาน

- [ ] หน้า reflection สัปดาห์ล่าสุด อ่านง่าย แบ่ง section ตามโครง
- [ ] เลือกดูสัปดาห์ก่อน ๆ ได้ (จาก `ai_outputs` cache)
- [ ] ปุ่มต่อยอด: "ตั้งเป้าสัปดาห์หน้า" → เข้า guided flow F4-03 (เกณฑ์ Reflection and Improvement)

## Acceptance criteria

- Demo account เห็น reflection ≥ 2 สัปดาห์
- กดจาก reflection ไปตั้ง goal ได้จบเส้น

## Comments

---

15 ก.ค. (A) — kickoff · **ไม่ต้องรอ F6-01** — โครงพร้อม reflection จริงมาเสียบทีหลังหน้าตาเดิม

**ไฟล์**

- แก้ `src/app/(app)/reflection/page.tsx` — แทน placeholder · สร้าง `loading.tsx` คู่กัน
- component เพิ่มลง `src/components/reflection/` (การ์ดบน dashboard มีแล้ว: `reflection-card.tsx` — ห้ามแตะ dashboard)

**เรียกใช้** — ทั้งหมดจาก `@/lib/ai-outputs/*`

- `getLatestReflection()` → `Reflection | null` · `null` = โชว์ปุ่ม "สร้างสรุปสัปดาห์" → `generateReflection()` (~10 วิ **ผูกปุ่มเท่านั้น**)
- `getReflections()` → ย้อนหลังทั้งหมด ใหม่→เก่า — ไว้ทำตัวเลือกดูสัปดาห์ก่อน (FR-6.2)
- โครง `Reflection`: `{ daysRecorded, totalDays, pillars: [{ pillar, summary }], nextWeek, periodStart, periodEnd }`

**ทำ:** หน้าอ่านสรุปล่าสุด แบ่ง section ตาม `pillars` + `nextWeek` · เลือกดูสัปดาห์เก่า · ปุ่ม "ตั้งเป้าสัปดาห์หน้า" → **ลิงก์ไป `/goals` ไปก่อน** (สลับเป็น guided flow เมื่อ F4-03 เสร็จ — จะมาคอมเม้นบอก)

**ระวัง:** AC "เห็น ≥ 2 สัปดาห์" ต้องรอ F6-01 ของ A สร้างข้อมูลจริงให้ปาล์ม — UI คุณจบก่อนได้เลย

---

15 ก.ค. (A) — F6-01 เสร็จแล้ว · **มีฟิลด์ใหม่เพิ่มเข้ามา ไม่บังคับใช้**

`Reflection` type เพิ่ม `strengths: string` (จุดแข็งที่ควรรักษาของสัปดาห์นั้น — ข้อความสั้น 1 ย่อหน้า เหมือน `nextWeek`) ของเดิมทั้งหมด (`daysRecorded` `totalDays` `pillars` `nextWeek`) **ยังหน้าตาเดิมทุกอย่าง ไม่ต้องแก้โค้ดที่มีอยู่**

ถ้าอยากโชว์เป็น section แยกในหน้า reflection ก็ใช้ `reflection.strengths` ได้เลย (ไม่บังคับ ถ้าไม่มีเวลาไม่ใส่ก็ได้ ไม่ทำให้อะไรพัง)
