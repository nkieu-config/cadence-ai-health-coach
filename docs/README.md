# Cadence — เอกสารออกแบบ

เขียนก่อนลงมือโค้ด แล้วรักษาให้ตรงกับโค้ดตลอดทาง — อ่านเรียงเลขได้ หรือกระโดดไปเฉพาะไฟล์ที่ตอบคำถามของคุณ

| ไฟล์ | เนื้อหา |
| --- | --- |
| [00-mission-brief.md](00-mission-brief.md) | โจทย์ต้นทางที่โปรเจกต์นี้ถูกสร้างขึ้นมาตอบ |
| [01-project-charter.md](01-project-charter.md) | เป้าหมาย ขอบเขต ทีม และนิยามของคำว่าเสร็จ |
| [02-problem-analysis.md](02-problem-analysis.md) | ปัญหา และสมมติฐานของ product ที่ตั้งใจไปพิสูจน์ |
| [03-user-persona.md](03-user-persona.md) | persona เดียวที่ทุกตัวอย่างและ seed data ยึดไว้ |
| [04-requirements.md](04-requirements.md) | requirement เชิงฟังก์ชันและไม่ใช่ฟังก์ชัน จัดลำดับ M/S/C |
| [05-data-design.md](05-data-design.md) | data model และ schema บน Supabase |
| [06-system-architecture.md](06-system-architecture.md) | สถาปัตยกรรมและเส้นทางของ request |
| [07-ai-design.md](07-ai-design.md) | system prompt · การคำนวณ pattern · วิธีทดสอบ AI |
| [08-safety-privacy.md](08-safety-privacy.md) | guardrail ความปลอดภัย และการออกแบบความเป็นส่วนตัว |
| [11-limitations-future.md](11-limitations-future.md) | สิ่งที่ระบบทำไม่ได้ · สิ่งที่ทำไปแล้วเพื่อไม่ให้มันหลอกผู้ใช้ · แผนถ้าไปต่อ |
| [12-ui-inventory.md](12-ui-inventory.md) | ทุก route ทุก state ตามที่แอปทำงานจริง พร้อมลิงก์เข้าโค้ดทุกจุด |

## ที่ควรเปิดดูด้วย

- [adr/](adr/) — บันทึกการตัดสินใจ 5 ฉบับ: ทำไมเป็นเว็บแอป · ทำไมสแตกนี้ · ทำไม Gemini free tier ·
  ทำไม seed data คู่กับ dogfooding · ทำไมมี auth สองแบบ
- [issues/](issues/) — issue tracker ที่โปรเจกต์นี้เดินด้วยจริง 69 ใบ ปิดพร้อมหลักฐานและผูกกับ PR
- [issues/ai-safety-test/](issues/ai-safety-test/) — ผลรันดิบจากโมเดล ไม่ตัดต่อ พร้อมลายเซ็นคนตรวจที่ไม่ได้เขียน prompt
- [agents.md](agents.md) — กติกาการทำงานในเรโป: อ่านอะไรก่อน · issue tracker · กฎที่ห้ามพลาด
- [../CONTEXT.md](../CONTEXT.md) — glossary หนึ่งความหมายหนึ่งคำ ใช้ทั้งในโค้ด issue และข้อความบนจอ
- [../DESIGN.md](../DESIGN.md) — กฎ UI ที่บังคับใช้จริง พร้อมเหตุการณ์ที่ทำให้เกิดกฎแต่ละข้อ

> [!NOTE]
> `12-ui-inventory.md` เป็น **descriptive** — บันทึกว่าแอปทำงานอย่างไรวันนี้
> `DESIGN.md` เป็น **prescriptive** — บังคับว่าโค้ดใหม่ทำอะไรได้บ้าง
> ถ้าสองไฟล์ขัดกัน แปลว่ามีอันหนึ่งเก่าแล้ว
