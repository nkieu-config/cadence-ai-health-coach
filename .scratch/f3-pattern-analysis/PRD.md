# PRD: F3 — Pattern Analysis

> ⚠️ **ตาราง Owner ด้านล่างเป็นของแผนเก่า (A/B/C/D)** — แผนปัจจุบันแบ่งเป็น 3 สาย (14 ก.ค. 2026)
> **ยึด `Owner:` ในไฟล์ issue เอง และ `.scratch/BOARD.md` เป็นหลัก** ดู [docs/09](../../docs/09-project-plan.md)


หัวใจ AI ของระบบ: โค้ดคำนวณสถิติจริง → Gemini แปลเป็น insight ภาษาไม่ตัดสิน แยก "สัญญาณ" จาก "ข้อสรุป"

อ้างอิง: FR-3.1–3.4 ใน [docs/04-requirements.md](../../docs/04-requirements.md), docs/07 งานที่ 1, โจทย์ Feature 3

## Issues

| # | งาน | Owner | Sprint |
|---|---|---|---|
| 01 | lib/patterns คำนวณ candidates | C | 1 |
| 02 | System prompt guardrail ใน lib/ai | C | 1 |
| 03 | Insight endpoint + cache | C | 2 |
| 04 | เคสข้อมูลไม่พอ | C | 2 |
