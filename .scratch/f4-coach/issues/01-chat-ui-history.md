# F4-01: Chat UI + เก็บประวัติ

Status: ready-for-human
Owner: 🟩 โค้ช
Sprint: 2
Priority: M
Refs: FR-4.1, FR-4.5

## งาน

- [ ] หน้าแชท: ประวัติจาก `chat_messages`, กล่องพิมพ์, loading ระหว่างรอ (NFR-2 ~10 วิ)
- [ ] บันทึกทั้ง user และ coach message ลง DB
- [ ] ปุ่มเริ่มบทสนทนา (chip): "ช่วยดู pattern สัปดาห์นี้", "อยากตั้งเป้าสัปดาห์หน้า" — ลดกำแพงไม่รู้จะพิมพ์อะไร
- [ ] ข้อความกำกับ safety ถาวรท้ายหน้า (F0-03)

## Acceptance criteria

- ปิดหน้าแล้วกลับมา ประวัติยังอยู่
- Gemini ล่ม → ข้อความสุภาพ + ปุ่ม retry ไม่ crash

## Comments

---

15 ก.ค. (A) — kickoff

**ไฟล์**

- สร้าง `src/components/coach/` — ฟองข้อความ + กล่องพิมพ์ + chip เริ่มบทสนทนา
  ทำเป็น variant แยก: `UserMessage` / `CoachMessage` / `PendingReply` / `QuotaReachedNotice` — **ห้าม `<Message isUser isPending />`** (DESIGN.md มีท่อนเขียนถึงสาย 🟩 ตรง ๆ)
- แก้ `src/app/(app)/coach/page.tsx` — แทน placeholder · สร้าง `loading.tsx` คู่กัน
- แม่แบบ pending/error state ก๊อปได้: `src/components/checkin/checkin-form.tsx`

**เรียกใช้** — จบใน 5 ตัวนี้ ไม่ต้องรู้จัก Gemini เลย

- `getChatHistory()` — `@/lib/chat/queries` → `ChatMessage[]` เก่า→ใหม่ (`{ id, role: "user" | "coach", content, createdAt }`)
- `needsReply(history)` — `@/lib/chat/queries` → `true` = ข้อความสุดท้ายเป็น user ที่ยังไม่มีคำตอบ → โชว์ปุ่ม "ลองใหม่"
- `messagesLeftToday()` — `@/lib/chat/queries` → เหลือ 0 = โชว์ `QuotaReachedNotice` (จำกัด 5 ข้อความ/วัน)
- `sendCoachMessage(text)` — `@/lib/chat/actions` → `{ ok, message }` หรือ `{ error }` · ยาวสุด `MESSAGE_MAX_LENGTH` = 500
- `retryCoachReply()` — `@/lib/chat/actions` → ให้โค้ชตอบข้อความที่ค้างอยู่

**ระวัง — กับดักเดียวที่พังจริง**

ปุ่ม "ลองใหม่" ต้องเรียก `retryCoachReply()` **ไม่ใช่** `sendCoachMessage()` ซ้ำ
(`sendCoachMessage` บันทึกข้อความ user ลง DB ก่อนเรียก AI เสมอ — Gemini ล่มข้อความไม่หาย ส่งซ้ำ = user ซ้ำ 2 อันในประวัติ)

Safety notice ท้ายหน้า layout ใส่ให้แล้ว ไม่ต้องทำเอง
