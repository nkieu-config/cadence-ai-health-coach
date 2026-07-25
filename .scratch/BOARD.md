# Board — Cadence (อัปเดต 25 ก.ค. 2026)

## Pitch 30 ก.ค. · Code freeze 29 ก.ค.

## สถานะ: เสร็จ 65 / 69 งาน (ยกเลิก 1 · เหลือ 3)

✅ **Deliverable ครบ 14/14 แล้ว** — งานเขียนโค้ดที่โจทย์บังคับจบหมด · ที่เหลือคือ QA + การนำเสนอ
รายละเอียดว่า deliverable ข้อไหนอยู่ไฟล์ไหน → [docs/10](../docs/10-deliverables-checklist.md)

**ของที่ต้องรู้ตอนนี้:**

- โมเดล production = `gemini-3.1-flash-lite` โควตา **500 ครั้ง/วันทั้งแอปรวมกัน** (INFRA-23) — ถ้า `.env.local` ของใครยังมี `AI_MODEL` ให้ลบทิ้ง
- บัญชี demo **`palm@example.com / palmcadence123`** — มีข้อมูล 24 วัน + reflection 4 สัปดาห์ + pattern cache ไว้แล้ว เปิดมาเห็นเลย
- **บัญชีเทส `qa-bot@example.com / qabotcadence123`** — ข้อมูล 24 วันเหมือนปาล์ม สร้างไว้ให้เทสได้โดยไม่ต้องแตะปาล์ม · เละแล้วรัน `DEMO_EMAIL=qa-bot@example.com DEMO_PASSWORD=qabotcadence123 npm run seed` คืนสภาพ
- migration ล่าสุดบน production = **0005** (ตัวนับโควตาแก้เองไม่ได้แล้ว)
- CI บังคับ 2 ด่านทุก PR: `verify` (format/lint/tsc/test/build) + `e2e (เปิดแอปจริง)`

## งานที่เหลือ

| Issue | งาน | ใคร | หมายเหตุ |
| --- | --- | --- | --- |
| qa/02 | QA เต็มรอบ | ทุกคน | จับเวลาครบแล้ว (24 ครั้ง) · **FR ระดับ M เดินครบบน production แล้ว 25 ก.ค.** · เหลือ 3 อย่างที่เครื่องมือทำแทนไม่ได้ → **Google OAuth · เครื่องจริง 3 แบบ (iPhone Safari / Android / โปรเจกเตอร์)** · ดู [`qa-results.md`](qa-pitch/qa-results.md) |
| qa/03 | Pitch deck + ซ้อม | A + ทุกคน | โครงพร้อมที่ [docs/pitch/](../docs/pitch/) — เหลือทำสไลด์จริง + ชื่อคนพูดแต่ละสไลด์ · ซ้อม 2 รอบ 29 ก.ค. |
| f2/05 | Streak | 🟦 | ตัดได้ (Priority C) |
| ~~f4/06~~ | ~~markdown ในฟองแชท~~ | A | ✅ ปิดแล้ว 25 ก.ค. |
| ~~infra/20~~ | ~~อุดช่องโหว่โควตารีเซ็ต~~ | A | ✅ ปิดแล้ว 25 ก.ค. — migration 0005 ลง production · ยิงตรงด้วย JWT ผู้ใช้แล้วแก้/ลบตัวนับไม่ได้ |
| ~~infra/27~~ | ~~ปุ่มสลับ dark/light~~ | A | ✅ ปิดแล้ว (merge PR #88, 22 ก.ค.) |

3 สาย UI (🟦 กราฟ · 🟩 โค้ช · 🟨 สิทธิ์+เป้าหมาย) **หมดคิวบังคับแล้วทั้งหมด**

## บั๊กค้างจาก QA-02 (ไม่ได้เปิดเป็น issue — อยู่ในตารางข้อ 5 ของ [qa-results.md](qa-pitch/qa-results.md))

| # | อาการ | severity | สถานะ |
| --- | --- | --- | --- |
| 1 | รายงานสัปดาห์เอาเลขที่ถูกไปแปะป้ายผิด — "วันปกติคุณทานครบทุกมื้อ 0%" ทั้งที่ค่าจริงแปลว่าไม่เคยข้ามมื้อเช้าเลย | กลาง | 🔴 **ยังไม่แก้** — Feature 6 เป็นเกณฑ์ให้คะแนน |
| 2 | เรียก disruptor 3 ชื่อ: "วันพิเศษ" · "ปัจจัยรบกวน" (ไฟล์เดียวกัน) · "สิ่งรบกวนตาราง" | ต่ำ | 🟡 ยังไม่แก้ · ต้นตอคือ CONTEXT.md ไม่ได้กำหนดคำไทยของ Disruptor |
| 3 | ลบข้อมูลทั้งหมดแล้วเด้งไป onboarding เงียบ ๆ | กลาง | ✅ แก้แล้ว 25 ก.ค. |

## กติกาทีม

1. **เปิด issue ก่อนเขียนโค้ด** · 1 issue = 1 branch = 1 PR → `feat/<เลข issue>-<คำสั้น>`
2. **sync main 3 จังหวะ:** ก่อนเริ่มงาน · **ก่อน push/เปิด PR** ⭐ · เมื่อมีคนประกาศ merge

   ```bash
   git checkout main && git pull
   git checkout <branch ตัวเอง> && git merge main
   ```

3. **อยู่ในโซนไฟล์ของสายตัวเอง** — ต้องแตะนอกโซน **แจ้งกลุ่มก่อน** · **ห้ามลง npm package เอง** (lock file ชนกัน) → แจ้ง A
4. **ห้ามแตะ Supabase / Gemini ตรง ๆ** — เรียกผ่าน `src/lib/` เท่านั้น · type กลางอยู่ที่ `@/lib/domain` · วันที่ใช้ `today()`/`daysAgo()` จาก `lib/checkins/date.ts` ห้าม `new Date()`
5. **เช็ค `git config user.email`** ให้ตรงกับอีเมลที่ Verified บน GitHub ก่อน commit แรก — ไม่งั้นผลงานไม่ถูกนับ
6. **อย่าเทสด้วยบัญชีปาล์ม** — สมัครบัญชีทิ้งแทน · ปาล์มคือบัญชีที่ใช้ demo วัน pitch (ข้อความเทสจะโผล่บนจอตอนนำเสนอ)

กฎอื่นอยู่ในไฟล์ที่เป็นเจ้าของเรื่อง: ขั้นตอนก่อนเปิด PR → [README](../README.md) · กฎ UI → [DESIGN.md](../DESIGN.md) ส่วนแรก · กติกาสำหรับ AI agent → [AGENTS.md](../AGENTS.md)

## ก่อนวัน pitch

รัน `npm run refresh:demo-week` (อุ่น goal + insight/reflection ของปาล์มให้ตรงวัน — ของพวกนี้ผูกกับวันที่ จึงเก่าเองทุกวัน) · ขั้นตอนเช้าวันจริงทั้งหมดอยู่ใน [docs/pitch/demo-script.md](../docs/pitch/demo-script.md)
