# INFRA-15: CI ไม่เคยตรวจ main เลย + e2e ยังไม่อยู่ใน CI

Status: done
Owner: A
Sprint: 2
Priority: M — 3 สายกำลังจะ merge PR ขนานกัน
Refs: skill `github-actions-templates`
Blocked by: —

## ผลตรวจ

| | ก่อน | หลัง |
|---|---|---|
| 🔴 **trigger** | `pull_request` อย่างเดียว — **`main` ไม่เคยถูกตรวจ** และ A เคย push ตรงเข้า main ผ่าน admin bypass มาแล้ว | เพิ่ม `push: [main]` |
| 🟠 **permissions** | ไม่มีเลย → `GITHUB_TOKEN` ได้สิทธิ์ตาม default ของ repo | `contents: read` (least privilege) |
| 🟠 **concurrency** | ไม่มี → push 3 ครั้งติด = CI รัน 3 รอบพร้อมกัน | `cancel-in-progress: true` |
| 🟡 **timeout** | ไม่มี → job ค้างรันยาว 6 ชม. | `verify` 10 นาที · `e2e` 15 นาที |
| 🟡 **node version** | hardcode `22` ใน workflow (หลุดจาก `.nvmrc` ได้) | `node-version-file: .nvmrc` — จุดเดียว |
| 🔴 **e2e** | ไม่มีใน CI — **PR ที่ทำ layout พังผ่านเขียวหมด** | job `e2e` รัน `routes.spec` ทุก PR |

## e2e ใน CI — แยก read-only ออกจาก write

`repo เป็น public → GitHub Actions ฟรีไม่จำกัด` → รัน e2e ได้เต็มที่

- **`routes.spec.ts` = read-only** (เปิดหน้า อ่าน DOM วัด contrast) → **CI รันทุก PR** · ยืนยันแล้วว่าปาล์มยังมี 24 วันครบหลังรัน
- **`checkin.spec.ts` = เขียนข้อมูล** → **ไม่เอาเข้า CI** (จะแก้ check-in ของปาล์มทุก PR) · รันบนเครื่องตัวเองด้วย `npm run e2e`

CI ใช้ **production build** (`npm run start`) ไม่ใช่ dev — เหมือนของจริง · เครื่องตัวเองใช้ dev เพื่อความเร็ว

**ถ้ายังไม่ได้ตั้ง secrets → job e2e ข้ามไปเงียบ ๆ ไม่ทำให้ CI แดง** (มี notice บอกวิธีตั้ง)

## ✅ ตั้งค่าบน GitHub แล้ว (15 ก.ค.)

secrets 4 ตัวใส่ครบ (ไม่มี service role key) · required checks บน main = `verify` + `e2e (เปิดแอปจริง)` + `Vercel` · ยืนยันแล้ว: e2e รันจริงบน PR #22 (2m49s ไม่ข้าม) และปาล์มยังมี 24 วันครบหลังรัน · รายละเอียดที่ตั้งไว้เดิม 👇

### ⚠️ ต้องตั้งค่าบน GitHub (A ทำ)

**Settings → Secrets and variables → Actions → New repository secret** — 4 ตัว:

| Secret | ค่า |
|---|---|
| `SUPABASE_URL` | ค่าจาก `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`) |
| `SUPABASE_ANON_KEY` | ค่าจาก `.env.local` (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) |
| `DEMO_EMAIL` | `palm@example.com` |
| `DEMO_PASSWORD` | `PalmDemo2026!` |

🚫 **ห้ามใส่ `SUPABASE_SERVICE_ROLE_KEY` เด็ดขาด** — repo เป็น **public** และ e2e ไม่ต้องใช้

**Settings → Branches → main → Require status checks to pass**: เลือก **`verify`** และ **`e2e (เปิดแอปจริง)`**
✅ **ตั้งแล้ว** — required checks บน main = `verify` + `e2e (เปิดแอปจริง)` + `Vercel` (ผ่าน ruleset "Protect Main Branch") · PR ที่ CI แดง merge ไม่ได้แล้ว

## ⛔ ที่สกิลแนะนำแต่ไม่ทำ

- **Docker / Kubernetes / matrix build** — เราใช้ Vercel auto-deploy จาก main · ไม่มี container
- **Trivy / Snyk / CodeQL** — เหลือ 14 วัน · โปรเจกต์นักศึกษาไม่มี dependency เสี่ยง · `npm audit` พอ
- **Slack notification** — ทีมใช้ Discord 4 คน คุยกันเองเร็วกว่า
- **matrix Node 18/20/22** — เรารันบน Vercel ที่เป็น Node เดียว · ทดสอบหลายเวอร์ชัน = เสียเวลาเปล่า
