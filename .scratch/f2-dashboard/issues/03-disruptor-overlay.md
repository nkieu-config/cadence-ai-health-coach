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

15 ก.ค. (A) — kickoff

**ไฟล์:** แก้ component กราฟจาก F2-02 (`src/components/dashboard/` เดิม) — ไม่บังคับมีไฟล์ใหม่

**ข้อมูล:** อยู่ใน `Checkin` ที่ดึงมาแล้ว — `checkin.disruptors` (array) + `checkin.note` · ชื่อไทย: `DISRUPTOR_LABELS` — `@/lib/checkins/labels`

**ระวัง**

1. มือถือไม่มี hover — tap ต้องเห็นรายละเอียดด้วย และจุดกดสูง ≥ 44px
2. สี marker ใช้ token เท่านั้น (dark mode)
3. ภาพที่ต้องได้จาก seed: มองกราฟนอนแล้วเห็นทันทีว่าคืนนอนดึกตรงกับวัน "เดดไลน์"

## Comments

---

17 ก.ค. (A) — **ปิดงาน** · งานหลักโดย 🟦 ใน PR #53 · A แก้ต่อยอด (เจ้าของ PR ยังเป็น 🟦)

**ของ 🟦 ที่ดีและอยู่ครบ:** overlay ทำงานจริงและสวย — ไอคอน disruptor สีตาม token ใต้แกนวัน, hover เห็น tooltip, tap เห็น popover (วันที่ไทย + รายการ disruptor + โน้ต), ปิดด้วยปุ่ม X / คลิกนอก · **ตอบ AC หลักได้จริง**: มองกราฟนอนเห็นทันทีว่าคืนนอนดึกตรงวันเดดไลน์ · 🟦 merge main เข้า branch เองด้วย → movement fix (F2-06) รอด

**3 อย่างที่ A แก้ (CI แดง 2 + หนี้โครงสร้าง 1):**

1. **แท่งกราฟไม่มี legend ค่า** — 🟦 ลบ `ChartLegend` (ป้าย "ชั่วโมงนอน (ชม.)" ฯลฯ) ทิ้งตอนใส่ disruptor legend → แท่งไม่มีป้ายบอกว่าคืออะไร เห็นเฉพาะตอน hover · คืนมาเป็น `ValueLegend` div ใต้กราฟ (ไม่ใช้ `ChartLegend` ใน SVG เพราะมันวางแถบล่างชนกับ marker เสมอ)
2. **Horizontal scroll 28px บนมือถือ** — `foreignObject` marker กว้าง 44px ล้นขอบ SVG (recharts ตั้ง SVG overflow visible) ดัน grid column เป็น 402 (auto-column = max-content) ลาก TodaySummary ในคอลัมน์เดียวกันตาม · แก้ด้วย `grid-cols-1` + `min-w-0` ที่ page grid (คอลัมน์เป็น `minmax(0,1fr)` แทน auto) + `overflow-x-clip` ที่ ChartContainer (marker clip ที่ viewport ไม่ใช่ 402) · **บั๊กนี้ e2e เดิมจับได้เพราะ route guard เช็ค overflow — CI แดงตั้งแต่ก่อน A แตะ**
3. **โค้ดซ้ำ ~250 บรรทัดระหว่าง 2 กราฟ** — `disruptorConfig`, tick, tooltip-rows, popover, legend, hover/click hook copy กันคำต่อคำ (PR เขียนว่า DRY แต่ตรงข้าม) · ยกทั้งก้อนไป `disruptor-overlay.tsx` ไฟล์กลาง · 2 กราฟ import → **energy-chart 420→131 · pillar-charts 503→253** (ลบสุทธิ ~560 บรรทัด)

**จุดเล็กที่เก็บด้วย:** `disruptorConfig.label` พิมพ์ไทยเอง → ใช้ `DISRUPTOR_LABELS` แทน (แหล่งความจริงเดียว ตามที่ kickoff สั่ง) · `commute` กับ `online_class` เคยสี `--chart-4` ซ้ำ → online_class เป็น `--chart-1` แยกออก

**พิสูจน์:** e2e **39/39** บน production build (route mobile + 3 แท็บ legend เขียวหมด) · format/lint/tsc/test 135 · build ผ่าน · screenshot มือถือ+เดสก์ท็อป: overflow 0, marker วันสุดท้ายเห็นเต็ม, popover เปิดได้, value legend อยู่ใต้ marker ไม่ชน · null-gap ไม่เสีย

**ธรรมเนียมที่ทำต่อจาก F2-06:** เขียน guard ก่อน แล้วรันกับของพังให้เห็นแดงก่อนค่อยแก้ — route guard เดิม (overflow) + F2-06 guard (legend/แท่ง) จับทั้ง 2 บั๊กนี้ได้เองโดยไม่ต้องเขียนเทสต์ใหม่
