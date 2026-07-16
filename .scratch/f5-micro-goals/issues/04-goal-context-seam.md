# F5-04: recommendGoals รับบริบทจาก guided flow

Status: done
Owner: A
Sprint: 3
Priority: M — ห้ามตัด (บล็อกคุณภาพของ F4-03 ซึ่งเป็น demo หลัก)
Refs: FR-4.3, FR-5.1, F4-03, F5-01, F5-03

## ปัญหา

F4-03 (flow ที่โจทย์บังคับ ข้อ 7.6) ถาม 3 คำถาม — เริ่มจากด้านไหน · สัปดาห์หน้าวันไหนแน่น · ข้อจำกัดอะไร — แต่ `recommendGoals()` **ไม่รับอาร์กิวเมนต์เลย** ปั้น goal จาก check-in + โปรไฟล์ onboarding เท่านั้น และสาย UI เรียก Gemini เองไม่ได้ (กติกาข้อ 5)

ผลคือ PR #44 ต้อง hardcode goal เป็น if/else ในไคลเอนต์ — **เครื่องยนต์ทั้งกอง (few-shot table จากโจทย์ · ข้อจำกัดจากโปรไฟล์ · Gemini · validation · fallback) ถูกข้ามทิ้งบน demo หลัก** และ check-in จริงของผู้ใช้ไม่ถูกแตะ

นี่เป็นช่องว่างของ contract ฝั่ง A ไม่ใช่ความผิดของ 🟩

## งาน

- [ ] `recommendGoals(context?)` — `context` เป็น **พารามิเตอร์เสริม** ของเดิมเรียกแบบไม่ส่งอะไรได้เหมือนเดิม (🟨 ทำ F5-02 อยู่บน signature นี้)
- [ ] รับเป็น **โครงสร้าง ไม่ใช่ free text** — `{ pillar?, busyDays?, constraints? }` ใช้ vocabulary เดิมจาก `lib/onboarding/types` · ค่าที่ไม่รู้จักถูกตัดทิ้งฝั่ง server (กัน prompt injection)
- [ ] `pillar` → เลือก situation ของด้านนั้นก่อน ถ้าไม่พอ 2 ข้อค่อยเติมจากอันดับที่เหลือ
- [ ] `busyDays` / `constraints` จาก flow → รวมเข้ากับโปรไฟล์ก่อนส่งเข้า prompt (ของจาก flow ทับ/เสริมของจาก onboarding)
- [ ] validation คำต้องห้ามยังเป็นด่านตายเหมือนเดิม (ไม่แตะ)

## Acceptance criteria

- unit test: pillar เลือก situation ถูกด้าน · ไม่พอ 2 ข้อเติมจากที่เหลือ · ค่ามั่วถูกตัดทิ้ง · ไม่ส่ง context = พฤติกรรมเดิมเป๊ะ
- ยิง Gemini จริง: ส่ง context คนละชุดกับ check-in ชุดเดียวกัน → ได้ goal ต่างกันจริง
- `recommendGoals()` แบบไม่ส่ง context ยังทำงานเหมือนเดิม

## Comments

---

17 ก.ค. (A) — เสร็จ · branch `feat/f5-04-goal-context`

**ทำอะไร:** `recommendGoals(context?)` รับ `{ pillar?, busyDays?, constraints? }` — **พารามิเตอร์เสริม signature เดิมไม่ขยับ** (🟨 ทำ F5-02 ต่อได้ไม่ต้องแก้)

- **โครงสร้าง ไม่ใช่ free text** — ใช้ vocabulary เดิมจาก `onboarding/types` · `knownOnly()` กรองค่าที่ไม่รู้จักทิ้งฝั่ง server ทุกตัว (กัน prompt injection จากไคลเอนต์) · `pillar` ที่ไม่ใช่ค่าจริงถูกเมิน
- **`SITUATION_PILLARS`** แม็ป situation → pillar · `chooseSituations(checkins, limit, pillar?)` ดันด้านที่ผู้ใช้เลือกขึ้นก่อนเสมอ **แม้ข้อมูลจะชี้ไปทางอื่น** แล้วเติมให้ครบจากอันดับที่เหลือ (ด้านการกิน/การนอนมี situation เดียว จึงต้องเติม)
- **`busyDaysNextWeek`** เป็นฟิลด์ใหม่ใน `GoalProfile` (optional) → โผล่ใน prompt เป็น "วันที่ตารางแน่นสัปดาห์หน้า" · ข้อจำกัดจาก flow **รวมกับ**ของจาก onboarding ไม่ทับทิ้ง
- validation คำต้องห้ามไม่ถูกแตะ ยังเป็นด่านตายเหมือนเดิม

**พิสูจน์ด้วย Gemini จริง — check-in ชุดเดียวกันของปาล์ม (14 วัน) เปลี่ยนแค่ context:**

```text
flow: เลือก "การนอน" · แน่นวัน จ/อ · ข้อจำกัด: ไม่มีเวลา
   situation ที่เลือก: phone_before_bed, early_class     ← ด้านการนอนมาก่อน
   • นอนดึกเพราะมือถือ: วางมือถือก่อนนอน 15 นาที จำนวน 3 คืน
   • มีเรียนหรือทำงานเช้า: เตรียมขนมปังหรือผลไม้ไว้ข้างเตียงสำหรับคืนก่อนวันจันทร์และวันพุธ
```

เทียบกับก่อนมี F5-04: ปาล์มมี deadline เยอะ `chooseSituations` จะเลือก `early_class, deadline` เสมอ — **เลือก "การนอน" ก็ไม่เคยได้ goal เรื่องการนอนเลย** ตอนนี้ได้แล้ว

**⚠️ เคสที่สอง (movement + ไม่มีสถานที่ + งบจำกัด) ยังไม่ได้พิสูจน์ — โควตา 20/วันหมดพอดีตอนยิง**

```text
429 · quotaId: GenerateRequestsPerDayPerProjectPerModel-FreeTier · limit: 20 · model: gemini-2.5-flash
```

ผลที่ได้คือ fallback ทั้งคู่ ซึ่ง**เป็นพฤติกรรมที่ถูกต้อง** — `isQuotaExhausted` จับได้แล้วถอยไป goal มาตรฐานจากตารางโจทย์ ไม่พัง ไม่ค้าง · **ต้องยิงเคสนี้ซ้ำหลังโควตารีเซ็ต** แล้วแปะผลต่อท้ายคอมเมนต์นี้

**unit test:** เลือกด้านไหนได้ด้านนั้นมาก่อนแม้ข้อมูลชี้ทางอื่น · ด้านที่มี situation เดียวเติมให้ครบ 2 · ไม่ส่ง pillar = พฤติกรรมเดิมเป๊ะ · ไม่มีสัญญาณเลยแต่เลือกด้านไว้ก็ยังเสนอได้
