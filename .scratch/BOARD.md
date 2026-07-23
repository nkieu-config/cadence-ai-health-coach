# Board — Cadence (อัปเดต 23 ก.ค. 2026)

## Pitch 30 ก.ค. · Code freeze 29 ก.ค.

## สถานะ: เสร็จ 61 / 69 งาน (ยกเลิก 1 · เหลือ 7)

✅ **Deliverable ครบ 14/14 แล้ว** — งานเขียนโค้ดที่โจทย์บังคับจบหมด · ที่เหลือคือ QA + การนำเสนอ
รายละเอียดว่า deliverable ข้อไหนอยู่ไฟล์ไหน → [docs/10](../docs/10-deliverables-checklist.md)

**ของที่ต้องรู้ตอนนี้:**

- โมเดล production = `gemini-3.1-flash-lite` โควตา **500 ครั้ง/วันทั้งแอปรวมกัน** (INFRA-23) — ถ้า `.env.local` ของใครยังมี `AI_MODEL` ให้ลบทิ้ง
- บัญชี demo **`palm@example.com / PalmDemo2026!`** — มีข้อมูล 24 วัน + reflection 4 สัปดาห์ + pattern cache ไว้แล้ว เปิดมาเห็นเลย
- CI บังคับ 2 ด่านทุก PR: `verify` (format/lint/tsc/test/build) + `e2e (เปิดแอปจริง)`

## งานที่เหลือ

| Issue | งาน | ใคร | หมายเหตุ |
| --- | --- | --- | --- |
| qa/02 | จับเวลา check-in + QA เต็มรอบ | ทุกคน | 🔴 **เริ่ม 21 ก.ค.** ต้อง 3 วันติด × ≥4 คน · กรอกลง [`qa-results.md`](qa-pitch/qa-results.md) |
| qa/03 | Pitch deck + ซ้อม | A + ทุกคน | โครงพร้อมที่ [docs/pitch/](../docs/pitch/) — เหลือทำสไลด์จริง + screenshot · ซ้อม 2 รอบ 29 ก.ค. |
| f2/05 | Streak | 🟦 | ตัดได้ (Priority C) |
| f4/06 · infra/20 | markdown ในฟองแชท · อุดโควตารีเซ็ต | A | เก็บเล็ก ไม่บล็อกอะไร |
| ~~infra/27~~ | ~~ปุ่มสลับ dark/light~~ | A | ✅ merge แล้ว (PR #88, 22 ก.ค.) — เหลือปิด issue เป็น done |

3 สาย UI (🟦 กราฟ · 🟩 โค้ช · 🟨 สิทธิ์+เป้าหมาย) **หมดคิวบังคับแล้วทั้งหมด** → มาช่วย QA-02 กัน

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
