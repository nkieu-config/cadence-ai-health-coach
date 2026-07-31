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

17 ก.ค. (A): เสร็จ · branch `feat/f5-04-goal-context` · `context` เป็น**พารามิเตอร์เสริม signature เดิมไม่ขยับ** (🟨 ทำ F5-02 ต่อได้ไม่ต้องแก้) · รับเป็นโครงสร้าง ค่าที่ไม่รู้จักถูกกรองทิ้งฝั่ง server · validation คำต้องห้ามไม่ถูกแตะ

**⚠️ เคสที่สอง (movement + ไม่มีสถานที่ + งบจำกัด) ยังไม่ได้พิสูจน์** — โควตา 20/วันหมดพอดีตอนยิง ได้ fallback ซึ่งเป็นพฤติกรรมที่ถูก · ต้องยิงซ้ำหลังโควตารีเซ็ต
