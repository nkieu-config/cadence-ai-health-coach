# 10 — Deliverables Checklist & Evaluation Mapping

## Expected Deliverables 14 รายการ (Mission ข้อ 10)

> อัปเดต 14 ก.ค. 2026 — เจ้าของเป็น "สาย" ตามแผนใหม่ใน [docs/09](09-project-plan.md) ไม่ใช่รายคนแล้ว

| # | Deliverable | อยู่ที่ไหน | สาย | สถานะ |
|---|---|---|---|---|
| 1 | Problem analysis | [02-problem-analysis.md](02-problem-analysis.md) | A | ✅ |
| 2 | User persona | [03-user-persona.md](03-user-persona.md) | A | ✅ |
| 3 | Health behavior data design | [05-data-design.md](05-data-design.md) | A | ✅ + ตารางตรวจ **โจทย์ข้อ 5 ครบทุกบรรทัด** |
| 4 | System workflow | [06-system-architecture.md](06-system-architecture.md) | A | ✅ |
| 5 | Prototype / demo | Web app บน Vercel | ทุกสาย | 🔶 F0/F1 ใช้จริงแล้ว · F2–F6 Sprint 2–3 |
| 6 | ตัวอย่าง daily check-in | ในแอป (`/checkin`) + screenshot | A | ✅ **ใช้งานจริง + dogfooding ตั้งแต่ 13 ก.ค.** |
| 7 | ตัวอย่าง dashboard | ในแอป (demo account) + screenshot | 🟦 | 🔶 layout + ช่วง 7/14/30 เสร็จ · กราฟ Sprint 2 |
| 8 | ตัวอย่าง pattern analysis | ในแอป + ตัวอย่าง output ใน pitch deck | A + 🟦 | 🔶 engine ✅ (F3-03 Gemini จริง) · รอ UI ตาราง F2-04 (🟦) |
| 9 | ตัวอย่าง AI coaching conversation | ในแอป (guided flow) + transcript | A + 🟩 | 🔶 engine ✅ (F4-02 context + F4-04 escalation) · รอ UI F4-01/F4-03 (🟩) |
| 10 | ตัวอย่าง micro goal recommendation | ในแอป + ตัวอย่างใน pitch deck | A + 🟨 | 🔶 engine ✅ (F5-01 goal AI + validation) · รอ UI F5-02 (🟨) |
| 11 | ตัวอย่าง weekly reflection | ในแอป + ตัวอย่างเต็ม 1 ฉบับ | A + 🟨 | 🔶 engine ✅ (F6-01 Gemini จริง) · รอ UI F6-02 (🟨) |
| 12 | Safety guardrail | [08](08-safety-privacy.md) Part 1 + `lib/ai` + `lib/safety/language.ts` + ผลทดสอบ 10 ข้อ | A | ✅ design + guardrail (CI บังคับ) · escalation ยืนยัน 9/9 (F4-04) / ⬜ checklist เต็ม 10 ข้อ (QA-01) |
| 13 | Privacy design | [08](08-safety-privacy.md) Part 2 + `/settings/privacy` | A + 🟨 | ✅ design + หน้าในแอป (ตอบโจทย์ข้อ 9 ครบ 6/6) / ⬜ ปุ่มลบ Sprint 2 |
| 14 | Limitations & future improvement plan | เขียน Sprint 3 → `docs/11-limitations-future.md` | A | ⬜ Sprint 3 |

## Mapping กับ Evaluation Criteria 9 ข้อ (Mission ข้อ 11)

| เกณฑ์ | เราตอบด้วยอะไร | หลักฐานตอน pitch |
|---|---|---|
| Target User Fit | Persona ปาล์มลงลึกระดับตารางชีวิต + disruptor design | เดินเรื่อง demo ด้วย scenario ปาล์ม + เล่า dogfooding |
| Completeness | ครบ 3 pillars ทุก feature ตั้งแต่ data model ถึง reflection · **Required Input ของโจทย์ข้อ 5 ครบทุกบรรทัด** | โชว์ check-in/dashboard ครบ 3 ด้าน + ตารางตรวจใน [docs/05](05-data-design.md) |
| Low Burden Design | Check-in ปุ่มล้วน ≤ 3 นาที · คำถามเสริมโผล่เฉพาะเมื่อเกี่ยว · เวลาตื่นนอนคำนวณให้ ไม่ถามซ้ำ | จับเวลากรอกสดตอน demo + สถิติเวลาจริงจาก dogfooding (QA-02) |
| AI Usefulness | Pattern จากสถิติจริง + insight + next step | โชว์ตาราง pattern ของ demo account |
| Personalization | ทุกคำแนะนำผูก disruptor/ตาราง/ข้อจำกัดของผู้ใช้ | เทียบ goal ที่ระบบเสนอวันมี deadline vs วันปกติ |
| Safety | Guardrail 3 ชั้น + escalation 1323 + ผลทดสอบ 10 ข้อ | โชว์ตัวอย่าง AI ปฏิเสธคำถามวินิจฉัยโรคสด ๆ |
| Privacy | RLS, data minimization, ลบ/แก้ได้เอง | โชว์หน้า privacy + ปุ่มลบข้อมูล |
| Prototype Quality | Workflow หลักครบบน production จริง ผ่าน QA + freeze | Demo สดตาม script ที่ซ้อมแล้ว |
| Reflection and Improvement | Weekly reflection + goal ปรับต่อรายสัปดาห์ | โชว์ reflection 2 สัปดาห์ติดของ demo account |

## เอกสารที่ต้องสร้างเพิ่มระหว่างทาง

- `docs/11-limitations-future.md` — Sprint 3 (deliverable 14)
- `.scratch/ai-safety-test/` — ผลรันทดสอบ 10 ข้อจาก docs/07
- Pitch deck — Sprint 3 (แนะนำเดินเรื่อง: ปัญหา → ปาล์ม → demo สด → safety/privacy → ที่เรียนรู้จาก dogfooding → future)
