# ADR-0003: ใช้ Google Gemini Free Tier เป็น AI Engine

- **Status:** Accepted
- **Date:** 2026-07-06

## Context

ส่วน AI (pattern analysis, coach conversation, micro goal, weekly reflection) ต้องใช้ LLM ที่ภาษาไทยดี แต่ทีมไม่มีงบประมาณเลย ทางเลือก free ที่พิจารณา: Google Gemini free tier, Typhoon (SCB 10X), Groq (Llama)

## Decision

ใช้ **Google Gemini free tier (Gemini Flash)** ผ่าน API key ธรรมดา เรียกจาก Next.js API routes ฝั่ง server เท่านั้น

โค้ดฝั่งเรียก AI ให้เขียนผ่าน service module เดียว (`lib/ai/`) ที่รับ prompt เข้า–ส่งข้อความออก เพื่อให้สลับ provider ได้ถ้าเจอปัญหา rate limit

## Consequences

- ฟรีจริง ไม่ต้องผูกบัตร
- ภาษาไทยอยู่ในระดับใช้งานได้ดีสำหรับงาน coaching
- Safety guardrail ทำผ่าน system prompt กลางที่ใช้ร่วมทุก feature (ดู [../08-safety-privacy.md](../08-safety-privacy.md))
- ความเสี่ยง rate limit ช่วง demo — บรรเทาด้วย: (1) cache ผลลัพธ์ pattern/reflection ใน DB (2) service module สลับไป Typhoon ได้ (3) เตรียม screenshot สำรองตอน pitch
- API key เก็บใน environment variable ฝั่ง server เท่านั้น ห้ามเรียก Gemini จาก client
- **การจัดสรร key (อัปเดต 2026-07-07):** dev แต่ละคนใช้ Gemini key ของตัวเองใน `.env.local` เพื่อกันแย่ง rate limit ตอนพัฒนา/รัน `npm run test:ai`; production บน Vercel ใช้ **key เดียว**ที่ตั้งใน Vercel env

## ⚠️ โควตาจริง (วัดเมื่อ 2026-07-14 — แก้ข้อสันนิษฐานที่ผิดของ ADR นี้เอง)

ADR ฉบับแรกเขียนว่า *"โควตา free tier เพียงพอสำหรับ dogfooding 4 คน + demo"* — **ตอนรัน safety checklist (F3-02) ยิงชนเพดานจริงและพบว่าไม่จริง**

ตัวเลขนี้มาจาก error ของ Gemini API ไม่ใช่จากเอกสารหรือการเดา:

```json
"quotaId": "GenerateRequestsPerDayPerProjectPerModel-FreeTier"
"quotaValue": "20"
"model": "gemini-2.5-flash"
```

| โมเดล | โควตา free tier |
|---|---|
| `gemini-2.5-flash` ← ที่ใช้อยู่ | **20 ครั้ง/วัน/โปรเจกต์/โมเดล** |
| `gemini-2.5-flash-lite` | HTTP 404 — ไม่เปิดให้ผู้ใช้ใหม่แล้ว |
| `gemini-2.0-flash-lite` | `limit: 0` |

**ผลที่ตามมา:** prod ใช้ key เดียว → **ทั้งแอปมีโควตารวม 20 ครั้ง/วัน** · แชทโค้ช 1 ข้อความ = 1 ครั้ง

ข้อสรุปนี้เปลี่ยนสถานะของ cache: **cache ใน `ai_outputs` ไม่ใช่ optimization แต่เป็นเงื่อนไขที่ทำให้แอปใช้งานได้จริงบน free tier** · แผนรับมือทั้งหมดอยู่ใน **INFRA-07**

---

## Amendment — 19 ก.ค. 2026 (INFRA-23)

ตัวเลขโควตาข้างบนเป็นของ `gemini-2.5-flash` ณ วันเขียน · **ย้ายโมเดล production เป็น `gemini-3.1-flash-lite`** (รุ่นใหม่ที่เปิดให้ free tier แล้ว) = **500 ครั้ง/วัน + 15 req/นาที** (25 เท่าของเดิม)

- โมเดลถูก pin ใน `src/lib/ai/model.ts` + เทสกันเปลี่ยนเงียบ (INFRA-19)
- หลักฐาน safety รันใหม่ครบบนโมเดลใหม่ (QA-01 — 20/20 + ตรวจอิสระ)
- ข้อสรุปหลักของ ADR นี้**ยังถูกต้อง**: โควตาเป็นก้อนเดียวแชร์ทั้งแอป · cache-first ยังเป็นเงื่อนไขที่ทำให้แอปใช้งานได้จริง ไม่ใช่ optimization
