# 06 — System Architecture & Workflow

## ภาพรวมสถาปัตยกรรม

```mermaid
graph TB
    U[ผู้ใช้ - Browser mobile/desktop]
    subgraph Vercel
        FE[Next.js App Router<br/>UI: Tailwind + shadcn/ui]
        API[Next.js Server Actions]
        AI[lib/ai — AI service module<br/>system prompt guardrail กลาง]
        PA[lib/patterns — pattern computation<br/>คำนวณสถิติด้วยโค้ด]
    end
    subgraph Supabase
        AUTH[Auth]
        DB[(Postgres + RLS)]
    end
    GEM[Google Gemini API<br/>free tier]

    U --> FE
    FE --> API
    API --> AUTH
    API --> DB
    API --> PA
    PA --> AI
    AI --> GEM
```

หลักการสำคัญ:

- **ตัวเลขมาจากโค้ด ภาษามาจาก LLM** — `lib/patterns` คำนวณสถิติจริงจาก check-in (ค่าเฉลี่ย, การจับกลุ่มตาม disruptor) แล้วส่งผลลัพธ์เป็น structured data ให้ Gemini แปลงเป็นภาษา insight เท่านั้น ป้องกัน LLM มโนตัวเลข
- **Guardrail จุดเดียว** — ทุก call ไป Gemini ผ่าน `lib/ai` ที่แนบ system prompt guardrail เดียวกันเสมอ ไม่มีทางลัด
- **Gemini ถูกเรียกฝั่ง server เท่านั้น** — API key ไม่หลุดไป client

## Workflow หลัก 4 เส้น

### 1. Daily Check-in

```mermaid
sequenceDiagram
    participant ผู้ใช้
    participant App
    participant DB as Supabase
    ผู้ใช้->>App: เปิดหน้า check-in (ก่อนนอน)
    App->>ผู้ใช้: ฟอร์ม 5 กลุ่มคำถาม (ปุ่มเลือก ≤ 3 นาที)
    ผู้ใช้->>App: บันทึก
    App->>DB: upsert checkins (unique ต่อวัน)
    App->>ผู้ใช้: สรุปวันนี้สั้น ๆ + คำขอบคุณเชิงบวก
```

### 2. Pattern Analysis (เบื้องหลัง dashboard)

```mermaid
sequenceDiagram
    participant App
    participant PA as lib/patterns
    participant AI as lib/ai
    participant GEM as Gemini
    participant DB as Supabase
    App->>DB: ดึง checkins 14-30 วัน
    alt ข้อมูล < 7 วัน
        App-->>App: แสดง "ยังไม่พอวิเคราะห์" + ชวนบันทึกต่อ
    else ข้อมูลพอ
        App->>PA: คำนวณ pattern candidates (สถิติจริง)
        PA->>AI: candidates + บริบทผู้ใช้
        AI->>GEM: system prompt guardrail + ข้อมูล
        GEM-->>AI: insight ภาษาไทย (สัญญาณ ≠ ข้อสรุป)
        AI->>DB: cache ลง ai_outputs
        App-->>App: แสดงตาราง pattern → ความหมาย → next step
    end
```

### 3. Coach Conversation + Micro Goal

```mermaid
sequenceDiagram
    participant ผู้ใช้
    participant App
    participant AI as lib/ai
    participant DB as Supabase
    ผู้ใช้->>App: เปิดแชท / เริ่ม flow "ตั้งเป้าสัปดาห์หน้า"
    App->>DB: โหลด context (checkins ล่าสุด, patterns, goal ปัจจุบัน)
    App->>AI: ประวัติแชท + context
    AI-->>App: คำถามนำ / คำแนะนำ practical
    ผู้ใช้->>App: คุยต่อจนตกลง goal
    App->>DB: บันทึก goal (status: active)
    Note over AI: ถ้าเจอข้อความเชิงอาการป่วย/กังวลสุขภาพจิต<br/>ตอบด้วยข้อความแนะนำพบผู้เชี่ยวชาญ
```

### 4. Weekly Reflection

ทุกครั้งที่ผู้ใช้เปิดหน้า reflection ของสัปดาห์ที่จบแล้วและยังไม่มีรายงาน → ระบบดึง checkins + goal ของสัปดาห์นั้น → คำนวณสรุปด้วยโค้ด → ให้ Gemini เขียนรายงานตามโครงโจทย์ Feature 6 → cache ลง `ai_outputs`

## โครงสร้างโปรเจกต์ (แนว)

```
src/
├── app/
│   ├── (auth)/login, register
│   ├── onboarding/
│   ├── auth/callback/          ← OAuth PKCE (ADR-0005)
│   └── (app)/                  ← ทุกหน้าหลัง login ใช้ layout + guard ร่วมกัน
│       ├── checkin/            ← + /history, /edit/[date]
│       ├── dashboard/
│       ├── coach/
│       ├── goals/
│       ├── reflection/
│       └── settings/privacy/
├── lib/                        ← "เครื่องยนต์" ทั้งหมด · UI เรียกผ่านที่นี่เท่านั้น
│   ├── supabase/               ← client (RLS) + admin (service role — ลบบัญชีเท่านั้น)
│   ├── checkins/               ← queries, actions, validate, labels, summary, date, derive
│   ├── patterns/               ← คำนวณ pattern candidates จากสถิติจริง (ไม่มี LLM)
│   ├── ai/                     ← ประตูเดียวสู่ Gemini: system prompt + client (สลับ provider ได้)
│   ├── ai-outputs/             ← ประตูเดียวสู่ตาราง ai_outputs (insight + reflection)
│   ├── chat/ · goals/ · account/ · onboarding/
│   └── safety/language.ts      ← รายการคำต้องห้าม (ชุดเดียวทั้งระบบ — CI บังคับ)
└── components/
scripts/
├── seed.ts                     ← seed data ของ demo account (ADR-0004)
└── verify-user.ts              ← พิสูจน์ว่าลบข้อมูลแล้วไม่มีแถวตกค้าง (หลักฐาน FR-7.2)
supabase/migrations/            ← 0001_init.sql, 0002_mission_input_coverage.sql
```

**ไม่มี `app/api/` — ทุก mutation เป็น Server Action** (`"use server"` ใน `lib/*/actions.ts`) ทำให้ API key และ service role อยู่ฝั่ง server เสมอโดยไม่ต้องเขียน route handler เอง

## Environments

| อย่าง | ค่า |
|---|---|
| Production | Vercel (auto deploy จาก branch `main`) |
| Database | Supabase project เดียว (free tier) |
| Secrets | `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` ใน Vercel env vars เท่านั้น |
| Repo | GitHub — branch protection บน `main`, feature branch + PR review ขั้นต่ำ 1 คน |
