# Board — HealthCoach (อัปเดต 14 ก.ค. 2026)

## Pitch 30 ก.ค. · Code freeze 29 ก.ค. · เหลือ 15 วัน

> 🎯 **หลักการจัดงานใหม่: A สร้าง "เครื่องยนต์" · 3 สายสร้าง "หน้าจอ"**
> ทุกอย่างที่แตะ **Supabase / Gemini / service role / Safety 🔒** เป็นของ A
> **3 สายเรียกฟังก์ชันที่มีอยู่แล้ว → วาด UI → จบ** ไม่ต้องแตะ DB ไม่ต้องแตะ AI ไม่มีไฟล์ทับกัน

## สถานะ: เสร็จ 17 / 38 งาน (ยกเลิก 1)

- ✅ **Sprint 0** — repo · Supabase + RLS · Vercel · Gemini
- ✅ **F0** — สมัคร/ล็อกอิน (Google + รหัสผ่าน) · onboarding · disclaimer
- ✅ **F1** — เช็คอิน · บันทึก · แก้/ลบย้อนหลัง · สรุปหลังบันทึก · **F1-05 ปิดช่องโหว่โจทย์ข้อ 5**
- ✅ **F2-01** dashboard layout · **F3-01** lib/patterns · **F7-01** หน้า privacy
- ✅ **UI/UX** — touch target 44px · dark mode ตามค่าเครื่อง · เดสก์ท็อป sidebar
- ✅ **Data layer ครบ** — `checkins` · `account` · `chat` · `ai-outputs` · `goals`
- ✅ **F3-02 guardrail 🔒** — รัน checklist 10 เคสจริง เจอรูรั่ว 4 จุด แก้หมด · หลักฐานอยู่ที่ `.scratch/ai-safety-test/`
- ✅ **INFRA-07 โควตา** — cache-first + จำกัดแชท 5 ข้อความ/คน/วัน + ข้อความโควตาหมดเป็นมิตร
- ⛔ **INFRA-05 wireframe — ยกเลิก** (DESIGN.md + UI จริงแทนไปแล้ว)

> 🔍 **14 ก.ค. — audit แผน+เอกสารทั้งระบบเทียบโจทย์** พบว่า **Required Input ของโจทย์ข้อ 5 ขาดไป 4 ช่อง** (ความรู้สึกหลังขยับ · เวลามื้อแรก · ของว่าง/ผัก-ผลไม้ · ช่วงที่งานหนัก) → ปิดครบใน F1-05 แล้ว
> **มี migration ใหม่** `supabase/migrations/0002_mission_input_coverage.sql` — A รันบน Supabase ให้แล้ว ทุกคนแค่ `git pull` ก็ใช้ได้เลย

---

## 👥 3 สาย — ทำขนานได้ 100% ไม่มีใครรอใคร

| สาย | โซนไฟล์ (ไม่ทับกันเลย) | งานตามลำดับ |
| --- | --- | --- |
| 🟦 **กราฟ** | `components/dashboard/` · `app/(app)/dashboard/page.tsx` | **F2-02 กราฟ** → F2-03 overlay → F2-04 ตาราง pattern |
| 🟩 **โค้ช** | `app/(app)/coach/` · `components/coach/` | **F4-01 Chat UI** → F4-05 ลบประวัติ → F4-03 guided flow |
| 🟨 **สิทธิ์+เป้าหมาย** | `app/(app)/settings/` `goals/` `reflection/` · `components/goals/` `components/reflection/` | **F7-02 ลบข้อมูล** → F5-02 goals → F6-02 reflection |

**เริ่มได้ทันทีทั้ง 3 สาย** — ฟังก์ชันที่ต้องใช้มีครบแล้ว (ดู kickoff comment ใน issue แรกของสายตัวเอง)

### 🔧 งานของ A (ไม่บล็อกใคร ทำคู่ขนานไปเรื่อย ๆ)

~~F3-02 guardrail 🔒~~ ✅ → ~~INFRA-07 โควตา~~ ✅ → **F3-03 insight** → F3-04 ข้อมูลไม่พอ 🔒 → F4-02 context → F4-04 escalation 🔒 → F5-01 goal AI 🔒 → F6-01 reflection AI → **INFRA-06 seed** → QA-01 🔒 · QA-03 pitch · QA-04

> **AI ทั้งหมดอัปเกรดอยู่ "ข้างหลัง" ฟังก์ชันเดิม** — signature ไม่เปลี่ยน **3 สายไม่ต้องแก้โค้ดแม้แต่บรรทัดเดียว**

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
sendCoachMessage(text)                 // @/lib/chat/actions
retryCoachReply()                      // ⚠️ ปุ่ม "ลองใหม่" ต้องเรียกตัวนี้ ไม่ใช่ send ซ้ำ
clearChatHistory()                     // = F4-05 เกือบเสร็จเลย

// 🟨 สิทธิ์+เป้าหมาย
deleteAllData() · deleteAccount()      // @/lib/account/actions
getGoals() · getActiveGoals()          // @/lib/goals/queries
recommendGoals() · acceptGoal() · toggleGoalDay() · updateGoalStatus()  // @/lib/goals/actions
getLatestReflection() · getReflections() · generateReflection()  // @/lib/ai-outputs/*
//                     ↑ ย้อนหลัง (F6-02 / FR-6.2)
```

---

## กติกา 6 ข้อ

1. **1 issue = 1 branch = 1 PR** → `feat/<เลข issue>-<คำสั้น>` เช่น `feat/f2-02-charts`
2. **อัปเดตโค้ด 3 จังหวะ:** ก่อนเริ่มงาน · **ก่อน push/เปิด PR** ⭐ · เมื่อมีคนประกาศว่า merge

   ```bash
   git checkout main && git pull
   git checkout <branch ตัวเอง> && git merge main
   ```

3. **อยู่ในโซนของสายตัวเอง** — ถ้าต้องแตะไฟล์นอกโซน **แจ้งกลุ่มก่อน**
   **ห้ามลง npm package เอง** (จะทำ `package-lock.json` ชนกัน) → แจ้งกลุ่ม → A ลงบน main
4. **ห้ามแตะ DB / Supabase / Gemini ตรง ๆ** — เรียกฟังก์ชันจาก `src/lib/` เท่านั้น
   ⚠️ **โควตา Gemini ฟรี = 20 ครั้ง/วัน ทั้งแอปรวมกัน** → แชทจำกัด 5 ข้อความ/คน/วัน · **อย่ากดปุ่มวิเคราะห์รัว ๆ เล่น** (มี cache กันให้แล้ว แต่รู้ไว้)
   ห้ามหาวันที่ด้วย `new Date()` → ใช้ `today()` / `daysAgo()` จาก `lib/checkins/date.ts`
   ชื่อไทยของค่าต่าง ๆ → `lib/checkins/labels.ts` · คำต้องห้าม → `lib/safety/language.ts`
5. **UI: อ่าน 60 บรรทัดแรกของ `DESIGN.md`** — `<PageContainer>` · ห้ามใส่ `<main>` เอง · ทุกหน้ามี `<h1>` 1 อัน · **ทุกอย่างที่กดได้สูง ≥ 44px** (รวม `<Link>` ที่แต่งเป็นปุ่ม) · **ห้าม hardcode สี** (dark mode จะพัง)
6. **เช็ค git config ก่อน commit แรก** — `git config user.email` ต้องตรงกับอีเมลที่ Verified บน GitHub ไม่งั้น**ผลงานไม่ถูกนับ**

---

## รายการงานที่เหลือ (23 issues)

| Issue | งาน | สาย | หมายเหตุ |
| --- | --- | --- | --- |
| f2/02 | กราฟ 3 ด้าน + energy | 🟦 | **อ่าน skill `dataviz` ก่อนเขียน** |
| f2/03 | Disruptor overlay | 🟦 | |
| f2/04 | ตาราง Pattern | 🟦 | ข้อมูลพร้อมแล้ว (มี `evidence` ให้โชว์หลักฐาน) |
| f2/05 | Streak | 🟦 | **ตัดได้ถ้าไม่ทัน** (Priority C) |
| f4/01 | Chat UI + ประวัติ | 🟩 | UI ยากสุดในแอป — ติดขัดบอกทันที |
| f4/05 | ลบประวัติแชท | 🟩 | เรียก `clearChatHistory()` เกือบเสร็จ |
| f4/03 | Guided goal flow | 🟩 | |
| f7/02 | ลบข้อมูล/บัญชี 🔒 | 🟨 | โค้ดลบเขียนให้แล้ว ทำแค่ UI + confirm |
| f5/02 | หน้า goals | 🟨 | |
| f6/02 | หน้า reflection | 🟨 | |
| f3/03 · f3/04 🔒 | AI insight + ข้อมูลไม่พอ | A | |
| f4/02 · f4/04 🔒 | AI coach context + escalation | A | |
| f5/01 🔒 · f6/01 | AI goal + reflection | A | |
| infra/06 | Seed "ปาล์ม" | A | ⚠️ ใช้ service role — A เท่านั้น |
| qa/01 🔒 · qa/02 · qa/03 · qa/04 | Safety checklist · QA · Pitch · Limitations | A + ทุกคน | 27–29 ก.ค. · **qa/02 ต้องจับเวลา check-in จริง** |

**🔒 = ห้ามตัดทิ้งแม้เวลาไม่พอ** (เกณฑ์ Safety / Privacy โดยตรง) — **อยู่ในมือ A ทั้งหมด**

## จุดที่ต้องรอกัน (เหลือแค่ 2 จุด)

1. **F2-04** รอ A ทำ F3-03 เสร็จ (ตอนนี้ใช้ stub ได้แล้ว — วาด UI ไปก่อนได้เลย)
2. **INFRA-06 seed** เสร็จ (~21 ก.ค.) → ทุกคนมีข้อมูล 4 สัปดาห์ของ "ปาล์ม" ไว้ demo
