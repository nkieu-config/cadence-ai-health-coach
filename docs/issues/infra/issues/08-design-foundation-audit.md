# INFRA-08: Audit โครงสร้าง design system ก่อน 3 สายเริ่มงาน UI

Status: done
Owner: A
Sprint: 2
Priority: S — แต่ต้องทำ "ก่อน" 3 สายเริ่ม ไม่งั้นแก้ทีหลังชนทุกคน
Refs: DESIGN.md, NFR-1, docs/agents/domain.md
Blocked by: —

## ที่มา

ตรวจ layout / spacing / color ทั้งระบบก่อนปล่อย 3 สายลงงาน UI — จังหวะนี้คือครั้งสุดท้ายที่แก้ฐานได้โดยไม่ชนใคร

## ผลตรวจ: ฐานแข็งแรง — เจอปัญหาจริง 5 จุด

### ✅ ที่ตรวจแล้วผ่าน (ยืนยันด้วย grep ทั้ง src)

- **ไม่มีสี hardcode ในโค้ดแอปเลย** — ทุกสีผ่าน token (`bg-primary`, `text-muted-foreground`, …)
- Token ครบทั้งระบบใน `globals.css` รวม `--chart-1..5` ทั้ง light/dark · dark mode ผูก `prefers-color-scheme` + `color-scheme`
- Spacing ทุกค่าอยู่บน 4px grid · z-index มีจุดเดียวทั้งแอป (header `z-10`)
- ทุกหน้า (9/9) ใช้ `<PageContainer>` · ทุกหน้ามี `<h1>` 1 อัน · ไม่มี `<main>` ซ้อน
- Input/Textarea ใช้ `text-base md:text-sm` → **กัน iOS auto-zoom แล้ว**
- ปุ่ม destructive เป็น soft-tint (`bg-destructive/10 text-destructive`) → contrast ผ่านทั้ง 2 โหมด
- `prefers-reduced-motion` + `safe-area-inset-bottom` + `scroll-padding-top` ครบ

### 🔴 ปัญหาที่เจอ

| # | ปัญหา | ผลกระทบ |
|---|---|---|
| 1 | **กฎแอปใน DESIGN.md อยู่บรรทัด 197–258** ใต้สเปคแบรนด์ Cohere 196 บรรทัด — แต่กติกาทีม (BOARD ข้อ 5) สั่ง "อ่าน 60 บรรทัดแรก" | เพื่อนจะอ่านเจอ font 96px + hex ของ Cohere แทนกฎจริง **ก่อนเริ่มงาน UI พอดี** |
| 2 | **`Chip` ไม่มี focus ring** — Button มี `focus-visible:ring-3` แต่ Chip เป็น `<button>` เปล่า | ผู้ใช้คีย์บอร์ดมองไม่เห็นว่า focus อยู่ไหนบน check-in ทั้งหน้า (คำถามทุกข้อคือ Chip) · 3 สายกำลังจะก๊อป pattern นี้ไปใช้ต่อ |
| 3 | `min-h-screen` ตกค้าง 2 จุด (landing + auth layout) ขณะที่ที่อื่นใช้ `min-h-dvh` แล้ว | 100vh บนมือถือสูงเกินจอจริง (URL bar) — ปุ่ม login อาจตกขอบ |
| 4 | h1 คนละสเกล: history `text-lg` · dashboard `text-xl lg:text-2xl` · privacy `text-xl` (ไม่มี lg) | ไม่มีมาตรฐานให้ 3 สายก๊อป — แต่ละคนจะเดาเอง แล้วได้ 3 แบบใหม่ |
| 5 | หน้า privacy ใช้ `text-xs` (12px) เป็นเนื้อความหลักทั้งหน้า + `text-[11px]` | หน้าที่กรรมการอ่านตอน pitch อ่านยากที่สุดในแอป — เนื้อความควร ≥ `text-sm` (`text-xs` ไว้สำหรับ caption/meta) |

## งาน

- [x] ย้ายกฎแอปขึ้นบนสุดของ DESIGN.md · สเปค Cohere ลงล่างใต้ป้าย "เอกสารอ้างอิง — ใช้แค่สี/ฟอนต์"
- [x] เพิ่มกฎที่ audit นี้ codify: สเกล h1 · จังหวะ spacing · เนื้อความ ≥ text-sm · ห้ามเพิ่ม z-index · ใช้ min-h-dvh · interactive ใหม่ต้องมี focus ring
- [x] Chip: เพิ่ม `focus-visible` ring แบบเดียวกับ Button
- [x] `min-h-screen` → `min-h-dvh` (2 จุด)
- [x] h1 มาตรฐานเดียว: `text-xl font-semibold lg:text-2xl` (แก้ history + privacy)
- [x] privacy: เนื้อความ `text-xs` → `text-sm` (คง `text-xs` ไว้เฉพาะ CardDescription/caption)

## Acceptance criteria

- 60 บรรทัดแรกของ DESIGN.md คือกฎแอปจริง (ตรงกับที่ BOARD ข้อ 5 อ้าง)
- กด Tab ไล่บนหน้า /checkin แล้วเห็น focus ตลอดเส้นทาง
- ไม่มี `min-h-screen` เหลือใน src
- lint + test + build ผ่าน · ไม่มีการเปลี่ยน behavior ใด ๆ (visual polish ล้วน)

## Comments

2026-07-14 (A): เสร็จแล้ว — แก้ครบ 5 จุดในรอบเดียวก่อน 3 สายเริ่ม

จุดที่อยากให้ทีมสังเกต: **Chip ไม่มี focus ring มาตั้งแต่ต้น** และไม่มีใครเห็นเพราะทุกคนเทสต์ด้วยเมาส์/นิ้ว — เจอเพราะไล่เทียบกับ Button ทีละ state · ตอนนี้กฎ "interactive ที่สร้างเองต้องมี focus ring" อยู่ใน DESIGN.md แล้ว พร้อมข้อ Tab-ไล่ทั้งหน้าใน checklist ก่อนเปิด PR
