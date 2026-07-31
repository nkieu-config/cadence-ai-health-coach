# F2-01: Dashboard layout + ตัวเลือกช่วง 7/14/30 วัน

Status: done
Owner: B
Sprint: 1
Priority: M
Refs: FR-2.1

## งาน

- [x] โครงหน้า dashboard: การ์ดสรุปวันนี้, ส่วนกราฟ 3 pillars, ส่วน pattern table (placeholder ก่อน)
- [x] Toggle ช่วงเวลา 7/14/30 วัน มีผลกับทุกส่วน
- [x] Empty state เมื่อยังไม่มีข้อมูล → ชวนไป check-in
- [x] ข้อความกำกับ safety ถาวรท้ายหน้า (ประสาน F0-03)

## Acceptance criteria

- Responsive ทั้งมือถือ/desktop
- ผู้ใช้ใหม่ไม่เจอหน้าว่างเปล่า — เจอคำชวนที่เป็นมิตร

## Comments

2026-07-12 (kickoff → B): **สาย Dashboard — ทำขนานได้เลย ไม่ต้องรอ F1 check-in ของ A** · branch `feat/f2-dashboard`

โซนของ B: `src/app/(app)/dashboard/` + `src/components/dashboard/` · อย่าแตะโซนคนอื่น: `lib/**` = A · `coach` = 🟩 · `settings` `goals` `reflection` = 🟨 · `checkin` = A (zone เต็มใน BOARD)

⛔ ห้าม `supabase.from("checkins")` เอง — ใช้ `getCheckins()` (DB เป็น snake_case แต่ type เป็น camelCase) · ห้าม hardcode สีกราฟ ใช้ token `--chart-N`

2026-07-14 (A): ยืนยันปิดงาน — merge แล้ว (PR แพรรี่ `Feat/f2 layout period`) · ติ๊กกล่องย้อนหลังเพราะลืมติ๊กตอน merge
