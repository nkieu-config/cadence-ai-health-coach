<div align="center">

<img src="src/app/icon.svg" alt="" width="72" height="72">

# Cadence

**เห็นจังหวะของตัวเอง แล้วเริ่มจากก้าวเล็ก ๆ ที่ทำได้จริง**

AI wellness coach สำหรับนักศึกษาและคนเริ่มทำงาน ช่วยให้เห็น pattern ของการกิน การนอน และการเคลื่อนไหว
แล้วเปลี่ยนสิ่งที่ค้นพบให้เป็น micro-goal ที่ทำได้จริงในตารางชีวิตของตัวเอง

[English](README.md) · **ภาษาไทย**

[![CI](https://github.com/nkieu-config/cadence-ai-health-coach/actions/workflows/ci.yml/badge.svg)](https://github.com/nkieu-config/cadence-ai-health-coach/actions/workflows/ci.yml)
![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20RLS-3FCF8E?logo=supabase&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-3.1%20Flash%20Lite-4285F4?logo=googlegemini&logoColor=white)

[**เปิดแอปจริง**](https://personal-healthcoach.vercel.app/) ·
[สรุปผลงาน](docs/summary/showcase-en-light.pdf) ·
[รันในเครื่อง](CONTRIBUTING.md)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/readme/dark-phone-checkin.webp">
  <img src="docs/assets/readme/light-phone-checkin.webp" width="240" alt="หน้าเช็คอินประจำวันของ Cadence ขั้นที่ 1 จาก 4 ถามจำนวนมื้อ ของที่กินเพิ่ม และเครื่องดื่มหวาน เป็นชิปกดเลือกทั้งหมด">
</picture>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/readme/dark-phone-dashboard.webp">
  <img src="docs/assets/readme/light-phone-dashboard.webp" width="240" alt="หน้าภาพรวมสุขภาพของ Cadence แสดงกราฟชั่วโมงนอนย้อนหลัง 14 วัน พร้อมสัญลักษณ์วันที่มีปัจจัยรบกวนใต้แท่งกราฟ">
</picture>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/readme/dark-phone-coach.webp">
  <img src="docs/assets/readme/light-phone-coach.webp" width="240" alt="หน้าคุยกับโค้ชสุขภาพของ Cadence ผู้ใช้ถามว่าสัปดาห์หน้าควรเริ่มแก้อะไรก่อน โค้ชตอบให้โฟกัสมื้อเช้า โดยอ้างจากบันทึกว่าวันที่เรียนหรือทำงานเช้ามักเป็นวันที่ข้ามมื้อเช้า">
</picture>

<sub>เช็คอิน 4 ขั้น ชิปกดล้วน · แนวโน้ม 4 แท็บ พร้อมวันที่มีปัจจัยรบกวน · โค้ชที่ตอบจากบันทึกจริง ไม่ใช่คำแนะนำสำเร็จรูป<br>
ภาพจริงจากแอป ไม่ใช่ mockup — ถ่ายที่ขนาดจอ iPhone 13 (390×844) · สลับ light/dark ตามธีมของคนอ่านเอง</sub>

</div>

> [!NOTE]
> **ตัวแอปใช้ภาษาไทย** ภาพหน้าจอและตัวอย่างด้านบนเป็นหน้าจอจริงจากแอป หากต้องการอ่าน README ภาษาอังกฤษ
> ให้เลือก [English](README.md)

## ลองใช้ demo

- **แอปจริง** — [personal-healthcoach.vercel.app](https://personal-healthcoach.vercel.app/) ปุ่มแรกบนหน้าแรกจะพาเข้าบัญชีตัวอย่างทันที ไม่ต้องสมัครสมาชิก
- **บัญชี demo** — `palm@example.com` มีข้อมูลเช็คอิน pattern การคุยกับโค้ช goal และสรุปสัปดาห์ย้อนหลัง 4 สัปดาห์ รหัสผ่านคือ `cadence-demo-2026`
- **Case study** — [สรุปผลงาน 9 หน้า](docs/summary/showcase-en-light.pdf) (ภาษาอังกฤษ)

บัญชี demo เป็นบัญชีสาธารณะ สามารถกรอก แก้ไข หรือลบข้อมูลได้ตามต้องการ ข้อมูลจะถูกสร้างใหม่ทุกคืน
และตั้งใจเว้นเช็คอินของวันนี้ไว้ให้ลองกรอกเอง การคุยกับ AI จำกัด 5 ข้อความต่อวันตามโควตา Gemini ฟรี

## เกี่ยวกับโปรเจกต์

Cadence เป็น wellness coach ไม่ใช่บริการทางการแพทย์ ออกแบบมาสำหรับคนที่มีตารางชีวิตเปลี่ยนแปลงตาม
การเรียน เดดไลน์ การเดินทาง และระดับพลังงานในแต่ละวัน

แทนที่จะให้คะแนนหรือตัดสินผู้ใช้ ระบบทำงานเป็นวงจรง่าย ๆ:

```text
เช็คอินรายวัน → เห็น pattern ของตัวเอง → เลือกก้าวถัดไปที่ทำได้จริง → ทบทวนรายสัปดาห์
```

แบบเช็คอินใช้คำตอบแบบกดเลือกและแสดงคำถามเสริมเฉพาะเมื่อเกี่ยวข้อง เพื่อให้บันทึกได้ภายใน 3 นาที
โค้ชใช้ข้อมูลของผู้ใช้เองในการเสนอคำแนะนำที่เล็กพอจะทำได้จริงในสัปดาห์นั้น

## ฟีเจอร์หลัก

- **เช็คอินรายวัน** — บันทึกการกิน การนอน การเคลื่อนไหว และบริบทที่ส่งผลต่อวันนั้น
- **ภาพรวมสุขภาพ** — ดูแนวโน้ม 4 ด้าน พร้อม timeline จากกลางคืนสู่เช้าและวันที่มีปัจจัยรบกวน
- **วิเคราะห์ pattern** — เห็นความสัมพันธ์ระหว่างพฤติกรรมสุขภาพกับข้อจำกัดของตารางชีวิต
- **AI coach** — เริ่มจากคำถามที่อิงข้อมูลของตัวเอง คุยต่อ และเปลี่ยนบทสนทนาให้เป็น goal แบบมีขั้นตอน
- **Micro-goal** — เลือกเป้าหมายเล็ก ๆ ได้ไม่เกิน 2 ข้อต่อสัปดาห์ พร้อมติดตามความคืบหน้ารายวัน
- **สรุปประจำสัปดาห์** — เปรียบเทียบสัปดาห์ล่าสุดและทบทวนว่าสิ่งใดเปลี่ยนไป

Cadence ไม่วินิจฉัยโรค ไม่แนะนำยาและอาหารเสริม ไม่สร้างแผนลดน้ำหนัก และไม่เก็บน้ำหนัก ส่วนสูง BMI
แคลอรี หรือรูปถ่าย

## จุดเด่นสำหรับ portfolio

- **Product thinking** — ลดภาระการบันทึกด้วย check-in สั้น ๆ และคำถามแบบมีเงื่อนไข แทนฟอร์มยาว ๆ
- **Responsible AI design** — แยกหลักฐานออกจากการเรียบเรียงภาษา และกำหนดขอบเขตให้ AI ทำหน้าที่เป็นโค้ช ดูรายละเอียดที่ [การออกแบบ AI](docs/07-ai-design.md)
- **Privacy และคุณภาพ** — จำกัดข้อมูลสุขภาพให้เห็นเฉพาะเจ้าของบัญชี รองรับการลบบัญชี ไม่ส่งชื่อหรืออีเมลให้โมเดล และตรวจสอบด้วย unit test กับ end-to-end test ดูรายละเอียดที่ [ความปลอดภัยและความเป็นส่วนตัว](docs/08-safety-privacy.md)

## บริบทของโปรเจกต์

Cadence สร้างโดยทีม 4 คนภายใน 4 สัปดาห์สำหรับ CSTU Spark Camp in AI 2026 ด้วยงบประมาณ 0 บาท
ทีมออกแบบ พัฒนา ทดลองใช้กันเอง ทดสอบ และ deploy เป็น demo ที่ใช้งานได้จริงสำหรับการ pitch
[Project charter](docs/01-project-charter.md) และ [issue tracker](docs/issues/) บันทึก scope การตัดสินใจ
และประวัติการพัฒนาไว้ทั้งหมด

## เทคโนโลยีที่ใช้

- Next.js 16, App Router และ React 19
- TypeScript และ Tailwind CSS v4
- Supabase Auth, Postgres และ Row Level Security
- Google Gemini 3.1 Flash Lite
- Vitest และ Playwright
- Vercel

## รันในเครื่อง

```bash
npm install
cp .env.example .env.local
npm run dev
```

ต้องใช้ Node.js 22 ขึ้นไป ดูรายละเอียด environment variables, database, seed data, คำสั่ง test
และการ deploy ได้ที่ [CONTRIBUTING.md](CONTRIBUTING.md)

## ข้อจำกัด

- ข้อมูลสุขภาพทั้งหมดมาจากการกรอกของผู้ใช้เอง ไม่มี sensor ยืนยัน
- pattern เป็นความสัมพันธ์ ไม่ใช่เหตุและผล และไม่ควรใช้แทนคำแนะนำทางการแพทย์
- prototype นี้ยังไม่ได้ประเมินกับผู้ใช้นอกทีม
- ไม่สามารถควบคุมผลลัพธ์จาก AI ได้สมบูรณ์ จึงต้องมี safety boundary และ fallback

อ่านข้อจำกัดและแผนพัฒนาต่อได้ที่ [docs/11-limitations-future.md](docs/11-limitations-future.md)

## เอกสาร

| หัวข้อ | เอกสาร |
| --- | --- |
| Product, design และ requirements | [docs/](docs/README.md) |
| Architecture และ request flow | [System architecture](docs/06-system-architecture.md) |
| AI, pattern และการตัดสินใจเรื่อง model | [AI design](docs/07-ai-design.md) · [ADR-0003](docs/adr/0003-gemini-free-tier-ai.md) |
| Safety, privacy และหลักฐานการทดสอบ | [Safety and privacy](docs/08-safety-privacy.md) · [AI safety tests](docs/issues/ai-safety-test/) |
| กฎ UI และสถานะของแต่ละ route | [UI inventory](docs/12-ui-inventory.md) · [Design rules](docs/DESIGN.md) |
| การรันโปรเจกต์และ workflow การ contribute | [CONTRIBUTING.md](CONTRIBUTING.md) |

<sub>Deploy อัตโนมัติจาก <code>main</code> ไปที่ <a href="https://personal-healthcoach.vercel.app/">personal-healthcoach.vercel.app</a> ·
สัญญาอนุญาตภายใต้ <a href="LICENSE">MIT</a></sub>
