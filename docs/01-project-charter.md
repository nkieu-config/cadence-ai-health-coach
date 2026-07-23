# 01 — Project Charter

## ชื่อโปรเจกต์

**Cadence** — AI Personal Health Coach for Students and First Jobbers (Mission #5)

Production: https://personal-healthcoach.vercel.app/ · Repo: https://github.com/nkieu-config/ai-personal-health-coach-project

## เป้าหมาย

สร้าง prototype ระบบ AI wellness coach ที่ช่วยนักศึกษา/first jobber เห็น pattern พฤติกรรม กิน–นอน–เคลื่อนไหว ของตัวเอง และเริ่มปรับพฤติกรรมจาก micro goal เล็ก ๆ ที่ทำได้จริง โดยไม่ตัดสิน ไม่กดดันเรื่องรูปร่าง และไม่เกินขอบเขตทางการแพทย์ — พร้อมนำเสนอวัน **Pitching Day 30 ก.ค. 2026**

## ขอบเขต (Scope)

### In scope — Minimum Prototype ตามโจทย์ข้อ 7

1. Persona เดียว: "ปาล์ม" นักศึกษาปี 3 ช่วงทำ project/ใกล้สอบ (ADR-0001 ประกอบ)
2. Daily check-in ครอบคลุม 3 pillars ใช้เวลา ≤ 3 นาที
3. Dashboard สรุป กิน–นอน–เคลื่อนไหว
4. AI pattern analysis เชื่อมโยงกับตารางชีวิต (disruptor)
5. AI coaching conversation อย่างน้อย 1 flow
6. Micro goal recommendation
7. Weekly reflection report
8. Safety disclaimer + privacy design (RLS, ลบ/แก้ข้อมูลตัวเองได้)

### Out of scope (บันทึกเป็น limitations/future)

- Push notification / LINE integration
- เชื่อม wearable หรือ health API ภายนอก
- Dashboard ภาพรวมสำหรับองค์กร/มหาวิทยาลัย
- รองรับหลาย persona ในตัว product จริง
- นับแคลอรี วิเคราะห์รูปอาหาร หรือฟีเจอร์ใดที่แตะน้ำหนัก/รูปร่าง (ห้ามโดย guardrail ไม่ใช่แค่ตัดออก)

## การตัดสินใจหลัก (ดูรายละเอียดใน docs/adr/)

| เรื่อง | ตัดสินใจ | ADR |
|---|---|---|
| Platform | Responsive web app | 0001 |
| Stack | Next.js + Supabase + Tailwind/shadcn, deploy Vercel | 0002 |
| AI | Google Gemini free tier ผ่าน service module (ประตูเดียว · สลับรุ่นได้ด้วย env) | 0003 |
| Demo data | Seed data (demo account) + dogfooding ทีม 4 คน | 0004 |
| Auth | Google OAuth + email/password (Supabase Auth) | 0005 |

## ทีมและ Timeline

4 คน ทักษะ fullstack ใกล้เคียงกัน · **A (PM & SA) ทำเครื่องยนต์ (data layer + AI + safety) · อีก 3 สายทำหน้าจอเดินขนานกัน**

Sprint 0 (6–8 ก.ค.) setup → Sprint 1 (9–15) auth + check-in **เริ่ม dogfooding 13 ก.ค.** → Sprint 2 (16–22) AI ทั้งหมด → Sprint 3 (23–28) reflection + polish + pitch → **freeze 29 · Pitching Day 30 ก.ค.**

การแบ่งโซนไฟล์ รายละเอียดแต่ละ sprint และ risk register อยู่ใน [09-project-plan.md](09-project-plan.md)

## เกณฑ์ความสำเร็จ

- Demo workflow หลักได้ครบทั้ง 8 ข้อใน scope โดยไม่มี error ต่อหน้ากรรมการ
- ตอบเกณฑ์การให้คะแนนทั้ง 9 ข้อของโจทย์ได้ (mapping ใน [10-deliverables-checklist.md](10-deliverables-checklist.md))
- Deliverables 14 รายการครบ
- ทีมมีข้อมูล dogfooding จริง ≥ 2 สัปดาห์ไว้เล่าตอน pitch
