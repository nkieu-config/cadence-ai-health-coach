# 09 — Project Plan (6–30 ก.ค. 2026)

> **ปรับแผนครั้งที่ 2 — 14 ก.ค. 2026** · แผนเดิมแบ่งงานเป็นรายคน (A/B/C/D) คนละ feature เต็มเส้น (UI+API+AI)
> ปัญหาที่เจอจริง: **คอขวดอยู่ที่ AI + data layer** ซึ่งกองอยู่กับคนเดียว ส่วนคนอื่นต้องรอ
> แผนใหม่: **A ทำ "เครื่องยนต์" ทั้งหมด (data layer + AI + safety) · อีก 3 สายทำ "หน้าจอ" ขนานกัน 100%**

## ทีมและการแบ่งงาน

| สาย | ขอบเขต | โซนไฟล์ (ไม่ทับกันเลย) |
|---|---|---|
| **A (PM & SA)** | **เครื่องยนต์**: data layer ทุกตัว, Gemini ทุกจุด, Safety/Privacy 🔒 ทุกข้อ, seed, pitch deck | `lib/**`, `scripts/**`, `supabase/**`, `docs/**` |
| 🟦 **กราฟ** | F2 Dashboard (FR-2.x) | `components/dashboard/`, `app/(app)/dashboard/` |
| 🟩 **โค้ช** | F4 Coach UI (FR-4.1, 4.3, 4.5) | `app/(app)/coach/`, `components/coach/` |
| 🟨 **สิทธิ์+เป้าหมาย** | F7 ลบข้อมูล + F5 Goals UI + F6 Reflection UI | `app/(app)/settings/` `goals/` `reflection/`, `components/goals/` `components/reflection/` |

**หลักการที่ทำให้ขนานได้จริง:** 3 สาย**ไม่แตะ Supabase / Gemini โดยตรง** — เรียกฟังก์ชันที่ A เขียนไว้ใน `src/lib/` เท่านั้น
AI ที่ยังไม่เสร็จถูกแทนด้วย **stub ที่คืนข้อมูลจริงในรูปทรงสุดท้าย** → เมื่อ A เปลี่ยน stub เป็น Gemini จริง **signature ไม่เปลี่ยน 3 สายไม่ต้องแก้โค้ดสักบรรทัด**

กติกา: 1 issue = 1 branch = 1 PR, review ขั้นต่ำ 1 คน, merge เข้า `main` = deploy อัตโนมัติ, ห้ามลง npm package เอง (แจ้ง A), issue ทั้งหมดอยู่ที่ `.scratch/` — ดูสรุปที่ [`.scratch/BOARD.md`](../.scratch/BOARD.md)

## Sprint Plan

### ✅ Sprint 0: Foundation (จ. 6 – พ. 8 ก.ค.) — เสร็จ

repo + Next.js + Tailwind/shadcn + Vercel + Supabase schema + RLS + Gemini spike (`lib/ai`) + แตก issue ทั้งหมด
*(INFRA-05 wireframes — ยกเลิก: `DESIGN.md` + UI จริงแซงหน้าไปแล้ว)*

### ✅ Sprint 1: Check-in + โครง (พฤ. 9 – พ. 15 ก.ค.) — เสร็จก่อนกำหนด

| งาน | สถานะ |
|---|---|
| F0 auth (Google + password) + onboarding + disclaimer | ✅ |
| F1 check-in ครบเส้น: ฟอร์ม → บันทึก → แก้/ลบย้อนหลัง → สรุปหลังบันทึก | ✅ |
| F2-01 dashboard layout + ช่วง 7/14/30 · F3-01 `lib/patterns` · F7-01 หน้า privacy | ✅ |
| UI/UX pass: touch target 44px, dark mode, sidebar เดสก์ท็อป, safe-area | ✅ |
| **Data layer ครบ 5 ตัว** (`checkins` `account` `chat` `ai-outputs` `goals`) + scaffold ทุก route | ✅ |
| **ปิดช่องโหว่โจทย์ข้อ 5** (migration 0002): เวลามื้อแรก, ของว่าง/ผัก-ผลไม้, ความรู้สึกหลังขยับ, ช่วงที่งานหนัก | ✅ |

**เช็คพอยต์ ศ. 12 ก.ค.: check-in ใช้งานจริงบน production** ✅ → **dogfooding เริ่ม จ. 13 ก.ค.** (ADR-0004)

### Sprint 2: AI + 3 สายเดินขนาน (พฤ. 16 – พ. 22 ก.ค.)

| งาน | เจ้าของ |
|---|---|
| F3-02 guardrail 🔒 → F3-03 insight (Gemini จริง) → F3-04 ข้อมูลไม่พอ 🔒 | A |
| F4-02 coach context → F4-04 escalation 🔒 | A |
| F5-01 goal AI + validation คำต้องห้าม 🔒 | A |
| **INFRA-06 seed ปาล์ม 4 สัปดาห์** ⚠️ ใช้ service role — A เท่านั้น | A |
| F2-02 กราฟ 3 pillars → F2-03 disruptor overlay → F2-04 ตาราง pattern | 🟦 |
| F4-01 Chat UI + ประวัติ → F4-05 ลบประวัติ → F4-03 guided goal flow | 🟩 |
| F7-02 ลบข้อมูล/บัญชี 🔒 → F5-02 หน้า goals | 🟨 |
| รวบรวม feedback dogfooding รอบแรก ปรับ check-in ให้เบาลง | A |

**เช็คพอยต์ พ. 22 ก.ค.:** workflow หลักครบทุกเส้นบน production (ยังไม่ polish)

### Sprint 3: Reflection + Polish + Pitch (พฤ. 23 – อ. 28 ก.ค.)

| งาน | เจ้าของ |
|---|---|
| F6-01 weekly reflection (Gemini จริง) | A |
| F6-02 หน้า reflection + ย้อนหลัง | 🟨 |
| F2-05 streak *(Priority C — ตัดได้ถ้าไม่ทัน)* | 🟦 |
| Polish UI ทุกหน้า, empty states, loading states | 🟦 🟩 🟨 |
| QA-01 AI safety checklist 10 ข้อ 🔒 — รันและบันทึกผลลง `.scratch/ai-safety-test/` | A |
| QA-02 QA เต็มรอบตาม demo script + **จับเวลา check-in จริง (หลักฐาน FR-1.2)** | ทุกคน |
| QA-03 pitch deck + demo script (เดินเรื่องด้วย persona ปาล์ม) + screenshot สำรอง | A |
| QA-04 limitations & future improvements (deliverable 14) | A |

### Freeze & Pitch

- **พ. 29 ก.ค.:** Code freeze เที่ยง → ซ้อม pitch 2 รอบกับ demo account จริง จับเวลา แบ่งคนพูด
- **พฤ. 30 ก.ค.: Pitching Day**

## Risk Register

| ความเสี่ยง | โอกาส | ผลกระทบ | แผนรับมือ |
|---|---|---|---|
| **โควตา Gemini ฟรี = 20 ครั้ง/วัน ทั้งแอป** (วัดจริง 14 ก.ค.) | **สูง** | **สูง** | **INFRA-07** — cache ต้องกันการยิงซ้ำจริง · จำกัดแชทต่อคนต่อวัน · generate ของ demo ล่วงหน้า 1 วัน · key สำรองพร้อมสลับใน Vercel · screenshot สำรอง (ADR-0003) |
| 3 สายทำ UI ไม่ทัน | กลาง | สูง | ทุกสายเริ่มได้ทันทีตั้งแต่ 14 ก.ค. (ฟังก์ชันพร้อมหมดแล้ว) · ถ้าสายไหนช้า A เข้าไปช่วยได้เพราะไม่ติดคอขวด AI แล้ว |
| ทีมมีสอบ/ภาระอื่นกลางทาง | สูง | กลาง | งานแต่ละสายเป็น issue เล็ก merge ทีละอัน — คนอื่นรับช่วงต่อได้ · งาน M น้อยกว่า capacity |
| AI output หลุด guardrail ตอน demo | ต่ำ | สูง | Guardrail อยู่ใน `lib/ai` ประตูเดียว + `lib/safety/language.ts` บังคับด้วย CI + safety checklist 10 ข้อก่อน freeze |
| Scope creep | สูง | กลาง | ทุกไอเดียใหม่เข้า `.scratch/` เป็น future ก่อน — ตัดสินโดยยึด M/S/C ใน docs/04 · **สิ่งที่โจทย์ข้อ 5–9 ขอ ไม่ใช่ scope creep — ต้องมี** |

## Definition of Done (ต่อ feature)

1. ตรง requirement (FR ระดับ M ครบ)
2. ผ่าน PR review 1 คน
3. ใช้งานได้บน production (Vercel) ไม่ใช่แค่ localhost
4. AI output (ถ้ามี) ผ่าน guardrail — ไม่มีคำต้องห้าม ภาษาไม่ตัดสิน
5. Responsive มือถือ + desktop
6. **🔒 = ห้ามตัดทิ้งแม้เวลาไม่พอ** (FR-0.3, FR-3.3, FR-4.4, FR-5.3, FR-7.x — เกณฑ์ Safety/Privacy โดยตรง)
