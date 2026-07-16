# Board — HealthCoach (อัปเดต 16 ก.ค. 2026)

## Pitch 30 ก.ค. · Code freeze 29 ก.ค. · เหลือ 14 วัน

> 🎯 **หลักการจัดงาน: A สร้าง "เครื่องยนต์" · 3 สายสร้าง "หน้าจอ"**
> ทุกอย่างที่แตะ **Supabase / Gemini / service role / Safety 🔒** เป็นของ A
> **3 สายเรียกฟังก์ชันที่มีอยู่แล้ว → วาด UI → จบ** ไม่ต้องแตะ DB ไม่ต้องแตะ AI ไม่มีไฟล์ทับกัน

## สถานะ: เสร็จ 40 / 52 งาน (ยกเลิก 1) — เครื่องยนต์ A เสร็จหมด เหลือ UI 3 สาย + QA

> ⚠️ **สิ่งที่ต้องเข้าใจตรงกันก่อนอ่านต่อ: เครื่องยนต์เสร็จ ≠ กรรมการเห็น**
> โจทย์ข้อ 7 บังคับ 9 อย่าง — วันนี้เปิด production แล้ว **4 อย่างยังมองไม่เห็นด้วยตา** ทั้งที่ AI ข้างหลังเสร็จและมี cache รออยู่แล้ว:
> **dashboard กราฟ (F2-02)** · **ตาราง pattern (F2-04)** · **หน้า goals (F5-02)** · **หน้า reflection (F6-02)**
> ทุกอันคือ UI ล้วน ๆ — คะแนน 4 เกณฑ์ (AI Usefulness · Personalization · Reflection and Improvement · Prototype Quality) ค้างอยู่ตรงนี้

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
| 🟦 **กราฟ** | `components/dashboard/` · `app/(app)/dashboard/page.tsx` | **F2-02 กราฟ** *(กำลังทำ)* → F2-03 overlay → F2-04 ตาราง → F2-05 streak *(ตัดได้)* |
| 🟩 **โค้ช** | `app/(app)/coach/` · `components/coach/` | ~~F4-01~~ ✅ → ~~F4-05~~ ✅ → **F4-03 guided flow** *(ถัดไป — flow ที่โจทย์บังคับ)* |
| 🟨 **สิทธิ์+เป้าหมาย** | `app/(app)/settings/` `goals/` · `components/goals/` | **F7-02 ลบข้อมูล 🔒** → F5-02 goals *(F6-02 ย้ายไปให้ A แล้ว — เหลือ 2 ตัว)* |

kickoff อยู่ในคอมเม้นของแต่ละ issue

### ⏰ เส้นตาย 20 ก.ค. — จับตา 🟨

**ถ้า F7-02 ยังไม่มี commit ภายในวันจันทร์ที่ 20 ก.ค. → A ดึงมาทำเอง** แล้ว 🟨 ไปต่อที่ F5-02

เหตุผลที่เลือกจับตาสายนี้: 🟨 ถือ issue ที่เป็น**หลักฐานชิ้นเดียว**ของเกณฑ์ Privacy (ปุ่มลบ 🔒 ห้ามตัด) และเป็นสายที่ยังไม่มี commit · F7-02 สั้นที่สุดในบรรดางานที่เหลือ (โค้ดลบเขียนให้หมดแล้ว เหลือ UI + confirm) ถ้าปล่อยไว้จนสัปดาห์สุดท้ายแล้วไม่เสร็จ = เสียคะแนนเกณฑ์เต็มข้อโดยที่แก้ไม่ทัน

*(เดิมเขียนไว้ว่าจับตา 🟦 — เปลี่ยนแล้ว เพราะ 🟦 เริ่ม commit จริงตั้งแต่ 16 ก.ค. เย็น และ merge main เข้า branch ตัวเองเรียบร้อย)*

### 🔧 คิวงาน A

~~F3-03~~ ~~F3-04~~ ~~F4-02~~ ~~F5-01~~ ~~F4-04~~ ~~F6-01~~ ~~F5-03~~ ~~INFRA-16→19~~ ✅

**ถัดไป:** **F6-03 เทียบสัปดาห์ก่อนหน้า** (เครื่องยนต์) → **F6-02 หน้า reflection** *(ดูดมาจาก 🟨)* → INFRA-20 โควตา → markdown ในฟองแชท → **QA-01 🔒 · QA-02 · QA-03 · QA-04**

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
recommendGoals() · acceptGoal() · toggleGoalDay() · updateGoalStatus()  // @/lib/goals/actions
getLatestReflection() · getReflections() · generateReflection()  // @/lib/ai-outputs/*
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
   ⚠️ **โควตา Gemini ฟรี = 20 ครั้ง/วัน ทั้งแอปรวมกัน** → **อย่ากดปุ่มวิเคราะห์/แชทรัว ๆ เล่น** (มี cache กันให้แล้ว แต่รู้ไว้)
   ห้ามหาวันที่ด้วย `new Date()` → ใช้ `today()` / `daysAgo()` จาก `lib/checkins/date.ts`
   ชื่อไทยของค่าต่าง ๆ → `lib/checkins/labels.ts` · คำต้องห้าม → `lib/safety/language.ts`
6. **UI: อ่านส่วนแรกของ `DESIGN.md` (ถึงเส้น `---` แรก)** — `<PageContainer>` · ห้ามใส่ `<main>` เอง · ทุกหน้ามี `<h1>` 1 อัน · ทุกหน้าใหม่มี `loading.tsx` · การ์ดที่ดึงข้อมูลเองครอบ `<Suspense>` · **ทุกอย่างที่กดได้สูง ≥ 44px** · **ห้าม hardcode สี** · **ไม่มี boolean prop คุมพฤติกรรม**
7. **เช็ค git config ก่อน commit แรก** — `git config user.email` ต้องตรงกับอีเมลที่ Verified บน GitHub ไม่งั้น**ผลงานไม่ถูกนับ**

---

## รายการงานที่เหลือ — 6 UI + 4 QA

| Issue | งาน | สาย | หมายเหตุ |
| --- | --- | --- | --- |
| f2/02 | กราฟ 3 ด้าน + energy | 🟦 | **อ่าน skill `dataviz` ก่อนเขียน** · กำลังทำอยู่ |
| f2/03 | Disruptor overlay | 🟦 | |
| f2/04 | ตาราง Pattern | 🟦 | AI จริงแล้ว — วาด UI ตาม signature เดิมได้เลย · **ปิดเกณฑ์ AI Usefulness** |
| f2/05 | Streak | 🟦 | **ตัดได้ถ้าไม่ทัน** (Priority C) |
| f4/03 | Guided goal flow | 🟩 | flow ที่โจทย์บังคับ (ข้อ 7.6) + demo หลัก · **ถัดไปของ 🟩** |
| f7/02 | ลบข้อมูล/บัญชี 🔒 | 🟨 | โค้ดลบเขียนให้แล้ว ทำแค่ UI + confirm · **เส้นตาย 20 ก.ค.** |
| f5/02 | หน้า goals | 🟨 | AI จริงแล้ว — `recommendGoals()` signature เดิม |
| f6/02 | หน้า reflection | **A** | ดูดมาจาก 🟨 (16 ก.ค.) — ทำคู่กับ F6-03 |
| qa/01 🔒 · qa/02 · qa/03 · qa/04 | Safety checklist · QA · Pitch · Limitations | A + ทุกคน | **qa/02 ต้องเริ่มจับเวลา ~21 ก.ค. ไม่ใช่ 27** (ต้องได้ 3 วันติด × ≥4 คน) |

**🔒 = ห้ามตัดทิ้งแม้เวลาไม่พอ** (เกณฑ์ Safety / Privacy โดยตรง)

## กติกาการทดสอบ (เพิ่ม 16 ก.ค.)

**อย่าเทสด้วยบัญชีปาล์ม** — สมัครบัญชีทิ้ง ๆ แทน · ปาล์มคือบัญชีที่ใช้ demo วัน pitch ข้อความเทสที่ค้างไว้จะโผล่บนจอตอนนำเสนอ และการกดปุ่ม AI เล่นกินโควตาที่ใช้ร่วมกันทั้งทีม

**ล้างประวัติแชท = โควตา 5 ข้อความ/วันรีเซ็ตด้วย** (`countMessagesToday()` นับแถวใน DB) — อย่าใช้เป็นทางลัดคุยเกินโควตา A จะอุดใน INFRA-20

## ไม่มีจุดรอระหว่างสายแล้ว

ทุกสายเดินได้เต็มที่ · stub-OK ทั้งหมด (F2-04 / F5-02) ได้ผล AI จริงหลัง signature เดิม ไม่ต้องแก้โค้ด

> ✅ ปาล์มมี reflection 4 สัปดาห์ + pattern 14/30 วัน cache ไว้บน production แล้ว (INFRA-16) — เปิดมาเห็นข้อมูลจริงเลย ไม่ต้องกด generate เปลือง quota
