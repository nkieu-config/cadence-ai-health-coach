# HealthCoach

AI Personal Health Coach สำหรับนักศึกษาและ first jobber (Mission #5) — wellness coach ที่ช่วยเห็น pattern กิน–นอน–เคลื่อนไหว และตั้ง micro goal ที่ทำได้จริง ไม่ใช่ระบบวินิจฉัยโรค

เอกสารทั้งหมดอยู่ที่ [docs/README.md](docs/README.md) | ศัพท์กลางที่ต้องใช้: [CONTEXT.md](CONTEXT.md) | งาน: [.scratch/BOARD.md](.scratch/BOARD.md)

## Stack

Next.js 16 (App Router, TypeScript) + Tailwind v4 + shadcn/ui + Supabase + Gemini API — ดูเหตุผลใน [docs/adr/](docs/adr/)

ข้อควรรู้ Next.js 16: auth guard อยู่ที่ `src/proxy.ts` (convention ใหม่แทน `middleware.ts`) และก่อนเขียนโค้ดให้อ่าน docs ใน `node_modules/next/dist/docs/` เพราะ API ต่างจากเวอร์ชันเก่า

## Setup (ครั้งแรก ~10 นาที)

1. Clone แล้วติดตั้ง dependencies

   ```bash
   npm install
   ```

2. สร้างไฟล์ env จากตัวอย่าง แล้วเติมค่า

   ```bash
   cp .env.example .env.local
   ```

   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — จาก Supabase project settings (ถาม D)
   - `SUPABASE_SERVICE_ROLE_KEY` — ใช้เฉพาะ seed script และงาน server ห้ามใช้ใน client
   - `GEMINI_API_KEY` — key กลางของทีม (ถาม C)

3. รัน migration บน Supabase: เปิด SQL Editor แล้วรันไฟล์ `supabase/migrations/0001_init.sql` (ทำครั้งเดียวต่อ project — D ทำแล้วสำหรับ project กลาง)

4. รัน dev server

   ```bash
   npm run dev
   ```

## แผนที่โปรเจกต์

ของที่ทีมแตะบ่อย:

```
src/
├── app/                  หน้าและ API routes
├── proxy.ts              auth guard (Next.js 16 proxy convention)
├── lib/
│   ├── supabase/         client (browser) / server / admin
│   ├── ai/               Gemini + system prompt guardrail — ทุก AI call ต้องผ่านที่นี่
│   └── patterns/         คำนวณ pattern candidates (สถิติจริง ไม่ใช่ AI)
├── components/ui/        shadcn/ui components
supabase/migrations/      SQL schema + RLS
scripts/seed.ts           seed data demo account (INFRA-06)
docs/                     เอกสารทั้งหมด — เริ่มที่ docs/README.md (โจทย์อยู่ที่ docs/00-mission-brief.md)
.scratch/                 issue tracker — ภาพรวมงานอยู่ที่ .scratch/BOARD.md
CONTEXT.md                glossary ภาษากลาง — อ่านก่อนตั้งชื่อตัวแปร/เขียน UI copy
```

ไฟล์ config ที่ root (`package.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `components.json`, `.env.example`) เป็นตำแหน่งบังคับของ npm/Next/TypeScript/ESLint/Tailwind/shadcn — อย่าย้าย ส่วน `AGENTS.md`/`CLAUDE.md` เป็นกติกาสำหรับ AI coding agent อ่านตอนเริ่มงาน

## กติกาทีม

- ห้ามเรียก Gemini ตรง ๆ — ผ่าน `lib/ai` เท่านั้น (guardrail บังคับที่นั่น)
- ตัวเลข/สถิติทุกตัวที่ AI อ้าง ต้องมาจาก `lib/patterns` ไม่ใช่ให้ LLM คำนวณเอง
- Secrets อยู่ใน `.env.local` (git ignore แล้ว) — ห้าม commit key
- Feature branch + PR + review ≥ 1 คน แล้วค่อย merge `main`
- งานทั้งหมดดูใน `.scratch/BOARD.md` — claim โดยแก้ `Status:` ในไฟล์ issue
