# F4-06: markdown ดิบโผล่ในฟองข้อความโค้ช

Status: ready-for-agent
Owner: A (โซน 🟩 — ตกลงกับคีตะแล้วว่า A ทำเอง)
Sprint: 3
Priority: S — กระทบเกณฑ์ Prototype Quality ตอน demo
Refs: F4-01, F3-02

## ปัญหา

Gemini ตอบเป็น markdown (`**ตัวหนา**`, `1.` `2.` ลิสต์) แต่ `CoachMessage` เรนเดอร์เป็น plain text (`whitespace-pre-wrap`) → **ดาวโผล่บนจอ** เห็นชัดในภาพหน้าจอ 16 ก.ค.:

```text
2.  **สำหรับวันที่ต้องปั่นงาน:** ในวันที่มีเดดไลน์ ซึ่งมักจะเป็นวันที่คุณเคลื่อนไหวน้อย...
```

เป็นหน้าที่กรรมการจะดูตอน demo (โจทย์ข้อ 7.6 coaching conversation)

## ทางเลือก

1. **เรนเดอร์ markdown ในฟองข้อความ** — ต้องลง lib (`react-markdown`) = แตะ `package-lock.json` ต้องทำโดย A ตามกติกาข้อ 4 · sanitize ให้เรียบร้อย ไม่ให้ HTML หลุด
2. **สั่งใน system prompt ว่าห้ามใช้ markdown** — ไม่ต้องลง lib **แต่แตะ `COACH_SYSTEM_PROMPT` = หลักฐาน safety ทั้งกองต้องรันใหม่** (checklist 10 เคส = 20 calls = โควตาทั้งวัน) · แพงเกินสำหรับปัญหาการแสดงผล
3. **แปลง markdown เป็น text ฝั่งแสดงผล** (ตัด `**`/`##` ทิ้ง คงบรรทัด/ลิสต์) — ไม่ลง lib ไม่แตะ prompt

**เอียงไปข้อ 3 หรือ 1** — ข้อ 2 ตัดทิ้งเพราะราคาสูงเกินเหตุ

## งาน

- [ ] เลือกทางแล้วแก้ `src/components/coach/message-variants.tsx` (`CoachMessage` เท่านั้น — `UserMessage` เป็นข้อความผู้ใช้ ไม่ต้องแปลง)
- [ ] ห้ามแตะ `COACH_SYSTEM_PROMPT`
- [ ] unit test กับข้อความจริงที่ Gemini เคยตอบ (มีตัวอย่างใน `.scratch/ai-safety-test/run-2026-07-16-after-prompt-fix.md`)

## Acceptance criteria

- ฟองข้อความโค้ชไม่มี `**` `##` ดิบโผล่ · ลิสต์ยังอ่านเป็นลิสต์
- ไม่ต้องยิง Gemini ใหม่เลยสักครั้ง (ใช้ข้อความที่บันทึกไว้แล้วทดสอบ)
- e2e เขียว
