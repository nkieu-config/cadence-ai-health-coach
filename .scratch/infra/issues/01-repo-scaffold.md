# INFRA-01: ตั้ง GitHub repo + Next.js scaffold

Status: done
Owner: D
Sprint: 0
Priority: M
Refs: ADR-0002, docs/06 (โครงสร้างโปรเจกต์)

## งาน

- [x] สร้าง GitHub repo — https://github.com/nkieu-config/cadence-ai-health-coach + เชิญทีมครบ 4 คน
- [x] Next.js (App Router, TypeScript) + Tailwind + shadcn/ui
- [x] โครงโฟลเดอร์ตาม docs/06: `app/`, `lib/supabase`, `lib/patterns`, `lib/ai`, `components/`, `scripts/`
- [x] Branch protection บน `main` + PR template สั้น ๆ
- [x] README วิธี setup local (env vars ที่ต้องมี)

## Acceptance criteria

- ทีมทุกคน clone แล้ว `npm run dev` ขึ้นภายใน 10 นาที
- Push ตรง `main` ไม่ได้ ต้องผ่าน PR

## Comments

2026-07-06 (AI scaffold): scaffold เสร็จ (Next.js 16.2 + Tailwind v4 + shadcn + โครง lib ครบ) · เหลือของที่ต้องใช้บัญชีทีม — สร้าง GitHub repo + push, branch protection, PR template
ข้อควรรู้: Next.js 16 ย้าย `middleware.ts` เป็น `src/proxy.ts` — อ่าน `node_modules/next/dist/docs/` ก่อนเขียนโค้ด เพราะ API ต่างจากที่คุ้น

2026-07-07: push ขึ้น GitHub แล้ว 2 commits — เหลือ เชิญทีม 3 คน, branch protection บน main, PR template

2026-07-07 (resolved): เชิญทีมครบ + branch protection + PR template (`.github/pull_request_template.md`) → ปิด INFRA-01
