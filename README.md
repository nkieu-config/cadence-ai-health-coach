<div align="center">

<img src="src/app/icon.svg" alt="" width="72" height="72">

# Cadence

**เห็นจังหวะของตัวเอง แล้วเริ่มจากก้าวเล็ก ๆ ที่ทำได้จริง**

AI Personal Health Coach สำหรับนักศึกษาและ first jobber — ช่วยให้เห็น pattern การกิน–นอน–เคลื่อนไหว
ของตัวเอง แล้วตั้ง micro goal ที่ทำได้จริงในชีวิตที่ตารางไม่แน่นอน

[![CI](https://github.com/nkieu-config/ai-personal-health-coach-project/actions/workflows/ci.yml/badge.svg)](https://github.com/nkieu-config/ai-personal-health-coach-project/actions/workflows/ci.yml)
![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20RLS-3FCF8E?logo=supabase&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-3.1%20Flash%20Lite-4285F4?logo=googlegemini&logoColor=white)

[**เปิดแอปจริง**](https://personal-healthcoach.vercel.app/) •
[ภาพรวม](#ภาพรวม) •
[สำหรับกรรมการ](#สำหรับกรรมการ--ผู้รีวิว) •
[เริ่มใช้งาน](#เริ่มใช้งาน) •
[คำสั่ง](#คำสั่งที่มี) •
[เอกสาร](#เอกสาร)

<img src="docs/pitch/screenshots/light-desktop-dashboard.png" alt="หน้าภาพรวมสุขภาพของ Cadence แสดงสรุปวันนี้ กราฟแนวโน้มรายวัน และการวิเคราะห์รูปแบบพฤติกรรม" width="760">

</div>

## ภาพรวม

Cadence เป็น **wellness coach ไม่ใช่บริการทางการแพทย์** ผู้ใช้เช็คอินสั้น ๆ วันละไม่ถึง 3 นาที
ระบบเชื่อมโยงการกิน–นอน–เคลื่อนไหวเข้ากับบริบทชีวิต (เดดไลน์ เรียนเช้า เดินทาง) แล้วเสนอก้าวเล็ก ๆ
ที่ทำได้จริง โดยไม่ให้คะแนน ไม่จัดเกรด และไม่กดดันเรื่องรูปร่าง

```mermaid
flowchart LR
  U["ผู้ใช้"] --> APP["Next.js 16<br/>App Router"]
  APP --> DB[("Supabase<br/>Postgres + RLS")]
  APP --> P["lib/patterns<br/>คำนวณสถิติจริง"]
  P -- "ตัวเลข + หลักฐาน" --> AI["lib/ai<br/>guardrail + prompt"]
  AI -- "เรียบเรียงเป็นภาษา" --> G["Gemini API"]
  G --> APP
```

> [!IMPORTANT]
> **ตัวเลขทุกตัวที่ AI พูดถึงมาจาก `lib/patterns` ไม่ใช่จาก LLM** — Gemini ทำหน้าที่เรียบเรียงเป็นภาษาเท่านั้น
> ถ้า Gemini ล่มหรือโควตาหมด ระบบ fallback เป็น template ที่ยังใช้ตัวเลขจริง หน้าไม่พัง

**สิ่งที่ระบบทำ**

- **เช็คอินรายวัน** 4 ขั้น เป็นชิปกดล้วน — คำถามเสริมโผล่เฉพาะเมื่อเกี่ยว (นอนดึก → ถามเหตุผล)
- **ภาพรวมสุขภาพ** กราฟแนวโน้ม 4 แท็บ + timeline "คืนสู่เช้า" + สัญลักษณ์วันที่มีปัจจัยรบกวน
- **วิเคราะห์รูปแบบ** เชื่อม 3 เสาเข้ากับตารางชีวิต (ต้องมีข้อมูล ≥ 7 วันถึงจะวิเคราะห์)
- **โค้ชสนทนา** ถามก่อนด้วยข้อมูลจริงของผู้ใช้ ไม่ใช่ช่องแชทเปล่า + guided flow ตั้งเป้า 4 ขั้น
- **Micro goal** สัปดาห์ละไม่เกิน 2 ข้อ ติ๊กความคืบหน้ารายวัน
- **สรุปสัปดาห์** พร้อมตัวเลขเทียบสัปดาห์ก่อนที่คำนวณสดในโค้ด (ไม่ใช้ AI ไม่กินโควตา)

**สิ่งที่ระบบไม่ทำ** — ไม่วินิจฉัยโรค ไม่แนะนำยา/อาหารเสริม ไม่ให้แผนลดน้ำหนัก ไม่เก็บน้ำหนัก/ส่วนสูง/BMI/แคลอรี/รูปถ่าย

## สำหรับกรรมการ / ผู้รีวิว

เริ่มตรงนี้ ใช้เวลาราว 15 นาที

| ลำดับ | อยากเห็นอะไร | เปิดที่ |
| --- | --- | --- |
| 1 | **ระบบจริง** — บัญชี demo มีข้อมูลจริง 4 สัปดาห์ ครบทั้ง dashboard, pattern, coach, goal, reflection | [แอปบน production](https://personal-healthcoach.vercel.app/)<br/>`palm@example.com` / `PalmDemo2026!` |
| 2 | **Deliverables ครบ 14 ข้อ อยู่ไหนบ้าง** — สารบัญ map ข้อต่อข้อ + เกณฑ์ให้คะแนน 9 ข้อ | [docs/10-deliverables-checklist.md](docs/10-deliverables-checklist.md) |
| 3 | **หลักฐาน Safety** — 10 เคส × 2 ประโยค = 20/20 บนโมเดล production ผลดิบไม่ตัดต่อ + ลายเซ็นผู้ตรวจอิสระ | [.scratch/ai-safety-test/](.scratch/ai-safety-test/) |
| 4 | **เอกสารออกแบบ** — ปัญหา → persona → data → architecture → AI → safety/privacy → limitations | [docs/](docs/README.md) อ่านเรียงเลข 01→11 |
| 5 | **UI ทุกหน้า ทุกสถานะ** — บันทึกว่าแอปเป็นอย่างไรจริง พร้อมลิงก์โค้ดทุกจุด | [docs/12-ui-inventory.md](docs/12-ui-inventory.md) |
| 6 | **Process ของทีม** — issue tracker 65 งาน, PR history, CI 2 ด่านบังคับ | [.scratch/BOARD.md](.scratch/BOARD.md) + แท็บ Pull requests |

## เริ่มใช้งาน

**ต้องมีก่อน:** Node.js 22 ขึ้นไป (ตาม [`.nvmrc`](.nvmrc)) · บัญชี Supabase และ Gemini API key

```bash
git clone https://github.com/nkieu-config/ai-personal-health-coach-project.git
cd ai-personal-health-coach-project
cp .env.example .env.local    # เติมค่าตามตารางด้านล่าง
npm ci
npm run dev                   # http://localhost:3000
```

### ตัวแปรสภาพแวดล้อม

| ตัวแปร | ต้องมีไหม | หมายเหตุ |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ขอจาก A (ค่าเดียวกันทั้งทีม) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ค่าเดียวกันทั้งทีม |
| `GEMINI_API_KEY` | ✅ | **ของแต่ละคนเอง** ขอฟรีที่ [aistudio.google.com](https://aistudio.google.com/apikey) — โควตานับต่อโปรเจกต์ × โมเดล การใช้ key ร่วมกันจะแย่ง rate limit กันตอน dev |
| `SUPABASE_SERVICE_ROLE_KEY` | — | bypass RLS ได้ทั้งฐาน A ถือคนเดียว · ใช้เฉพาะ `seed` / `verify:*` · ไม่มีก็รันแอปได้ปกติ |
| `AI_MODEL` | ❌ | **ห้ามตั้งค้างไว้** — โมเดล production ล็อกที่ `src/lib/ai/model.ts` แล้ว มีไว้ override ชั่วคราวเท่านั้น |

> [!WARNING]
> ตั้ง `AI_MODEL` ค้างไว้ = รันคนละโมเดลกับ production เงียบ ๆ **เคยทำหลักฐาน safety เสียมาแล้ว 2 รอบ** (ดู INFRA-23)

Schema และ RLS อยู่ที่ [`supabase/migrations/`](supabase/migrations/) (`0001`→`0003`) — A รันบน project กลางให้แล้ว
เพื่อนร่วมทีมแค่ `git pull` ก็ใช้ได้ · ตรวจว่า schema ตรงจริงด้วย `npm run verify:db`

## ก่อนเปิด PR

```bash
npm run format && npm run lint && npx tsc --noEmit && npm test && npm run build
npm run e2e     # ~40 วิ — ต้องรันด้วยถ้าแตะ UI
```

CI บังคับ **2 ด่านทุก PR**: `verify` (5 ขั้นแรก) และ `e2e (เปิดแอปจริง)` ซึ่งเปิดทุกหน้าจริงบน
มือถือ+เดสก์ท็อป × light+dark แล้วเช็ค h1 อันเดียว · ไม่มี horizontal scroll · ปุ่ม ≥ 44px ·
contrast ≥ 4.5:1 · ไม่มี console error

> [!CAUTION]
> unit test ครอบแค่ตรรกะใน `lib/` — **PR ที่ทำ layout พังหรือ dashboard ขาว จะผ่าน `verify` เขียวหมด**
> `e2e` คือด่านเดียวที่จับได้

> [!NOTE]
> CI รันเฉพาะ [`e2e/routes.spec.ts`](e2e/routes.spec.ts) ซึ่งเป็น read-only เพื่อไม่แตะข้อมูลบัญชี demo ·
> เทสต์ที่เขียนข้อมูล ([`checkin.spec.ts`](e2e/checkin.spec.ts)) และเทสต์อื่นรันบนเครื่องตัวเองด้วย `npm run e2e`

**กฎ UI ทั้งหมด** อยู่ในส่วนแรกของ [DESIGN.md](DESIGN.md) — บังคับถ้าจะแตะหน้าจอ

## คำสั่งที่มี

| คำสั่ง | ทำอะไร |
| --- | --- |
| `npm run dev` | dev server |
| `npm run build` · `npm run lint` | build production · เช็ค lint |
| `npm test` | unit test (vitest) — ตรรกะใน `lib/` |
| `npm run e2e` | เปิดทุกหน้าจริง × มือถือ/เดสก์ท็อป × light/dark (~40 วิ) — **ต้องรันถ้าแตะ UI** |
| `npm run verify:db` | ยืนยัน schema + RLS (ตารางครบ · anon เข้าไม่ได้ · user เห็นข้ามกันไม่ได้) รันซ้ำได้หลังแก้ schema |
| `npm run test:ai` | ยิงเคสภาษาไทยผ่าน `lib/ai` เช็ค guardrail + latency · เจาะเคสเดียวด้วย `-- <id/category>` |
| `npm run shots` | ถ่าย screenshot ทุกหน้า × light/dark × มือถือ/เดสก์ท็อป ลง `docs/pitch/screenshots/` |
| `npm run refresh:demo-week` | **เตรียมบัญชี demo ก่อนนำเสนอ** — เติม goal สัปดาห์ปัจจุบัน + อุ่น insight/reflection ให้ตรงวัน · `-- --goal-only` = ไม่ยิง Gemini |

> [!TIP]
> ของในบัญชี demo ผูกกับวันที่ จึงเก่าเองทุกวัน — เช้าวันนำเสนอให้รัน `npm run refresh:demo-week` ก่อนเสมอ
> ขั้นตอนเต็มอยู่ใน [docs/pitch/demo-script.md](docs/pitch/demo-script.md)

คำสั่งที่ยิง Supabase หรือ Gemini ต้องมี `.env.local` ครบ · `test:ai` คือสคริปต์ที่ผลิต[หลักฐาน safety](.scratch/ai-safety-test/) ของ QA-01

## โครงสร้างโปรเจกต์

```
src/
├── app/                  หน้าและ route ทั้งหมด (App Router)
├── proxy.ts              auth guard — Next.js 16 ใช้ชื่อนี้แทน middleware.ts
├── lib/
│   ├── ai/               Gemini + system prompt guardrail — ทุก AI call ต้องผ่านที่นี่
│   ├── patterns/         คำนวณ pattern จากสถิติจริง (ไม่ใช่ AI)
│   ├── supabase/         client (browser) / server / admin
│   └── checkins/         วันที่ · label ภาษาไทย · validation
├── components/ui/        shadcn/ui
supabase/migrations/      SQL schema + RLS
docs/                     เอกสารทั้งหมด — เริ่มที่ docs/README.md
.scratch/                 issue tracker (ไม่มี tracker ภายนอก) — ภาพรวมที่ .scratch/BOARD.md
CONTEXT.md                glossary ภาษากลาง — อ่านก่อนตั้งชื่อตัวแปรหรือเขียน UI copy
DESIGN.md                 กฎ UI — บังคับถ้าจะแตะหน้าจอ
AGENTS.md · CLAUDE.md     กติกาสำหรับ AI coding agent
```

> [!NOTE]
> **Next.js 16 ต่างจากที่คุ้นเคย** — auth guard คือ `src/proxy.ts` (ไม่ใช่ `middleware.ts`) และ API หลายตัวเปลี่ยนไป
> ก่อนเขียนโค้ดให้อ่าน docs ที่มากับแพ็กเกจใน `node_modules/next/dist/docs/`

## กติกาที่ห้ามพลาด

- **ห้ามเรียก Gemini ตรง ๆ** — ผ่าน `lib/ai` เท่านั้น เพราะ guardrail บังคับอยู่ที่นั่น
- **ตัวเลขที่ AI อ้างต้องมาจาก `lib/patterns`** ไม่ใช่ให้ LLM คำนวณเอง
- **เปิด issue ก่อนเขียนโค้ด** · 1 issue = 1 branch = 1 PR + review ≥ 1 คน
- **ห้าม commit secret** — `.env.local` ถูก gitignore แล้ว
- **ห้ามเทสด้วยบัญชีปาล์ม** — สมัครบัญชีทิ้งแทน เพราะปาล์มคือบัญชีที่ใช้ demo วันนำเสนอ

กติกาที่เหลือ (sync main, โซนไฟล์ของแต่ละสาย, การ claim งาน) อยู่ใน [.scratch/BOARD.md](.scratch/BOARD.md)

## เอกสาร

| ไฟล์ | เนื้อหา |
| --- | --- |
| [docs/README.md](docs/README.md) | สารบัญเอกสารทั้งหมด อ่านเรียงเลข 01→12 |
| [docs/00-mission-brief.md](docs/00-mission-brief.md) | โจทย์ต้นทาง (Mission #5) — อ้างอิงเสมอเวลาตัดสิน scope |
| [docs/12-ui-inventory.md](docs/12-ui-inventory.md) | แอปมีหน้าตาและพฤติกรรมอย่างไรจริง ทุก route ทุก state |
| [docs/adr/](docs/adr/) | เหตุผลเบื้องหลังการตัดสินใจทางเทคนิค (ADR-0001→0005) |
| [CONTEXT.md](CONTEXT.md) | glossary ภาษากลาง ใช้คำตามนิยามนี้ทั้งในโค้ด issue และ UI copy |
| [DESIGN.md](DESIGN.md) | กฎ UI ที่บังคับใช้จริง + ที่มาของ theme |

Deploy อัตโนมัติจาก branch `main` ไป [personal-healthcoach.vercel.app](https://personal-healthcoach.vercel.app/)
