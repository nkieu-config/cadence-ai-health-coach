# F0-04: ปรับ CTA หน้าแรก — ปุ่มเรียงแนวตั้ง + safety notice ปักล่างสุด

Status: ready-for-human
Owner: PM
Sprint: 3
Priority: C — polish ก่อน pitch
Refs: src/app/page.tsx

## งาน

- [x] ปุ่ม "สมัครสมาชิก" ย้ายไปอยู่ใต้ปุ่ม "เข้าสู่ระบบ" (เรียงแนวตั้ง กว้างเท่ากัน)
- [x] ย้าย `SafetyNotice` ไปปักล่างสุดของจอ ส่วน hero ยังอยู่กลางจอ

## Acceptance criteria

- ปุ่มทั้งสองสูง ≥ 44px กว้างเท่ากัน เข้าสู่ระบบอยู่บน (primary) สมัครสมาชิกอยู่ล่าง (outline)
- SafetyNotice อยู่ล่างสุดของ viewport ทั้งมือถือ/desktop และไม่ทับเนื้อหาเมื่อจอเตี้ย
- ไม่ hardcode สี · dark mode ปกติ

## Comments

2026-07-22 (PM): เดิมตั้งใจใส่ลิงก์ GitHub ล่างสุดด้วย — เปลี่ยนใจตัดออก แล้วให้ safety notice ("Cadence เป็นผู้ช่วยดูแลสุขภาพทั่วไป ไม่ใช่บริการทางการแพทย์…") ไปอยู่ล่างสุดแทน

2026-07-22 (implement — AI agent): แก้ `src/app/page.tsx` — ห่อ hero/pillars/ปุ่มใน wrapper `my-auto` ให้ยังอยู่กลางจอ ปุ่มสองอันเป็นคอลัมน์กว้าง `max-w-xs` เท่ากัน `SafetyNotice` ออกมาอยู่นอก wrapper จึงถูกดันไปชิดล่างของ `min-h-dvh` · verify 5 ด่านผ่านแล้ว รอเทสต์จริงบน preview

2026-07-22 (e2e + PR — AI agent): `npm run e2e` ผ่าน 81/81 (เจอ dev server ของโปรเจกต์อื่นครองพอร์ต 3000 ทำเทสต์รอบแรกพัง — รันใหม่บนพอร์ตของโปรเจกต์นี้เอง) · เปิด PR #83 แล้ว
