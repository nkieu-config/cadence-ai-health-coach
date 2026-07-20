# F3-05: lib/patterns ยังตอบตาราง Feature 2 ของโจทย์ได้ไม่ครบ

Status: done
Owner: A
Sprint: 2
Priority: M — FR-2.3 บังคับให้ dashboard แสดงตารางนี้
Refs: FR-2.3, โจทย์ Feature 2, ADR-0004
Blocked by: —

## ปัญหา

โจทย์ Feature 2 กำหนดตาราง 3 แถวไว้ชัด และ **FR-2.3 บังคับให้ dashboard แสดงตามรูปแบบนี้**

| ด้าน | Pattern ที่พบ | ความหมาย | Next step |
|---|---|---|---|
| กิน | มักข้ามมื้อเช้าในวันที่มีเรียน/งานเช้า | … | เตรียมอาหารเช้าง่าย ๆ ล่วงหน้า |
| นอน | นอนดึกในคืนก่อน deadline | … | ตั้ง mini cut-off time |
| ออกกำลังกาย | เดินน้อยในวันที่เรียน/ทำงาน online | … | ตั้ง reminder ลุกเดิน |

**`lib/patterns` (F3-01) คำนวณได้แค่แถวเดียว:**

| แถวในโจทย์ | candidate ที่มี |
|---|---|
| กิน — ข้ามมื้อเช้าวันเรียนเช้า | ❌ **ไม่มี** — `sleep-eating-skip-breakfast` แยกตาม *นอนน้อย/นอนพอ* ไม่ใช่ *วันเรียนเช้า* คนละคำถามกัน |
| นอน — นอนดึกคืนก่อน deadline | ✅ `deadline-sleep-bedtime` |
| ออกกำลังกาย — เดินน้อยวันเรียน online | ❌ **ไม่มี** — และ `Disruptor` enum ไม่มีค่าที่บอกว่าวันไหนเรียน online เลย |

**ผลกระทบ:** ตาราง pattern บน dashboard (F2-04) จะโชว์ได้ 1 ใน 3 แถวที่โจทย์บังคับ · และ AC ของ **INFRA-06** ("รัน seed แล้วเห็น pattern ทั้ง 3 เรื่อง") เป็นไปไม่ได้

## งาน

- [ ] เพิ่ม `online_class` เข้า `Disruptor` enum + `DISRUPTOR_LABELS` (ไม่ต้อง migration — คอลัมน์ `disruptors` ไม่มี DB check constraint)
- [ ] เพิ่ม candidate `early-class-skip-breakfast` — เทียบอัตราข้ามมื้อเช้า: วันที่มี disruptor `early_class` vs วันอื่น
- [ ] เพิ่ม candidate `online-class-movement` — เทียบนาทีเคลื่อนไหวเฉลี่ย: วันที่มี disruptor `online_class` vs วันอื่น
- [ ] เพิ่ม template ใน `lib/ai-outputs/templates.ts` ให้ candidate ใหม่ **และให้ `eating-on-time-energy` ที่ตกหล่นจาก F1-05**
- [ ] เทสต์บังคับว่า **candidate ทุกตัวต้องมี template**

## Acceptance criteria

- `computePatternCandidates()` จุด candidate ครบทั้ง 3 แถวของ Feature 2 บนข้อมูล 14 วันของปาล์ม
- ไม่มี candidate ตัวไหนที่ `toInsightPattern()` คืน `null`
- ข้อความใน template ผ่าน `findForbiddenTerms()` และไม่สรุปเป็นเหตุ-ผล

## Comments

2026-07-14 (A): **เปิด issue นี้ย้อนหลัง — ผมทำงานก่อนแล้วค่อยเปิด issue ซึ่งผิดลำดับ**

เจอตอนกำลังจะเขียน seed (INFRA-06): อ่าน ADR-0004 แล้วพบว่ามันสัญญา pattern 3 เรื่องที่โค้ดทำได้แค่ 1 → ถ้าเขียน seed ไปเลยจะไปรู้ตัวตอนเปิด dashboard แล้วเจอตารางโล่ง

**บั๊กแถมที่เจอระหว่างทาง:** `toInsightPattern()` คืน `null` ถ้าไม่มี template ของ candidate id นั้น และคนเรียกก็ `.filter()` null ทิ้ง
→ **`eating-on-time-energy` ที่ผมเพิ่มไปเองใน F1-05 ไม่มี template → คำนวณเสร็จแล้วถูกทิ้งเงียบ ๆ ไม่เคยขึ้นหน้าจอ ไม่มีใครรู้**
→ เทสต์ตัวใหม่จะทำให้ CI แดงทันทีถ้าเกิดซ้ำ

**หมายเหตุถึงคนรีวิว:** issue นี้แตะ `lib/patterns` ซึ่งเป็นงานที่ merge ไปแล้ว (F3-01) — เป็นการ**เพิ่ม** candidate ไม่ได้แก้ของเดิม เทสต์เดิมทั้งหมดยังเขียวครบ
