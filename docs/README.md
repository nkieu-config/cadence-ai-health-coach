# เอกสารโปรเจกต์ Cadence

ชุดเอกสารวางแผนก่อนเริ่มเขียนโค้ด — อ่านเรียงตามเลขได้เลย สมาชิกใหม่เริ่มที่ 01

| ไฟล์ | เนื้อหา |
|---|---|
| [00-mission-brief.md](00-mission-brief.md) | โจทย์ต้นทางจากอาจารย์ (Mission #5) — อ้างอิงเสมอเวลาตัดสิน scope |
| [01-project-charter.md](01-project-charter.md) | เป้าหมาย scope ทีม timeline เกณฑ์ความสำเร็จ |
| [02-problem-analysis.md](02-problem-analysis.md) | วิเคราะห์ปัญหา + สมมติฐานของ product |
| [03-user-persona.md](03-user-persona.md) | Persona "ปาล์ม" + demo scenario |
| [04-requirements.md](04-requirements.md) | Functional/Non-functional requirements (M/S/C) |
| [05-data-design.md](05-data-design.md) | Data design + Supabase schema |
| [06-system-architecture.md](06-system-architecture.md) | สถาปัตยกรรม + workflow diagrams |
| [07-ai-design.md](07-ai-design.md) | System prompt, pattern analysis, แผนทดสอบ AI |
| [08-safety-privacy.md](08-safety-privacy.md) | Safety guardrail + privacy design |
| [09-project-plan.md](09-project-plan.md) | Sprint plan, แบ่งงาน 3 สาย + A, risk register |
| [10-deliverables-checklist.md](10-deliverables-checklist.md) | เช็คลิสต์ deliverables 14 ข้อ + mapping เกณฑ์คะแนน |
| [11-limitations-future.md](11-limitations-future.md) | ข้อจำกัดที่รู้ตัว + สิ่งที่ทำแล้วเพื่อรับมือ + แผนถ้าไปต่อ |
| [12-ui-inventory.md](12-ui-inventory.md) | **แอปมีหน้าตาและพฤติกรรมอย่างไรจริง ๆ** — ทุก route ทุก state ทุก copy พร้อมลิงก์โค้ด · ต่างจาก DESIGN.md ที่เป็นกฎสำหรับคนเขียนโค้ด |
| [pitch/](pitch/) | ของนำเสนอวัน pitch: deck, demo script, screenshot สำรอง (QA-03) |

เอกสารอ้างอิงระดับ root:

- [../CONTEXT.md](../CONTEXT.md) — glossary ภาษากลางของโปรเจกต์ (อ่านก่อนตั้งชื่อตัวแปร/เขียน UI copy)
- [adr/](adr/) — บันทึกการตัดสินใจทางเทคนิค (ADR-0001 ถึง 0005)

## ไฟล์ไหนคือของส่งอาจารย์

**Deliverable ตามโจทย์ข้อ 10 อยู่ใน 02 · 03 · 05 · 06 · 08 · 11** — [10-deliverables-checklist.md](10-deliverables-checklist.md) เป็นสารบัญที่ map ครบทั้ง 14 ข้อว่าอะไรอยู่ที่ไหน (รวมของที่อยู่ในแอป ไม่ใช่เอกสาร) พร้อม mapping เกณฑ์ให้คะแนน 9 ข้อ

ไฟล์ที่เหลือ (01 · 04 · 07 · 09) เป็นเอกสารกระบวนการ — โจทย์ไม่ได้สั่งโดยตรง แต่ใช้ตอบกรรมการเวลาถามว่า "ตัดสินใจแบบนี้เพราะอะไร" และเป็นหลักฐานของเกณฑ์ Prototype Quality
