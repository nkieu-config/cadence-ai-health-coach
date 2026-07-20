# Board — HealthCoach (อัปเดต 20 ก.ค. 2026)

## Pitch 30 ก.ค. · Code freeze 29 ก.ค. · เหลือ 10 วัน

> 🎯 **หลักการจัดงาน: A สร้าง "เครื่องยนต์" · 3 สายสร้าง "หน้าจอ"**
> ทุกอย่างที่แตะ **Supabase / Gemini / service role / Safety 🔒** เป็นของ A
> **3 สายเรียกฟังก์ชันที่มีอยู่แล้ว → วาด UI → จบ** ไม่ต้องแตะ DB ไม่ต้องแตะ AI ไม่มีไฟล์ทับกัน

## สถานะ: เสร็จ 59 / 65 งาน (ยกเลิก 1) — เหลือ 5 (บังคับจริงแค่ QA-02 + QA-03)

> ✅ **Deliverable ครบ 14/14 แล้ว (20 ก.ค.)** — F2-04 ปิดโดย A วางฐาน + แพรรี่ต่อยอดตารางเดสก์ท็อป (PR #63/#64/#66) · ที่เหลือ = QA + การนำเสนอล้วน ๆ
> **QA-01 Safety ปิดสมบูรณ์แล้ว** — 20/20 บน `gemini-3.1-flash-lite` + คีตะเซ็นตรวจอิสระ (PR #58)
> **เปลี่ยนโมเดลแล้ว (INFRA-23):** production = `gemini-3.1-flash-lite` โควตา **500 ครั้ง/วัน** (เดิม 20) — ทุกคน**ลบ `AI_MODEL` ออกจาก `.env.local` ตัวเอง**ถ้ายังมี

- ✅ **Sprint 0** — repo · Supabase + RLS · Vercel · Gemini
- ✅ **F0** — สมัคร/ล็อกอิน (Google + รหัสผ่าน) · onboarding · disclaimer
- ✅ **F1** — เช็คอิน · บันทึก · แก้/ลบย้อนหลัง · สรุปหลังบันทึก · **F1-05 ปิดช่องโหว่โจทย์ข้อ 5**
- ✅ **F2-01** dashboard layout · **F3-01 / F3-05** lib/patterns (ตาราง Feature 2 ครบ 3 แถว) · **F7-01** หน้า privacy
- ✅ **Data layer ครบ** — `checkins` · `account` · `chat` · `ai-outputs` · `goals`
- ✅ **F3-02 guardrail 🔒** — รัน checklist 10 เคสจริง เจอรูรั่ว 4 จุด แก้หมด · หลักฐาน `.scratch/ai-safety-test/`
- ✅ **เครื่องยนต์ AI ครบ** — F3-03 insight · F3-04 ข้อมูลไม่พอ 🔒 · F4-02 coach context · F5-01 goal AI 🔒 · F4-04 escalation 🔒 · F6-01 weekly reflection · ทุกตัวพิสูจน์ด้วย Gemini จริง + fallback ปลอดภัยเมื่อ AI ล่ม
- ✅ **INFRA-07 โควตา** — cache-first + จำกัดแชท 5 ข้อความ/คน/วัน + ข้อความโควตาหมดเป็นมิตร
- ✅ **INFRA-06 seed "ปาล์ม"** — 24 วันบน production · pattern ครบ 3 แถว · **`palm@example.com / PalmDemo2026!`**
- ✅ **INFRA-08→15 ก่อนเปิดสาย (PR #22)** — DESIGN.md ขึ้นกฎแอปก่อน · loading/nav feedback · Suspense กันการ์ดบล็อก · แยกฟอร์มแทน boolean prop · RLS เร็วขึ้น + CHECK กันข้อมูลขยะ · type ปิดบั๊ก pattern เงียบ · กราฟไม่หายใน dark mode · **e2e เปิดทุกหน้าจริง + CI ตรวจ main + บังคับเป็น required check แล้ว**
- ⛔ **INFRA-05 wireframe — ยกเลิก** (DESIGN.md + UI จริงแทนไปแล้ว)

> 🔒 **CI ใหม่บังคับแล้ว** — ทุก PR ต้องผ่าน `verify` (format/lint/tsc/test/build) + `e2e (เปิดแอปจริง)` ก่อน merge · **PR ที่ทำ layout พังหรือ dashboard ขาวจะ merge ไม่ได้** (ก่อนหน้านี้ผ่านเขียวหมด)

---

## 👥 3 สาย — เดินขนานกัน ไม่มีจุดรอ A แล้ว

| สาย | โซนไฟล์ (ไม่ทับกันเลย) | งานตามลำดับ |
| --- | --- | --- |
| 🟦 **กราฟ** | `components/dashboard/` · `app/(app)/dashboard/page.tsx` | ~~F2-02~~ ~~F2-03~~ ~~F2-04~~ ✅ — **หมดคิวบังคับแล้ว** → F2-05 streak *(ตัดได้)* + QA-02 |
| 🟩 **โค้ช** | `app/(app)/coach/` · `components/coach/` | ~~F4-01~~ ~~F4-05~~ ~~F4-03~~ ✅ — **หมดคิวแล้ว** → ช่วย QA-02 จับเวลา check-in |
| 🟨 **สิทธิ์+เป้าหมาย** | `app/(app)/goals/` · `components/goals/` | ~~F7-02~~ ~~F5-02~~ ✅ — **หมดคิวแล้ว** → ช่วย QA-02 จับเวลา check-in |

kickoff อยู่ในคอมเม้นของแต่ละ issue

### 🔧 คิวงาน A

~~F3-03~~ ~~F3-04~~ ~~F4-02~~ ~~F5-01~~ ~~F4-04~~ ~~F6-01~~ ~~F5-03~~ ~~F5-04~~ ~~F6-02~~ ~~F6-03~~ ~~INFRA-16→19~~ ✅

~~QA-01 🔒~~ ~~QA-04~~ ~~INFRA-21→23~~ ✅

**ถัดไป:** **QA-02 เริ่มจับเวลา 21 ก.ค.** (ทุกคน — ต้อง 3 วันติด × ≥4 คน) → **QA-03 deck + script ลง `docs/pitch/`** → F4-06 markdown → INFRA-20 โควตา

> **AI ทุกตัวอัปเกรดเป็น Gemini จริงแล้ว "ข้างหลัง" ฟังก์ชันเดิม** — signature ไม่เปลี่ยน 3 สายได้ผล AI จริงแทน stub อัตโนมัติ ไม่ต้องแก้โค้ด

---

## 📞 ฟังก์ชันที่แต่ละสายเรียกใช้ (ไม่ต้องแตะ Supabase/Gemini เลย)

```tsx
// 🟦 กราฟ
getCheckins(days)                      // @/lib/checkins/queries
getLatestInsight(days)                 // @/lib/ai-outputs/queries   ← อ่าน cache เร็ว
generateInsight(days)                  // @/lib/ai-outputs/actions   ← กดปุ่ม ~10 วิ
formatMetric(metric, value)            // @/lib/ai-outputs/format

// 🟩 โค้ช
getChatHistory() · needsReply(history) // @/lib/chat/queries
messagesLeftToday()                    // @/lib/chat/queries   ← 0 = โชว์ QuotaReachedNotice
sendCoachMessage(text)                 // @/lib/chat/actions
retryCoachReply()                      // ⚠️ ปุ่ม "ลองใหม่" ต้องเรียกตัวนี้ ไม่ใช่ send ซ้ำ
clearChatHistory()                     // = F4-05 เกือบเสร็จเลย

// 🟨 สิทธิ์+เป้าหมาย
deleteAllData() · deleteAccount()      // @/lib/account/actions
getGoals() · getActiveGoals()          // @/lib/goals/queries
acceptGoal() · toggleGoalDay() · updateGoalStatus()          // @/lib/goals/actions
recommendGoals()                       // เดิม: ไม่ส่งอะไรก็ได้ ปั้นจาก check-in + โปรไฟล์
recommendGoals({ pillar, busyDays, constraints })            // ใหม่ (F5-04): ส่งคำตอบจากฟอร์ม/flow เข้าไปได้
                                       // pillar: "eating" | "sleep" | "movement" — ดันด้านนั้นขึ้นก่อน
                                       // busyDays/constraints: คีย์เดิมจาก lib/onboarding/types
getLatestReflection() · getReflections() · generateReflection()  // @/lib/ai-outputs/*
getWeekComparison(periodStart, periodEnd)  // ใหม่ (F6-03): ส่วนต่างเทียบสัปดาห์ก่อน · null = ไม่มีให้เทียบ
```

---

## กติกา 7 ข้อ

1. **เปิด issue ก่อนเขียนโค้ดเสมอ** · 1 issue = 1 branch = 1 PR → `feat/<เลข issue>-<คำสั้น>` เช่น `feat/f2-02-charts`
2. **อัปเดตโค้ด 3 จังหวะ:** ก่อนเริ่มงาน · **ก่อน push/เปิด PR** ⭐ · เมื่อมีคนประกาศว่า merge

   ```bash
   git checkout main && git pull
   git checkout <branch ตัวเอง> && git merge main
   ```

3. **ก่อนเปิด PR รัน `npm run format` เสมอ** · ถ้าแตะ UI รัน `npm run e2e` ด้วย (~40 วิ) — **CI บังคับ 2 ด่านนี้ ไม่ผ่าน = merge ไม่ได้**
4. **อยู่ในโซนของสายตัวเอง** — ถ้าต้องแตะไฟล์นอกโซน **แจ้งกลุ่มก่อน**
   **ห้ามลง npm package เอง** (จะทำ `package-lock.json` ชนกัน) → แจ้งกลุ่ม → A ลงบน main
5. **ห้ามแตะ DB / Supabase / Gemini ตรง ๆ** — เรียกฟังก์ชันจาก `src/lib/` เท่านั้น
   type กลางของโปรเจกต์ (`Checkin` `Pillar` `Disruptor` …) → **`@/lib/domain`** (INFRA-21 — เดิมอยู่ `lib/patterns/types`)
   ⚠️ **โควตา Gemini ฟรี = 500 ครั้ง/วัน ทั้งแอปรวมกัน** (INFRA-23 — เดิม 20) → หายใจคล่องขึ้นมาก แต่**อย่ากดปุ่มวิเคราะห์/แชทรัว ๆ เล่น** (มี cache + จำกัดแชท 5 ข้อความ/คน/วันเหมือนเดิม)
   ห้ามหาวันที่ด้วย `new Date()` → ใช้ `today()` / `daysAgo()` จาก `lib/checkins/date.ts`
   ชื่อไทยของค่าต่าง ๆ → `lib/checkins/labels.ts` · คำต้องห้าม → `lib/safety/language.ts`
6. **UI: อ่านส่วนแรกของ `DESIGN.md` (ถึงเส้น `---` แรก)** — `<PageContainer>` · ห้ามใส่ `<main>` เอง · ทุกหน้ามี `<h1>` 1 อัน · ทุกหน้าใหม่มี `loading.tsx` · การ์ดที่ดึงข้อมูลเองครอบ `<Suspense>` · **ทุกอย่างที่กดได้สูง ≥ 44px** · **ห้าม hardcode สี** · **ไม่มี boolean prop คุมพฤติกรรม**
7. **เช็ค git config ก่อน commit แรก** — `git config user.email` ต้องตรงกับอีเมลที่ Verified บน GitHub ไม่งั้น**ผลงานไม่ถูกนับ**

---

## รายการงานที่เหลือ — QA + การนำเสนอล้วน ๆ

| Issue | งาน | สาย | หมายเหตุ |
| --- | --- | --- | --- |
| qa/02 | จับเวลา check-in | ทุกคน | **เริ่ม 21 ก.ค.** (ต้อง 3 วันติด × ≥4 คน — ยิ่งช้ายิ่งแก้ไม่ได้) · กรอกลง `qa-results.md` |
| qa/03 | Pitch deck + demo script | A + ทุกคน | ของลง `docs/pitch/` · ซ้อม 2 รอบวันที่ 29 |
| f2/05 | Streak | 🟦 | **ตัดได้ถ้าไม่ทัน** (Priority C) |
| f4/06 · infra/20 | markdown ในฟองแชท · อุดโควตารีเซ็ต | A | เก็บเล็ก — ไม่บล็อกอะไร |

**🔒 = ห้ามตัดทิ้งแม้เวลาไม่พอ** (เกณฑ์ Safety / Privacy โดยตรง)

## กติกาการทดสอบ (เพิ่ม 16 ก.ค.)

**อย่าเทสด้วยบัญชีปาล์ม** — สมัครบัญชีทิ้ง ๆ แทน · ปาล์มคือบัญชีที่ใช้ demo วัน pitch ข้อความเทสที่ค้างไว้จะโผล่บนจอตอนนำเสนอ และการกดปุ่ม AI เล่นกินโควตาที่ใช้ร่วมกันทั้งทีม

**ล้างประวัติแชท = โควตา 5 ข้อความ/วันรีเซ็ตด้วย** (`countMessagesToday()` นับแถวใน DB) — อย่าใช้เป็นทางลัดคุยเกินโควตา · เปิดเป็น **INFRA-20** แล้ว A รับไป

## ไม่มีจุดรอระหว่างสายแล้ว

ทุกสายเดินได้เต็มที่ · F2-04 / F5-02 ได้ผล AI จริงหลัง signature เดิม ไม่ต้องแก้โค้ด

> ✅ ปาล์มมี reflection 4 สัปดาห์ + pattern 14/30 วัน cache ไว้บน production แล้ว (INFRA-16) — เปิดมาเห็นข้อมูลจริงเลย ไม่ต้องกด generate เปลือง quota
