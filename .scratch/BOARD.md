# Board — HealthCoach (อัปเดต 13 ก.ค. 2026)

ภาพรวมว่าใครทำอะไร — **วิธีเริ่มงานอยู่ใน kickoff comment ของ issue แรกของสายตัวเอง** (บอกครบว่าเริ่มตรงไหน มีอะไรก๊อปใช้ได้บ้าง)

> 🧱 **โครงแอปวางให้แล้ว** — `src/app/(app)/layout.tsx` จัดการ login guard + เมนู + safety notice ให้ทุกหน้าอัตโนมัติ
> หน้าของแต่ละคนมี **placeholder** รออยู่แล้ว → **แค่แทนที่เนื้อหาในไฟล์ของตัวเอง** ไม่ต้องสร้างหน้าใหม่ ไม่ต้องเขียน guard เอง

## สถานะ: เสร็จ 11 / 37 งาน

- ✅ **Sprint 0 (infra)** — repo, Supabase + RLS, Vercel, Gemini พร้อมหมด
- ✅ **F0** — สมัคร/ล็อกอิน (Google + รหัสผ่าน), onboarding, disclaimer
- ✅ **F1 check-in ครบทั้งสาย** — ฟอร์ม + บันทึก + แก้ย้อนหลัง/ลบ + สรุปหลังบันทึก → **เริ่ม dogfooding ได้ ทุกคนกรอกทุกวัน**

## ใครทำอะไร — 4 สาย ทำพร้อมกันได้ ไม่ต้องรอกัน

| สาย | ตอนนี้ใครถือ | งานตามลำดับ | โฟลเดอร์ของสาย | Branch |
| --- | --- | --- | --- | --- |
| **Check-in** | ✅ **เสร็จทั้งสาย** | F1-01 ✅ F1-02 ✅ F1-03 ✅ F1-04 ✅ | `app/checkin/` | — |
| **Dashboard** | **B** | F2-01 layout → F2-02 กราฟ | `app/dashboard/` | `feat/f2-01-…` |
| **AI** | **C** | F3-01 patterns → F3-02 guardrail | `lib/patterns/`, `lib/ai/` | `feat/f3-01-…` |
| **Privacy** | **D** | F7-01 หน้า privacy → F7-02 ลบข้อมูล | `app/settings/` | `feat/f7-01-…` |
| **Seed data** | **A** (ทำอยู่) | INFRA-06 seed script | `scripts/seed.ts` | `feat/infra-06-…` |

### ชื่อ branch (ตกลง 13 ก.ค.)

**1 issue = 1 branch = 1 PR** → `feat/<เลข issue>-<คำสั้น>` เช่น `feat/f2-01-dashboard-layout`
(PR เล็ก รีวิวง่าย merge ไว · GitHub ลบ branch ให้เองหลัง merge)

## กติกา 5 ข้อ

1. **วันแรก:** clone → ขอ `.env.local` จาก A → `npm run dev` ให้ขึ้นได้ → **เปิด PR จิ๋ว 1 อันลองระบบก่อน** (ยังไม่มีใครเคย push เลย ลองให้ชินก่อนลงงานจริง)
2. **1 สาย = 1 branch** · PR เล็ก merge บ่อย **อย่าดองเกิน 2 วัน**
3. **อยู่ในโฟลเดอร์ของสายตัวเอง** — ถ้าต้องแตะไฟล์ของคนอื่น ให้ **แจ้งกลุ่มก่อน**
   **npm package:** ที่ต้องใช้ติดตั้งให้ครบแล้ว (กราฟ + test) — ถ้าจำเป็นต้องเพิ่มจริง ๆ **ห้ามลงบน branch ตัวเอง** (จะทำ `package-lock.json` ชนกัน) ให้แจ้งกลุ่ม → A ลงบน main → ทุกคน `git pull` + `npm install`
4. **ห้ามแก้ฐานข้อมูลเอง** — ถ้าเจอว่าต้องเพิ่ม/แก้คอลัมน์ ให้แจ้งกลุ่ม แล้วให้ **A เขียน migration ใหม่** (DB ใช้ร่วมกันทั้งทีม ถ้าต่างคนต่างแก้จะพังหมด)
   **ห้ามเรียก `supabase.from("checkins")` ตรง ๆ** — อ่าน/เขียน/ลบ check-in ผ่าน `src/lib/checkins/` เท่านั้น (`getCheckins`, `getCheckinByDate`, `saveCheckin`, `deleteCheckin`) เพราะ DB เป็น snake_case แต่ type เป็น camelCase — มีประตูเดียว แก้ที่เดียว
   **ห้ามหาวันที่เองด้วย `new Date()`** — ใช้ `today()` / `daysAgo()` จาก `src/lib/checkins/date.ts` (เซิร์ฟเวอร์ Vercel เป็น UTC ถ้าหาเอง คนกรอกตอนตี 1 จะถูกนับเป็นเมื่อวาน)
   **ชื่อไทยของค่าต่าง ๆ** (disruptor, มื้ออาหาร, ระดับพลังงาน ฯลฯ) ใช้จาก `src/lib/checkins/labels.ts` อย่าพิมพ์เอง จะได้ตรงกันทั้งแอป
   **คำต้องห้ามตาม CONTEXT.md** (น้ำหนัก/รูปร่าง/แคลอรี + คำตัดสิน) อยู่ที่ `src/lib/safety/language.ts` — ทั้งข้อความ template และ output ของ AI ใช้รายการเดียวกัน **ห้ามสร้างรายการชุดที่สอง**
5. **ส่งไม้ต่อ (ตอนสลับคน):** คนเดิมเขียน comment ใน issue ว่า **ทำถึงไหน / เหลืออะไร / ติดอะไร** → merge PR ที่ค้างให้จบ → แก้ช่อง "ตอนนี้ใครถือ" ในตารางข้างบน
6. **UI ใช้ theme กลาง** — สี/ฟอนต์/มุมโค้ง ฝังใน `globals.css` แล้ว เขียนด้วย class ปกติ (`bg-primary` ฯลฯ) **ห้าม hardcode สี** · แนวทางเต็มอยู่ท้ายไฟล์ `DESIGN.md`

## จุดที่ต้องรอกัน (มีแค่ 3 จุด นอกนั้นอิสระ)

1. ~~F1 ขึ้น prod~~ ✅ **13 ก.ค. — ทุกคนเริ่มบันทึก check-in จริงได้แล้ว (dogfooding)**
2. **Seed script เสร็จ (~15 ก.ค.)** → B เลิกใส่ข้อมูลมือ มาใช้ seed แทน
3. **C ประกาศรูปแบบ JSON ของ insight (ต้น Sprint 2)** → B เอาไปทำ pattern table ต่อ

---

## รายการงานทั้งหมด

### Sprint 1 (ถึง 15 ก.ค.)

| Issue | งาน | คนถือ | สถานะ |
| --- | --- | --- | --- |
| f0/01–03 | Auth + onboarding + disclaimer | A | ✅ |
| f1/01 | Check-in form | A | ✅ |
| f1/02 | Check-in API (upsert) | A | ✅ |
| f1/03 | แก้/ลบ check-in ย้อนหลัง | A | ✅ |
| f1/04 | สรุปสั้นหลังบันทึก | A | ✅ |
| f2/01 | Dashboard layout | B | ⬜ |
| f2/02 | กราฟ 3 ด้าน | B | ⬜ |
| f3/01 | lib/patterns + tests | C | ⬜ |
| f3/02 | System prompt guardrail 🔒 | C | ⬜ เกือบเสร็จ (เหลือรัน + บันทึกผล) |
| f7/01 | หน้า privacy 🔒 | D | ⬜ |
| f7/02 | ลบข้อมูล/บัญชี 🔒 | D | ⬜ |
| infra/05 | Wireframes | — | ⬜ ข้ามได้ (ทำ UI ตรงไปแล้ว) |

### Sprint 2 (16–22 ก.ค.) — AI

| Issue | งาน | คนถือ |
| --- | --- | --- |
| f3/03 | Insight endpoint + cache | C |
| f3/04 | เคสข้อมูลไม่พอ 🔒 | C |
| f4/01–05 | AI coach (แชท, context, ตั้งเป้า, escalation 🔒) | C |
| f5/01 | แนะนำ micro goal + validation 🔒 | C |
| f5/02 | หน้า goals | B |
| f2/03–04 | Disruptor overlay + pattern table | B |
| infra/06 | Seed script | A |

### Sprint 3 (23–28 ก.ค.) — Polish + Pitch

| Issue | งาน | คนถือ |
| --- | --- | --- |
| f6/01–02 | Weekly reflection | C + B |
| f2/05 | Streak (ทำถ้าว่างเท่านั้น) | B |
| qa/01 | AI safety checklist 10 ข้อ 🔒 | C + D |
| qa/02 | QA เต็มรอบ | ทุกคน |
| qa/03 | Pitch deck + demo script | A |
| qa/04 | Limitations & future | A |

## สัญลักษณ์

- ⚠️ = **เร่งด่วน** ทั้งทีมรออยู่
- 🔒 = **ห้ามตัดทิ้งแม้เวลาไม่พอ** (เป็นเกณฑ์ให้คะแนน Safety / Privacy โดยตรง)

## หมายเหตุโหลดงาน

**C หนักสุด** — Sprint 2 แบก AI เกือบทั้งหมด (F3 → F4 → F5) ถ้าเริ่มช้าจะเป็นคอขวด → **ให้ C เริ่มก่อนเพื่อน**
ถ้า C ไม่ไหว งานที่โอนออกง่ายสุดคือ **f4/01 (Chat UI)** ให้ B หรือ D ช่วย
