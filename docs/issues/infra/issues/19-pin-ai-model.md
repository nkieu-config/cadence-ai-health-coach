# INFRA-19: ล็อกโมเดล AI ไม่ให้เปลี่ยนเงียบ ๆ

Status: done
Owner: A
Sprint: 3
Priority: M — ห้ามตัด (ค้ำเกณฑ์ Safety)
Refs: F3-02, F4-04, QA-01, ADR-0003

## ปัญหา (เกิดจริงแล้ว 16 ก.ค.)

PR #33 เปลี่ยน `DEFAULT_MODEL` จาก `gemini-2.5-flash` → `gemini-2.0-flash` เพื่อแก้ปัญหาที่เครื่องตัวเอง แล้ว **CI เขียวครบ 4 ด่าน** — verify ผ่าน, e2e ผ่าน, Vercel ผ่าน

ถ้า merge เข้าไป หลักฐาน safety ทั้งกอง (F3-02 checklist 10/10 · F4-04 escalation 9/9 · INFRA-16 backfill) จะกลายเป็นของโมเดลที่เราไม่เคยทดสอบ **โดยไม่มีใครรู้ตัวจนวัน pitch** — จับได้เพราะคนอ่าน diff เท่านั้น ซึ่งไม่ใช่หลักประกัน

## งาน

- [ ] เพิ่ม unit test ที่ fail ทันทีถ้า `DEFAULT_MODEL` ไม่ใช่ `gemini-2.5-flash`
- [ ] ครอบ `scripts/test-ai.ts` และ `scripts/test-escalation.ts` ด้วย (ค่า default ต้องตรงกับที่ production ใช้ ไม่งั้นหลักฐานไม่ตรงของจริง)
- [ ] ข้อความ fail ต้องบอกเหตุผลให้คนที่ไม่รู้ที่มาเข้าใจ — ว่าเปลี่ยนโมเดล = ต้องรัน checklist 10 เคสใหม่ (20 calls)
- [ ] เขียนกฎลง AGENTS.md / BOARD ว่าเปลี่ยนโมเดลต้องผ่าน A + รัน QA-01 ใหม่

## Acceptance criteria

- แก้ `DEFAULT_MODEL` เป็นค่าอื่น → `npm test` แดงทันที (พิสูจน์ด้วยการลองจริงแล้ว revert)
- ทดสอบไม่ยิง Gemini จริง (ไม่กินโควตา)

## Comments

---

16 ก.ค. (A) — เสร็จ · branch `feat/infra-19-pin-ai-model` · `DEFAULT_MODEL` มีที่เดียวแล้ว (production + สคริปต์หลักฐานอ่านค่าเดียวกัน) และมีเทสล็อกไว้ — แก้เป็นค่าอื่น `npm test` แดงทันที

**ยังใช้ `AI_MODEL` env override ได้เหมือนเดิม** — อยากลองโมเดลอื่นบนเครื่องตัวเองไม่ต้องแตะโค้ด
