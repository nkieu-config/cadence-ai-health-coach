# HealthCoach

AI Personal Health Coach สำหรับนักศึกษาและ first jobber (Mission #5) — wellness coach ที่ช่วยเห็น pattern กิน–นอน–เคลื่อนไหว และตั้ง micro goal ที่ทำได้จริง ไม่ใช่ระบบวินิจฉัยโรค

**Production:** https://personal-healthcoach.vercel.app/ (deploy อัตโนมัติจาก branch `main`)

เอกสารทั้งหมดอยู่ที่ [docs/README.md](docs/README.md) | ศัพท์กลางที่ต้องใช้: [CONTEXT.md](CONTEXT.md) | งาน: [.scratch/BOARD.md](.scratch/BOARD.md)

## 🎓 สำหรับกรรมการ / ผู้รีวิว (เริ่มตรงนี้ ~15 นาที)

| ลำดับ | อยากเห็นอะไร | เปิดที่ |
|---|---|---|
| 1 | **ระบบจริง** — login `palm@example.com` / `PalmDemo2026!` (นักศึกษาที่บันทึกมา 4 สัปดาห์: dashboard, pattern, coach, goal, reflection มีข้อมูลจริงครบ) | [แอปบน production](https://personal-healthcoach.vercel.app/) |
| 2 | **Deliverables ครบ 14 ข้อ อยู่ไหนบ้าง** — สารบัญ map ข้อต่อข้อ + mapping เกณฑ์ให้คะแนน 9 ข้อ | [docs/10-deliverables-checklist.md](docs/10-deliverables-checklist.md) |
| 3 | **หลักฐาน Safety** — checklist 10 เคส × 2 ประโยค = 20/20 บนโมเดล production ผลดิบไม่ตัดต่อ + ลายเซ็นผู้ตรวจอิสระ | [.scratch/ai-safety-test/](.scratch/ai-safety-test/) |
| 4 | **เอกสารออกแบบ** — ปัญหา → persona → data → architecture → AI → safety/privacy → limitations | [docs/](docs/README.md) อ่านเรียงเลข 01→11 |
| 5 | **Process ของทีม** — issue tracker 65 งาน, PR history, CI 2 ด่านบังคับ | [.scratch/BOARD.md](.scratch/BOARD.md) + แท็บ Pull requests |

## เริ่มยังไง (เพื่อนร่วมทีมอ่านตรงนี้)

```bash
git clone <repo> && cd HealthCoach
cp .env.example .env.local      # เติมค่าตามด้านล่าง
npm ci
npm run dev
```

**ค่าใน `.env.local`:**

- `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` — ขอจาก A
- `SUPABASE_SERVICE_ROLE_KEY` — เฉพาะ seed / งาน server ห้ามใช้ฝั่ง client
- `GEMINI_API_KEY` — **ของแต่ละคนเอง** สมัครฟรีที่ [aistudio.google.com](https://aistudio.google.com) (กันแย่ง rate limit ตอน dev); production ใช้ key เดียวใน Vercel

Migration อยู่ที่ `supabase/migrations/` (`0001`→`0003`) — project กลาง A รันให้แล้ว เพื่อนแค่ `git pull` ก็ใช้ได้ · ล็อกอิน demo **`palm@example.com` / `PalmDemo2026!`** → มีข้อมูล 24 วันพร้อม pattern **ไม่ต้องกรอก check-in เอง**

**ก่อนเปิด PR:** `npm run format && npm run lint && npx tsc --noEmit && npm test && npm run build`
(CI ตรวจ 5 ด่านนี้ทุก PR — รันเองก่อนจะได้ไม่ต้องรอ CI แดง)

**ถ้าแตะ UI ให้รัน `npm run e2e` ด้วย** (~40 วินาที) — เปิดทุกหน้าจริงบนมือถือ+เดสก์ท็อป × light+dark แล้วเช็ค:
h1 อันเดียว · ไม่มี horizontal scroll · ปุ่มสูง ≥ 44px · **ข้อความอ่านออก (contrast ≥ 4.5:1)** · ไม่มี console error · เช็คอินบันทึกได้จริง

> unit test ครอบแค่ตรรกะใน `lib/` — **PR ที่ทำ layout พังหรือ dashboard ขาว จะผ่าน CI เขียวหมด** `e2e` คือด่านเดียวที่จับได้

**กฎ UI:** ส่วนแรกของ [DESIGN.md](DESIGN.md) — งาน: [.scratch/BOARD.md](.scratch/BOARD.md)

## Stack

Next.js 16 (App Router, TypeScript) + Tailwind v4 + shadcn/ui + Supabase + Gemini API — ดูเหตุผลใน [docs/adr/](docs/adr/)

ข้อควรรู้ Next.js 16: auth guard อยู่ที่ `src/proxy.ts` (convention ใหม่แทน `middleware.ts`) และก่อนเขียนโค้ดให้อ่าน docs ใน `node_modules/next/dist/docs/` เพราะ API ต่างจากเวอร์ชันเก่า

## คำสั่งที่มี

| คำสั่ง | ทำอะไร |
|---|---|
| `npm run dev` | dev server |
| `npm run build` / `npm run lint` | build production / เช็ค lint |
| `npm run verify:db` | ยืนยัน schema + RLS ของ Supabase (ตารางครบ, anon เข้าไม่ได้, user เห็นข้ามกันไม่ได้) รันซ้ำได้หลังแก้ schema |
| `npm run test:ai` | ยิงเคสภาษาไทยผ่าน `lib/ai` เช็ค guardrail + latency; เจาะเคสเดียวด้วย `npm run test:ai -- <id/category>` |

`verify:db` และ `test:ai` ต้องมี `.env.local` ครบ — เป็นฐานของงาน QA-01 (safety checklist) ตอน Sprint 3

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
