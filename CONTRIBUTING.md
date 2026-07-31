# การพัฒนา Cadence

คู่มือสำหรับคนที่จะรันหรือแก้โค้ดนี้ · ภาพรวมผลงานอยู่ใน [README.md](README.md)

## เริ่มใช้งาน

**ต้องมีก่อน:** Node.js 22 ขึ้นไป (ตาม [`.nvmrc`](.nvmrc)) · บัญชี Supabase และ Gemini API key

```bash
git clone https://github.com/nkieu-config/cadence-ai-health-coach.git
cd cadence-ai-health-coach
cp .env.example .env.local    # เติมค่าตามตารางด้านล่าง
npm ci
npm run dev                   # http://localhost:3000
```

### ตัวแปรสภาพแวดล้อม

| ตัวแปร | ต้องมีไหม | หมายเหตุ |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | |
| `GEMINI_API_KEY` | ✅ | ขอฟรีที่ [aistudio.google.com](https://aistudio.google.com/apikey) — โควตานับต่อโปรเจกต์ × โมเดล การใช้ key ร่วมกันจะแย่ง rate limit กัน |
| `SUPABASE_SERVICE_ROLE_KEY` | — | bypass RLS ได้ทั้งฐาน · ไม่มีก็รันแอปได้ปกติ แต่สคริปต์เตรียม/ตรวจข้อมูลรันไม่ได้ |
| `DEMO_EMAIL` · `DEMO_PASSWORD` | — | บัญชีที่สคริปต์กับ e2e ใช้ล็อกอิน · **ไม่มีค่า default ในโค้ด** ถ้าไม่ตั้ง สคริปต์จะหยุดพร้อมบอกชื่อตัวแปร |
| `AI_MODEL` | ❌ | **ห้ามตั้งค้างไว้** — โมเดล production ล็อกที่ `src/lib/ai/model.ts` แล้ว มีไว้ override ชั่วคราวเท่านั้น |

> [!WARNING]
> ตั้ง `AI_MODEL` ค้างไว้ = รันคนละโมเดลกับ production เงียบ ๆ **เคยทำหลักฐาน safety เสียมาแล้ว 2 รอบ**
> ตอนนี้มี unit test ล็อกชื่อโมเดลไว้แล้ว การเปลี่ยนเงียบ ๆ จึงเป็นไปไม่ได้อีก

**14 สคริปต์ที่ต้องมี `SUPABASE_SERVICE_ROLE_KEY`** — `seed` · `refresh:demo-week` · `backfill:demo-ai` ·
`seed:coach-chat` · `verify:db` · `verify:rls` · `verify:seed` · `verify:user` · `test:insight` · `test:goal` ·
`test:reflection` · `test:coach` · `test:coach-safety` · `compare:models` · **`test:ai` ไม่ต้องมี** (ใช้ Gemini key อย่างเดียว)

Schema และ RLS อยู่ที่ [`supabase/migrations/`](supabase/migrations/) (`0001`→`0005`) ·
ตรวจว่า schema ตรงจริงด้วย `npm run verify:db`

## ก่อนเปิด PR

คำสั่ง 5 ด่านและกติกาการทำงานทั้งหมดอยู่ใน **[docs/agents.md](docs/agents.md) ที่เดียว** —
หัวข้อนี้เก็บเฉพาะสิ่งที่ไฟล์นั้นไม่ได้บอก

CI บังคับ **2 ด่านทุก PR**: `verify` (format · lint · tsc · test · build) และ `e2e (เปิดแอปจริง)`
ซึ่งเปิดทุกหน้าจริงบนมือถือ+เดสก์ท็อป × light+dark แล้วเช็ค h1 อันเดียว · ไม่มี horizontal scroll ·
ปุ่ม ≥ 44px · contrast ≥ 4.5:1 · ไม่มี console error

> [!CAUTION]
> unit test ครอบแค่ตรรกะใน `lib/` — **PR ที่ทำ layout พังหรือ dashboard ขาว จะผ่าน `verify` เขียวหมด**
> `e2e` คือด่านเดียวที่จับได้

> [!NOTE]
> CI รันเฉพาะ [`e2e/routes.spec.ts`](e2e/routes.spec.ts) กับ [`e2e/theme.spec.ts`](e2e/theme.spec.ts)
> ซึ่งไม่แตะข้อมูลบัญชี demo · เทสต์ที่เขียนข้อมูล ([`checkin.spec.ts`](e2e/checkin.spec.ts)) รันบนเครื่องตัวเองด้วย `npm run e2e`

**กฎ UI ทั้งหมด** อยู่ในส่วนแรกของ [DESIGN.md](DESIGN.md) — บังคับถ้าจะแตะหน้าจอ

## คำสั่งที่มี

| คำสั่ง | ทำอะไร |
| --- | --- |
| `npm run dev` | dev server |
| `npm run build` · `npm run lint` | build production · เช็ค lint |
| `npm test` | unit test (vitest) — ตรรกะใน `lib/` |
| `npm run e2e` | เปิดทุกหน้าจริง × มือถือ/เดสก์ท็อป × light/dark (~40 วิ) — **ต้องรันถ้าแตะ UI** |
| `npm run verify:db` | ยืนยัน schema + RLS (ตารางครบ · anon เข้าไม่ได้ · user เห็นข้ามกันไม่ได้) |
| `npm run test:ai` | ยิงเคสภาษาไทยผ่าน `lib/ai` เช็ค guardrail + latency · เจาะเคสเดียวด้วย `-- <id/category>` |
| `npm run seed` | สร้างข้อมูล 4 สัปดาห์ของ persona ขึ้นใหม่ทั้งชุด |
| `npm run refresh:demo-week` | อุ่นข้อมูลบัญชี demo ให้ตรงวันปัจจุบัน · `-- --goal-only` = ไม่ยิง Gemini |
| `npm run shots:readme` | ถ่ายภาพหน้าจอชุดที่ใช้ใน README (ต้องมี `cwebp`) |
| `npm run deck` | สร้าง PDF สรุปผลงานจาก `docs/pitch/deck/showcase-en.html` พร้อมตรวจเนื้อหาล้น ภาพเสีย ฟอนต์ไม่ติด |

## บัญชี demo ที่เปิดให้คนนอกลอง

`palm@example.com` ประกาศไว้ใน README จึงต้องมีข้อมูลครบตลอดเวลา แต่ข้อมูลผูกกับวันที่และใครก็กดลบทิ้งได้

[`.github/workflows/refresh-demo.yml`](.github/workflows/refresh-demo.yml) รัน `refresh:demo-week` ทุกวัน 21:00 UTC
(ตี 4 เวลาไทย) แล้วปิดท้ายด้วย `verify:seed` ซึ่ง exit 1 ถ้าตาราง Feature 2 ไม่ครบ 3 แถว —
งานเขียว = หน้า dashboard ของบัญชี demo มีของจริงให้ดู · กดรันเองได้จากแท็บ Actions

**secrets ที่งานนี้ต้องมี** — `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` ·
`SUPABASE_SERVICE_ROLE_KEY` · `GEMINI_API_KEY` · `DEMO_EMAIL` · `DEMO_PASSWORD`
(ขาดตัวไหนงานจะหยุดพร้อมบอกชื่อ ไม่ใช่รันครึ่ง ๆ กลาง ๆ)

> [!WARNING]
> GitHub ปิด scheduled workflow ของ public repo อัตโนมัติเมื่อเรโปไม่มีความเคลื่อนไหว 60 วัน
> (มีเมลเตือนก่อน · กดเปิดคืนหรือ push อะไรก็รีเซ็ตตัวนับ) — ถ้าเรโปนิ่งยาว ให้เช็คว่างานนี้ยังเดินอยู่

> [!TIP]
> รันบนเครื่องตัวเองก็ได้ — `npm run refresh:demo-week` · เติม `-- --goal-only` ถ้าไม่อยากยิง Gemini

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
docs/                     เอกสารออกแบบ · ADR · issue tracker
```

> [!NOTE]
> **Next.js 16 ต่างจากที่คุ้นเคย** — auth guard คือ `src/proxy.ts` (ไม่ใช่ `middleware.ts`)
> ก่อนเขียนโค้ดให้อ่าน docs ที่มากับแพ็กเกจใน `node_modules/next/dist/docs/`

## บัญชีที่ใช้ทดสอบ

> [!CAUTION]
> **ฐานข้อมูลมีชุดเดียว** — ไม่ว่าจะรันจาก localhost หรือ production ก็แตะแถวเดียวกัน
> ใช้ `qa-bot@example.com` สำหรับทดสอบ (ข้อมูลชุดเดียวกับบัญชี demo · เละแล้ว `npm run seed` คืนสภาพได้)
> รหัสผ่านอยู่ใน `.env.local` ของแต่ละคน ไม่เก็บในเรโป
