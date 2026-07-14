# INFRA-05: Wireframe 5 หน้าหลัก

Status: wontfix
Owner: —
Sprint: 0
Priority: M
Refs: docs/03 (scenario ปาล์ม), docs/04

## งาน

- [ ] Wireframe (Figma หรือกระดาษถ่ายรูป): check-in, dashboard, coach, goals, reflection
- [ ] เดิน scenario ปาล์มจาก docs/03 ผ่าน wireframe ครบ 4 ขั้น
- [ ] รีวิวร่วมกันทั้งทีมก่อนจบ Sprint 0

## Acceptance criteria

- ทีมเห็นภาพเดียวกันว่าแต่ละหน้ามีอะไร — ไม่มีการเถียงเรื่อง layout กลาง Sprint 1

## Comments

## Comments

2026-07-14 (A): **ปิดเป็น wontfix — ไม่ทำแล้ว ไม่ใช่ค้าง**

wireframe มีไว้กัน layout ชนกันกลาง Sprint 1 แต่ Sprint 1 จบไปแล้วโดยไม่เคยมี wireframe และ **ไม่เกิดปัญหาที่ issue นี้กลัว** เพราะของจริงที่ทำหน้าที่แทนคือ:

- `DESIGN.md` — กฎ layout/component ที่บังคับใช้จริง (60 บรรทัดแรก = กฎแอป)
- `src/app/(app)/layout.tsx` + `PageContainer` — โครงหน้าที่ทุกหน้าต้องใช้ → layout ชนกันไม่ได้ตั้งแต่แรก
- UI จริงบน production ที่ทีม dogfood อยู่ทุกวัน

**เขียน wireframe ตอนนี้ = เขียนเอกสารย้อนหลังของสิ่งที่มีอยู่แล้ว** ไม่เพิ่มค่าให้ใคร · ถ้าอยากได้ภาพไปใส่ pitch deck ใช้ screenshot ของจริง (สวยกว่าและจริงกว่า)
