# F2-03: Disruptor overlay บนทุกกราฟ

Status: done
Owner: 🟦 กราฟ (A แก้ต่อยอดใน PR #53)
Sprint: 2
Priority: M — จุดขายเรื่อง Personalization
Refs: FR-2.2, CONTEXT.md (Disruptor)
Blocked by: 02

## งาน

- [ ] วันที่มี disruptor แสดง marker/ไอคอนบนแกนวันของทุกกราฟ (deadline, ประชุมยาว, เรียนเช้า, เดินทาง, สอบ)
- [ ] Hover/tap เห็นว่าวันนั้นมี disruptor อะไร + note
- [ ] Legend อธิบายไอคอน

## Acceptance criteria

- มองกราฟนอนแล้วเห็นทันทีว่าคืนนอนดึกตรงกับวัน deadline (demo ด้วย seed data)

## Comments

---

15 ก.ค. (A) — kickoff · 🟦 แก้ component กราฟจาก F2-02 ต่อ ไม่บังคับมีไฟล์ใหม่ · ข้อมูลอยู่ใน `checkin.disruptors` + `checkin.note` แล้ว

**ระวัง:** มือถือไม่มี hover — tap ต้องเห็นรายละเอียด จุดกดสูง ≥ 44px · สี marker ใช้ token เท่านั้น (dark mode) · ชื่อไทยใช้ `DISRUPTOR_LABELS` ห้ามพิมพ์เอง

---

17 ก.ค. (A) — **ปิดงาน** · งานหลักโดย 🟦 ใน PR #53 · A แก้ต่อยอด (เจ้าของ PR ยังเป็น 🟦)

**ข้อตกลงที่ยังมีผล:** legend ค่าของแท่งอยู่เป็น div ใต้กราฟ ไม่ใช้ `ChartLegend` ใน SVG (มันชนกับ marker เสมอ) · โค้ด overlay ที่เคยซ้ำ 2 กราฟ ถูกยกไปไฟล์กลาง `disruptor-overlay.tsx` แล้ว — แก้ที่เดียว · `commute` / `online_class` แยกสีกันแล้ว

**ธรรมเนียมที่ทำต่อจาก F2-06:** เขียน guard ก่อน แล้วรันกับของพังให้เห็นแดงก่อนค่อยแก้
