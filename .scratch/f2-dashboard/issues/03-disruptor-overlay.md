# F2-03: Disruptor overlay บนทุกกราฟ

Status: ready-for-human
Owner: 🟦 กราฟ
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

15 ก.ค. (A) — kickoff

**ไฟล์:** แก้ component กราฟจาก F2-02 (`src/components/dashboard/` เดิม) — ไม่บังคับมีไฟล์ใหม่

**ข้อมูล:** อยู่ใน `Checkin` ที่ดึงมาแล้ว — `checkin.disruptors` (array) + `checkin.note` · ชื่อไทย: `DISRUPTOR_LABELS` — `@/lib/checkins/labels`

**ระวัง**

1. มือถือไม่มี hover — tap ต้องเห็นรายละเอียดด้วย และจุดกดสูง ≥ 44px
2. สี marker ใช้ token เท่านั้น (dark mode)
3. ภาพที่ต้องได้จาก seed: มองกราฟนอนแล้วเห็นทันทีว่าคืนนอนดึกตรงกับวัน "เดดไลน์"
