# INFRA-23: สลับโมเดล production 2.5-flash → 3.1-flash-lite (โควตา 25 เท่า)

Status: done
Owner: A
Sprint: 3
Priority: M — ปลดล็อก dev velocity ก่อน freeze + ลดความเสี่ยงโควตาหมดวัน pitch
Refs: INFRA-19 (model pin), QA-01, ADR-0003

## ปัญหา

`gemini-2.5-flash` free tier = **20 req/วัน + 5 req/นาที** (ยืนยันจาก AI Studio ทั้งโปรเจกต์เดิมและโปรเจกต์ใหม่ — ไม่ใช่บั๊ก เป็นเพดานจริงของรุ่นนี้) · รันหลักฐาน safety 1 รอบ (20 นัด) = กินโควตาทั้งวัน ทั้งทีมแตะ AI ไม่ได้ · เพดาน 5/นาทีทำให้รันรวดเดียวก็สะดุด (เสียนัดจริงตอนรัน QA-01 18–19 ก.ค.)

## ทางแก้ที่เลือก

ตาราง AI Studio เผยว่าในตะกร้า Gemini free tier เดียวกันมี **`gemini-3.1-flash-lite` = 500 req/วัน + 15 req/นาที + TPM 250K** (RPD 25 เท่า · RPM 3 เท่า · TPM เท่าเดิม)

ทำไมชนะการย้าย provider (Groq/Mistral/OpenRouter ที่สำรวจแล้ว):

- **SDK เดิม** `@google/genai` — เปลี่ยนแค่ string · hardcode อยู่ 2 บรรทัด (`model.ts` + `model.test.ts`)
- **คุณภาพไทยอยู่ในตระกูล Gemini** — ไม่เสี่ยงแบบ Llama/Gemma · เทียบเคส 02 (ลดน้ำหนัก) 2.5-flash vs 3.1-flash-lite ปฏิเสธสะอาดพอกัน demo ได้ทั้งคู่
- **มีสัญญาณ safety บนโมเดลนี้แล้ว** — คีตะรัน 10 เคส (single phrasing) บน 3.1-flash-lite เมื่อ 18 ก.ค. **ผ่านทั้ง 10** (รอบนั้นเป็นอุบัติเหตุจาก AI_MODEL ค้าง แต่กลายเป็นข้อมูลว่า model id ยิงผ่าน stack เราได้ + prompt เอาอยู่)

## งาน

- [x] `src/lib/ai/model.ts` — `DEFAULT_MODEL = "gemini-3.1-flash-lite"`
- [x] `src/lib/ai/model.test.ts` — `PINNED` + WHY อัปเดต (guard INFRA-19 ยังทำงาน กันเปลี่ยนเงียบ)
- [x] ลบ `AI_MODEL=gemini-2.5-flash` ที่ค้างใน `.env.local` (เครื่อง A) → ให้ `DEFAULT_MODEL` เป็นแหล่งเดียว · **แจ้งทุกคนให้เช็ค `.env.local` ตัวเอง ลบ `AI_MODEL` ออก** (เครื่องคีตะเคยค้าง flash-lite เครื่อง A ค้าง 2.5-flash)
- [x] smoke test: ยิงจริงผ่าน `generate()` ยืนยันเส้น production ใช้โมเดลใหม่ได้

## ผลจากการเปลี่ยน (ต้องทำต่อ)

- **หลักฐาน safety ทางการต้องรันใหม่บน 3.1-flash-lite** — รอบ 2.5-flash (19/20 วันที่ 18 ก.ค.) กลายเป็นของโมเดลเก่า · **ข่าวดี: 500/วัน ทำให้รัน 20 นัด 2 ประโยคจบในนั่งเดียว ไม่ต้องจองทั้งวัน** → QA-01 ไม่ถูกบีบเรื่องโควตาอีก
- QA-01 ที่คีตะจะรัน (independent) เปลี่ยนเป้าเป็น 3.1-flash-lite · ต้อง merge script 2-ประโยค (PR #56) ก่อน

## Acceptance criteria

- `npm test` — pin test เขียว (PINNED = 3.1-flash-lite)
- ยิง `generate()` จริงบนโมเดลใหม่สำเร็จ (ไม่ใช่แค่ผ่าน type)
- guard INFRA-19 ยังกันการเปลี่ยนโมเดลเงียบ ๆ ได้

## Comments

---

19 ก.ค. (A) — **เสร็จ** · branch `fix/infra-23-switch-model`

**smoke test:** ยิงเคส 02 (ลดน้ำหนัก) + 05 (1323) จริงบน `gemini-3.1-flash-lite` ผ่าน generate() — ปฏิเสธสะอาด · 1323 มา · เส้น production ใช้โมเดลใหม่ได้จริง (ไม่ใช่แค่ tsc ผ่าน)

**pin test:** เขียว (คาดหวัง 3.1-flash-lite) — INFRA-19 guard ปรับตามโมเดลใหม่แล้ว ยังกันการเปลี่ยนเงียบต่อไป

**ค้าง (ไม่ใช่ของ PR นี้):** QA-01 independent run บน 3.1-flash-lite (คีตะ · หลัง merge #56) · แจ้งทีมลบ AI_MODEL ใน .env.local