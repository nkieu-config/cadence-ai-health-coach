<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Cadence — กติกาการทำงานในเรโปนี้

ใช้กับทุกคนที่แก้โค้ดนี้ ไม่ว่าจะเป็นคนหรือ AI agent · ขั้นตอนรันและคำสั่งอยู่ใน [../CONTRIBUTING.md](../CONTRIBUTING.md)

## อ่านก่อนเริ่มงาน

- **[`CONTEXT.md`](CONTEXT.md)** — glossary ภาษากลาง ใช้คำตามนิยามนี้เสมอ ทั้งในโค้ด issue และ UI copy
- **[`adr/`](adr/)** — เหตุผลเบื้องหลังการตัดสินใจทางเทคนิค · ถ้างานที่จะทำขัดกับ ADR ไหน **ให้บอกออกมาตรง ๆ อย่าเงียบแล้วทำทับ**
- **[`DESIGN.md`](DESIGN.md)** ส่วนแรก (ถึงเส้น `---` แรก) — บังคับถ้าจะแตะ UI

## Issue tracker

Issue อยู่เป็นไฟล์ markdown ในเรโปนี้ ไม่มี tracker ภายนอก

- 1 feature = 1 โฟลเดอร์ `docs/issues/<feature-slug>/` · PRD อยู่ที่ `docs/issues/<feature-slug>/PRD.md`
- Issue คือ `docs/issues/<feature-slug>/issues/<NN>-<slug>.md` เริ่มจาก `01`
- สถานะเขียนเป็นบรรทัด `Status:` ใกล้หัวไฟล์ — ค่าที่ใช้จริง: `ready-for-agent` · `ready-for-human` · `done` · `wontfix`
- ความคืบหน้า/บทสนทนา **ต่อท้ายไฟล์** ใต้หัวข้อ `## Comments` พร้อมวันที่และคนเขียน
- ภาพรวมงานทั้งหมดอยู่ที่ `docs/issues/BOARD.md`

## กติกาที่ห้ามพลาด

- **เปิด issue ก่อนเขียนโค้ด** · 1 issue = 1 branch = 1 PR
- เรียก Gemini ผ่าน `src/lib/ai` เท่านั้น (guardrail อยู่ที่นั่น) · ตัวเลขที่ AI อ้างต้องมาจาก `src/lib/patterns` ไม่ใช่ให้ LLM คำนวณเอง
- ห้าม commit secret · `.env.local` ถูก gitignore แล้ว
- ก่อนเปิด PR: `npm run format && npm run lint && npx tsc --noEmit && npm test && npm run build` (CI บังคับ 5 ด่านนี้) · แตะ UI ให้รัน `npm run e2e` ด้วย

> [!NOTE]
> ไฟล์นี้เคยอยู่ที่ราก (`AGENTS.md` คู่กับ `CLAUDE.md`) ซึ่งเครื่องมือ agent จะอ่านให้เองอัตโนมัติ
> ย้ายลงมาที่นี่แล้วต้องชี้ให้อ่านเอง — อยากได้พฤติกรรมเดิมคืน สร้าง `AGENTS.md` ที่ราก มีบรรทัดเดียวว่า `@docs/agents.md`
