# 10 — Deliverables Checklist & Evaluation Mapping

## Expected Deliverables 14 รายการ (Mission ข้อ 10)

> อัปเดต 20 ก.ค. 2026 (QA-05) — เหลือ 10 วันถึง pitch · เจ้าของเป็น "สาย" ตามแผนใน [docs/09](09-project-plan.md)

| # | Deliverable | อยู่ที่ไหน | สาย | สถานะ |
|---|---|---|---|---|
| 1 | Problem analysis | [02-problem-analysis.md](02-problem-analysis.md) | A | ✅ |
| 2 | User persona | [03-user-persona.md](03-user-persona.md) | A | ✅ |
| 3 | Health behavior data design | [05-data-design.md](05-data-design.md) | A | ✅ + ตารางตรวจ **โจทย์ข้อ 5 ครบทุกบรรทัด** |
| 4 | System workflow | [06-system-architecture.md](06-system-architecture.md) | A | ✅ |
| 5 | Prototype / demo | Web app บน Vercel (demo account ปาล์ม) | ทุกสาย | ✅ F0–F7 ใช้งานจริงบน production · **เหลือชิ้นเดียว: ตาราง pattern F2-04 (🟦)** |
| 6 | ตัวอย่าง daily check-in | ในแอป (`/checkin`) + screenshot | A | ✅ ใช้งานจริง + dogfooding ตั้งแต่ 13 ก.ค. |
| 7 | ตัวอย่าง dashboard | ในแอป (demo account) + screenshot | 🟦 | ✅ layout + 7/14/30 + กราฟ 3 ด้าน + disruptor overlay (F2-02/03/06 + INFRA-22 a11y) |
| 8 | ตัวอย่าง pattern analysis | ในแอป + ตัวอย่าง output ใน pitch deck | A + 🟦 | 🔶 engine + cache ✅ (F3-03) · **รอแค่ UI ตาราง F2-04 (🟦) — ชิ้นสุดท้ายของทั้ง 14 ข้อ** |
| 9 | ตัวอย่าง AI coaching conversation | ในแอป (guided flow) + transcript | A + 🟩 | ✅ แชท + guided flow + escalation ใช้งานจริง (F4-01→05) |
| 10 | ตัวอย่าง micro goal recommendation | ในแอป (`/goals`) + ตัวอย่างใน pitch deck | A + 🟨 | ✅ **หน้า goals เสร็จแล้ว (F5-02, PR #54)** · engine ครบ (F5-01/03/04) |
| 11 | ตัวอย่าง weekly reflection | ในแอป + ตัวอย่างเต็ม 1 ฉบับ | A | ✅ หน้า `/reflection` — ปาล์มมี 4 สัปดาห์ + เทียบสัปดาห์ก่อน (F6-01/02/03) |
| 12 | Safety guardrail | [08](08-safety-privacy.md) Part 1 + `lib/ai` + `lib/safety/language.ts` + [หลักฐานทดสอบ](../.scratch/ai-safety-test/) | A | ✅ **ครบสมบูรณ์ (QA-01)** — 10 เคส × 2 ประโยค = 20/20 บนโมเดล production `gemini-3.1-flash-lite` + **ลายเซ็นตรวจอิสระโดยคีตะ** (PR #58) |
| 13 | Privacy design | [08](08-safety-privacy.md) Part 2 + `/settings/privacy` | A + 🟨 | ✅ design + หน้าในแอป (ตอบโจทย์ข้อ 9 ครบ 6/6) + **ปุ่มลบข้อมูล/บัญชีใช้งานจริง (F7-02)** |
| 14 | Limitations & future improvement plan | [11](11-limitations-future.md) | A | ✅ เขียนแล้ว — ทุกข้อจำกัดมีสิ่งที่ทำแล้ว + แผนถ้าไปต่อ · รวมบทเรียนจาก dogfooding |

**สรุป: 13.5 / 14 — ค้างชิ้นเดียวคือ UI ตาราง pattern (F2-04 · 🟦) ซึ่งปิดทั้งข้อ 8 และเป็นหลักฐานหลักของเกณฑ์ AI Usefulness (15%)**

## Mapping กับ Evaluation Criteria 9 ข้อ (Mission ข้อ 11)

| เกณฑ์ | เราตอบด้วยอะไร | หลักฐานตอน pitch |
|---|---|---|
| Target User Fit | Persona ปาล์มลงลึกระดับตารางชีวิต + disruptor design | เดินเรื่อง demo ด้วย scenario ปาล์ม + เล่า dogfooding |
| Completeness | ครบ 3 pillars ทุก feature ตั้งแต่ data model ถึง reflection · **Required Input ของโจทย์ข้อ 5 ครบทุกบรรทัด** | โชว์ check-in/dashboard ครบ 3 ด้าน + ตารางตรวจใน [docs/05](05-data-design.md) |
| Low Burden Design | Check-in ปุ่มล้วน ≤ 3 นาที · คำถามเสริมโผล่เฉพาะเมื่อเกี่ยว · เวลาตื่นนอนคำนวณให้ ไม่ถามซ้ำ | จับเวลากรอกสดตอน demo + สถิติเวลาจริงจาก dogfooding (QA-02) |
| AI Usefulness | Pattern จากสถิติจริง + insight + next step | โชว์ตาราง pattern ของ demo account |
| Personalization | ทุกคำแนะนำผูก disruptor/ตาราง/ข้อจำกัดของผู้ใช้ (F5-03/F5-04) | เดิน guided flow เลือกคนละด้าน/ข้อจำกัด แล้วเทียบ goal ที่ได้ — check-in ชุดเดียวกันต้องได้คนละคำตอบ |
| Safety | Guardrail 3 ชั้น + escalation 1323 + หลักฐาน 20/20 บนโมเดล production พร้อมลายเซ็นตรวจอิสระ | โชว์ตัวอย่าง AI ปฏิเสธคำถามวินิจฉัยโรคสด ๆ + เปิดไฟล์หลักฐานให้กรรมการดูได้ |
| Privacy | RLS, data minimization, ลบ/แก้ได้เอง | โชว์หน้า privacy + ปุ่มลบข้อมูล |
| Prototype Quality | Workflow หลักครบบน production จริง ผ่าน QA + freeze | Demo สดตาม script ที่ซ้อมแล้ว |
| Reflection and Improvement | Weekly reflection + **เทียบสัปดาห์ก่อน** (F6-03) + ปุ่มตั้งเป้าต่อ | โชว์ reflection 4 สัปดาห์ของ demo account แล้วชี้ส่วนต่าง เช่น ขยับเฉลี่ย 9 → 16.4 นาที/วัน |

## แพ็กเกจส่งงาน — หยิบอะไรส่งวันจริง (อัปเดต 20 ก.ค.)

หลักการ: **repo คือแพ็กเกจส่งงาน** — ทุก deliverable มีบ้านถาวรอยู่แล้ว ไม่สร้างสำเนาแยก (สำเนา = ของค้างสอง version)

| ชิ้นส่ง | รูปแบบ | อยู่ที่ไหน |
|---|---|---|
| เอกสาร deliverable 1–4, 12–14 | Markdown ใน repo | [docs/01](01-project-charter.md)–[11](11-limitations-future.md) — ตารางข้างบนชี้รายข้อ |
| ตัวอย่างระบบทำงานจริง (5–11) | Demo สดบน production | Vercel + บัญชี demo ปาล์ม (seed 24 วัน + reflection 4 สัปดาห์ cache แล้ว) |
| หลักฐาน safety | ไฟล์ดิบ + คำตัดสิน + ลายเซ็น | [.scratch/ai-safety-test/](../.scratch/ai-safety-test/) |
| Pitch deck + demo script + screenshot สำรอง | [docs/pitch/](pitch/) | QA-03 — งานเดียวที่ยังเป็นศูนย์ |
| ลิงก์ที่ยื่นอาจารย์/กรรมการ | URL แอป + URL repo (README นำทางต่อเอง) | หน้า README แรกของ repo |

**ลำดับงานที่เหลือก่อน freeze 29 ก.ค.:**

1. F2-04 ตาราง pattern (🟦) — ปิด deliverable ตัวสุดท้าย
2. QA-02 จับเวลา check-in — **ต้องเริ่ม ~21 ก.ค.** (ต้องได้ 3 วันติด × ≥4 คน)
3. QA-03 deck + script + screenshot ลง [docs/pitch/](pitch/) — ซ้อม 2 รอบวันที่ 29
4. เก็บเล็ก (ถ้าทัน): F4-06 markdown ในแชท · INFRA-20 · F2-05 streak (ตัดได้)
