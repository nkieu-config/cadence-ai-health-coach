# INFRA-09: กดปุ่มแล้วไม่มีอะไรเกิดขึ้น — ไม่มี loading state ทั้งแอป

Status: done
Owner: A
Sprint: 2
Priority: M — กระทบเกณฑ์ Prototype Quality โดยตรง และ 3 สายกำลังจะก๊อป pattern นี้ไปทำต่อ
Refs: NFR-1, NFR-2, DESIGN.md
Blocked by: —

## ปัญหา (วัดจริง ไม่ใช่ความรู้สึก)

กดเมนู/ปุ่มช่วงเวลา แล้วหน้าจอ**ค้างนิ่งไม่มีสัญญาณอะไรเลย** จนกว่า server จะตอบ

**ไม่มี `loading.tsx` แม้แต่ไฟล์เดียวในแอป** และคู่มือ Next 16 บอกไว้ตรง ๆ:

> *"**Dynamic Route: prefetching is skipped**, or the route is partially prefetched **if `loading.tsx` is present**"*
> *"waiting for a server response before navigation can give the users **the impression that the app is not responding**"*

**ทุกหน้าใน `(app)` เป็น dynamic (`ƒ` ใน build output)** เพราะอ่าน cookie/auth
→ **ไม่มี `loading.tsx` = Next ปิด prefetch ทิ้งทั้งหมด** = ทุกการกดคือ full server round-trip ที่ไม่มี feedback

**วัดจาก production:** TTFB 220–240ms (warm) · **1,234ms (cold)**
และของจริงหนักกว่านั้นเพราะหน้าที่ล็อกอินแล้วต้องผ่าน:
`getUser()` ใน proxy → `getUser()` + `hasCompletedOnboarding()` ใน layout → query ของหน้าเอง

→ **กด 1 ที = จอนิ่ง 0.3–0.8 วินาที** (บนมือถือ/เน็ตช้ายิ่งกว่านี้)

## ทางที่ "ไม่" เลือก และเหตุผล

Next 16 มี `unstable_instant` + Cache Components (`use cache`) ที่ทำให้ navigate ทันที
**ไม่ใช้** เพราะ:

1. ต้องเปิด `cacheComponents` แล้ว **cache ผลลัพธ์ข้ามคำขอ** — ข้อมูลเราคือ**ข้อมูลสุขภาพรายบุคคลหลัง RLS** การ cache แบบนั้นคือสิ่งที่ FR-7.1 และเกณฑ์ Privacy ห้ามโดยตรง
2. API ยัง `draft` + prefix `unstable_` — เหลือ 15 วันถึง freeze ไม่เสี่ยง

→ ใช้ทางมาตรฐานที่นิ่งแล้ว: **`loading.tsx` + `useLinkStatus`**

## งาน

- [x] `Skeleton` primitive + `PageSkeleton` ที่ 3 สายก๊อปไปใช้ต่อได้
- [x] `(app)/loading.tsx` — default ครอบทุกหน้าลูก **(ตัวนี้คือตัวปลด prefetch กลับมา)**
- [x] `(app)/checkin/loading.tsx` + `(app)/dashboard/loading.tsx` — skeleton ตรงรูปทรงหน้าจริง (2 หน้าที่ใช้บ่อยสุด)
- [x] `useLinkStatus` → feedback ทันทีที่นิ้วแตะ ก่อน server ตอบด้วยซ้ำ: `AppNav`, `AppSidebar`, `PeriodToggle`
- [x] เขียนกฎลง DESIGN.md ให้ 3 สายทำตาม

## Acceptance criteria

- ทุกหน้าใน `(app)` มี loading boundary → prefetch กลับมาทำงาน
- กดเมนู → เห็นการตอบสนอง **ทันที** (ไม่รอ server)
- กดปุ่ม 7/14/30 → ปุ่มบอกว่ากำลังโหลด ไม่ใช่นิ่งเฉย
- lint + test + build ผ่าน

## Comments

2026-07-14 (A): เสร็จแล้ว — prefetch ครบ 7 เมนู (เดิมขาด `/dashboard` + `/settings/privacy`) · เพิ่ม `loading.tsx`/skeleton และ spinner ตั้งแต่วินาทีที่นิ้วแตะเมนู

ส่งต่อ 3 สาย: ใช้ `Skeleton` / `FormSkeleton` / `ContentSkeleton` / `CardSkeleton` / `NavIcon` / `PendingBar` ได้เลย · กฎ "หน้าใหม่ต้องมี loading.tsx" เขียนลง DESIGN.md + checklist ก่อนเปิด PR แล้ว

ข้อจำกัดที่ยังจริง: prefetch ปิดใน dev mode → เรื่องนี้ต้องทดสอบบน production build เท่านั้น
