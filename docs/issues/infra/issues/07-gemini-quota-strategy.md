# INFRA-07: โควตา Gemini ฟรี 20 ครั้ง/วัน — กันแอปตายวัน pitch

Status: done
Owner: A
Sprint: 2
Priority: M — ถ้าไม่แก้ demo วัน pitch มีสิทธิ์ล่มกลางเวที
Refs: ADR-0003, NFR-2, docs/09 Risk Register
Blocked by: —

## ปัญหา (วัดจริง ไม่ใช่เดา)

ตอนรัน F3-02 ยิงชนเพดานโควตาจริง — ตัวเลขนี้มาจาก error ของ Gemini API:

```json
"quotaId": "GenerateRequestsPerDayPerProjectPerModel-FreeTier"
"quotaValue": "20"
"model": "gemini-2.5-flash"
```

| โมเดล | โควตา free tier (วัด 14 ก.ค. 2026) |
|---|---|
| `gemini-2.5-flash` ← ที่เราใช้ | **20 ครั้ง/วัน/โปรเจกต์** |
| `gemini-2.5-flash-lite` | HTTP 404 — ไม่เปิดให้ผู้ใช้ใหม่แล้ว |
| `gemini-2.0-flash-lite` | `limit: 0` |

**ADR-0003 กำหนดว่า production ใช้ API key เดียวร่วมกันทั้งแอป**
→ ทั้งระบบบน production มีโควตารวม **20 ครั้ง/วัน**

- แชทโค้ช 1 ข้อความ = 1 ครั้ง
- ซ้อม pitch 2 รอบ × โชว์แชท 5 ข้อความ = 10 ครั้ง → **เหลือ 10 ครั้งสำหรับวันจริง**
- ถ้ากรรมการขอลองพิมพ์เอง หรือทีมเผลอ dogfood วันนั้น → **หมดกลางเวที**

## งาน

- [x] **Cache-first จริง** — `generateInsight()` / `generateReflection()` เช็ค `ai_outputs` ก่อน · ถ้ามีของช่วงเดิมและ **ยังไม่มี check-in ใหม่หลังจากนั้น** → คืน `{ ok: true, cached: true }` **ไม่ยิง Gemini เลย** (`isFresh()` + `latestCheckinAt()`)
- [x] **จำกัดแชท 5 ข้อความ/คน/วัน** — `DAILY_MESSAGE_LIMIT` ใน `sendCoachMessage()`
- [x] **ข้อความตอนโควตาหมดเป็นมิตร ไม่ใช่หน้าขาว** — `lib/ai/errors.ts` แยก "โควตาวันนี้หมด" ออกจาก "ระบบไม่ว่าง" (NFR-2)
- [x] **retry อัตโนมัติเฉพาะ error ชั่วคราว** — โควตารายวันหมด **ห้าม retry** (ยิงซ้ำก็ไม่ได้อะไร)
- [x] **แผนสำรองวัน pitch** — checklist ลงใน `qa-pitch/03-pitch-deck.md` แล้ว
- [x] อัปเดต ADR-0003 ด้วยตัวเลขจริง + Risk Register ใน docs/09

## Acceptance criteria

- [x] กดปุ่มวิเคราะห์ซ้ำ 10 ครั้งโดยไม่แก้ข้อมูล → **ยิง Gemini 0 ครั้ง** (มีเทสต์คุม)
- [x] โควตาหมด → ผู้ใช้เห็นข้อความเป็นมิตร ไม่ใช่หน้า error
- [x] ซ้อม pitch เต็มรูปแบบได้โดยไม่แตะโควตาของวันจริง (checklist ใน QA-03)

## Comments

2026-07-14 (A): เจอตอนรัน safety checklist ของ F3-02 · Risk Register ใน docs/09 เขียนความเสี่ยงนี้ไว้แต่ไม่มีใครรู้ตัวเลขจริง — ตอนนี้รู้แล้ว: **20 ครั้ง/วัน**
cache `ai_outputs` ไม่ใช่แค่ "ทำให้เร็วขึ้น" แต่เป็นสิ่งเดียวที่ทำให้แอปใช้งานได้จริงบน free tier

---

2026-07-14 (A): **เสร็จแล้ว** — ตั้งใจทำก่อน F3-03 เพื่อให้ด่านกันโควตาพร้อมก่อน Gemini เข้ามาอยู่หลัง signature เดิม (จะได้ไม่ต้องกลับมาแก้)

กับดัก: โควตา**รายวัน**หมด Google ก็คืน `retryDelay` เหมือนตอนชนลิมิตรายนาที → ต้องแยกที่ `quotaId` (`PerDay` vs `PerMinute`) เท่านั้น · มีเทสต์คุม
**กฎที่ต้องถือต่อ:** F3-03 / F5-01 / F6-01 ห้ามเรียก Gemini ตรง ๆ ต้องผ่าน `isCacheUsable()` ก่อนเสมอ
