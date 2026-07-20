# INFRA-06: Seed script — demo account "ปาล์ม"

Status: done
Owner: A
Sprint: 2
Priority: M
Refs: ADR-0004, docs/03, docs/05
Blocked by: 02

## งาน

- [x] `scripts/seed.ts` สร้าง demo account + check-in ย้อนหลัง 4 สัปดาห์
- [x] ฝัง pattern 3 เรื่องให้ชัด: นอนดึกคืนก่อน deadline, ข้ามมื้อเช้าวันเรียนเช้า (จันทร์/พุธ), เดินน้อยวันเรียน online
- [x] ข้อมูลต้องสมจริง: มีวันขาดบันทึก ~2 วัน/สัปดาห์, มี note ภาษาไทยแบบปาล์มพิมพ์เอง
- [x] รันซ้ำได้ (ลบของเก่าก่อน insert)

## Acceptance criteria

- รัน seed แล้วเปิด dashboard เห็น pattern ทั้ง 3 เรื่องใน pattern table
- Weekly reflection generate ได้อย่างน้อย 2 สัปดาห์

## Comments

2026-07-14 (A): **เสร็จแล้ว — แต่ต้องแก้ `lib/patterns` ก่อน ไม่งั้น AC ของ issue นี้เป็นไปไม่ได้**

### 🔴 สิ่งที่เจอตอนอ่านเอกสารก่อนลงมือ

ADR-0004 + issue นี้สัญญา pattern 3 เรื่อง — **แต่ `lib/patterns` คำนวณได้แค่ 1 เรื่อง**

| pattern ที่สัญญาไว้ | มี candidate ไหม (ก่อนแก้) |
|---|---|
| นอนดึกคืนก่อน deadline | ✅ `deadline-sleep-bedtime` |
| ข้ามมื้อเช้าวันเรียนเช้า | ❌ ไม่มี — candidate ที่มีแยกตาม *นอนน้อย/นอนพอ* ไม่ใช่ *วันเรียนเช้า* |
| เดินน้อยวันเรียน online | ❌ ไม่มี — และ `Disruptor` ไม่มีค่า "เรียน online" เลย |

**และ 3 บรรทัดนี้คือตาราง Feature 2 ในโจทย์เป๊ะ ๆ** ซึ่ง FR-2.3 บังคับให้แสดง
→ ถ้าเขียน seed อย่างเดียว ตาราง pattern จะโชว์ได้ 1 ใน 3 แถว แล้วเพิ่งมารู้ตอนเปิด dashboard

**แก้แล้ว** (ไม่ต้อง migration — `disruptors` ไม่มี DB check constraint):
`online_class` เข้า enum · candidate `early-class-skip-breakfast` + `online-class-movement`

### 🐛 บั๊กที่เจอระหว่างทาง — candidate ถูกทิ้งเงียบ ๆ

`toInsightPattern()` คืน `null` ถ้าไม่มี template สำหรับ candidate id นั้น
→ **`eating-on-time-energy` ที่เพิ่มไปใน F1-05 ไม่มี template → คำนวณแล้วถูกกรองทิ้ง ไม่เคยขึ้นหน้าจอเลย**
→ เขียนเทสต์คุมถาวรแล้ว: **candidate ทุกตัวต้องแปลงเป็น InsightPattern ได้**

### ✅ ผลจริงบน production (`npm run verify:seed`)

| view | pattern ที่โผล่ |
|---|---|
| 7 วัน | **3 ข้อ** — กลุ่มไม่ถึง 3 วัน pattern เรื่อง deadline/นอนจึงไม่ขึ้น **(ถูกต้อง ไม่มโน)** |
| **14 วัน** ← default | **10 ข้อ · Feature 2 ครบ 3 แถว** ✅ |
| 30 วัน | **10 ข้อ** หลักฐานหนาแน่นขึ้น |

**นี่คือ demo beat:** กด 7 วันเห็นน้อย → กด 14/30 เห็นครบ = **พิสูจน์สดว่าระบบไม่สรุปมั่วเมื่อข้อมูลน้อย** (เกณฑ์ Safety)

### 🔑 บัญชี demo

```
palm@example.com / PalmDemo2026!
npm run seed          # รันซ้ำได้ ล้างของเก่าก่อนเสมอ
npm run verify:seed   # พิสูจน์ว่า Feature 2 ครบ 3 แถว
```

**ข้อมูล 24 วัน จาก 28 วัน** — ขาดบันทึกเสาร์/อาทิตย์ของ 2 สัปดาห์แรก (ยังไม่ติดนิสัย) แล้ว 2 สัปดาห์หลังบันทึกครบ
เป็นเส้นการใช้งานจริงของคนเพิ่งเริ่มใช้แอป **และทำให้ view 7/14 วันมีข้อมูลพอ demo**
มีเป้าหมาย active 1 ข้อ + note ภาษาไทยแบบปาล์มพิมพ์เอง

⚠️ **ก่อน pitch:** ต้อง generate insight + reflection ของบัญชีนี้ล่วงหน้าให้เข้า cache (ดู INFRA-07 + QA-03) — โควตา Gemini มีแค่ 20 ครั้ง/วัน
