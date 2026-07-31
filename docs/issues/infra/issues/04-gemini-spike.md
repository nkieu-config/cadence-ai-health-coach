# INFRA-04: Gemini spike + โครง lib/ai

Status: done
Owner: C
Sprint: 0
Priority: M
Refs: ADR-0003, docs/07 (system prompt กลาง)

## งาน

- [x] สมัคร Gemini API key (free tier) — **ของแต่ละคนเอง** เก็บใน env (`.env.local`, ยืนยันใช้ได้จริง)
- [x] สร้าง `lib/ai`: ฟังก์ชันเดียวรับ (systemPrompt, messages | prompt, jsonSchema?) คืนข้อความ/JSON
- [x] แนบ system prompt guardrail จาก docs/07 เป็น default ทุก call
- [x] ลองยิงภาษาไทย 5 เคส รวมเคสต้องห้าม (ขอแผนลดน้ำหนัก, ถามวินิจฉัยโรค) — บันทึกผลใน Comments
- [x] วัด latency + สังเกต rate limit จริงของ free tier

## Acceptance criteria

- เรียกจาก API route แล้วได้คำตอบภาษาไทยผ่าน guardrail — ทดสอบผ่าน script harness (โค้ด path เดียวกับ lib/ai) ได้คำตอบไทยผ่าน guardrail ครบ; การ wire เป็น HTTP API route จริงอยู่ใน F3-03/F4-01
- โครงรองรับสลับ provider ได้ (interface ไม่ผูก Gemini) — ✓ ทุก call ผ่าน `lib/ai` โมดูลเดียว สลับ provider = แก้ไฟล์เดียว

## Comments

2026-07-07 (AI spike test): รัน `npm run test:ai` ยิง 5 เคสภาษาไทยผ่าน `lib/ai` จริง (`gemini-2.5-flash` free tier) — **guardrail ผ่าน 5/5**

ส่งต่อ F3/F4: lib/ai ต้องมี retry บน 503/429 (NFR-2/F3-03) · latency เกิน 10 วิได้จริง ทุกหน้าที่เรียก AI ต้องมี loading state ชัด · 503 ยืนยันความจำเป็นของ cache `ai_outputs` + screenshot สำรองตอน pitch (ADR-0003) · heuristic keyword check เชื่อไม่ได้ → safety checklist QA-01 ต้องให้คน**อ่านคำตอบ**ตัดสิน · C พิจารณาปรับ prompt เคส baseline

2026-07-07 (นโยบาย key): เปลี่ยนเป็น **dev แต่ละคนใช้ key ของตัวเอง** ใน `.env.local` กันแย่ง rate limit · production บน Vercel ยังใช้ key เดียว (ADR-0003)
