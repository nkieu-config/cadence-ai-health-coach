# 05 — Health Behavior Data Design

หลักออกแบบ: **low burden** (คำถามน้อย ตอบเป็นปุ่ม), **data minimization** (ไม่เก็บสิ่งที่ไม่ใช้ ไม่เก็บน้ำหนัก/รูปร่าง), และทุกจุดข้อมูลต้องถูกใช้ใน pattern analysis หรือ dashboard จริง

## ครบตามโจทย์ข้อ 5 (Required Input) — ตรวจทีละบรรทัด

โจทย์ข้อ 5 ขอ input 18 อย่าง · เก็บครบทุกอย่าง โดย**ไม่ทำให้ check-in ยาวขึ้นจนเกิน 3 นาที**

| โจทย์ | ขอ | เราเก็บที่ |
|---|---|---|
| **5.1** บริบทชีวิต | สถานะผู้ใช้ | `profiles.status` |
| | ตารางเรียน/งาน/เวลาเดินทาง | `profiles.early_days` + `typical_constraints.long_commute` |
| | ช่วงที่มักมี deadline/ภาระงานสูง | `profiles.busy_periods` |
| | ข้อจำกัด (เวลา/สถานที่/งบ/พักผ่อน) | `profiles.typical_constraints` |
| **5.2** การกิน | กินครบกี่มื้อ | `meals_count` |
| | มื้อใดมักถูกข้าม | `skipped_meals` |
| | เวลากินอาหารโดยประมาณ | `first_meal_time` |
| | ประเภทอาหาร (มื้อหลัก/ของว่าง/เครื่องดื่มหวาน/ผัก-ผลไม้) | `meals_count` + `food_types` + `sweet_drinks` |
| | ความรู้สึกหลังมื้ออาหาร | `meal_feeling` |
| | หมายเหตุ | `note` |
| **5.3** การนอน | เวลาเข้านอนโดยประมาณ | `bed_time_bucket` |
| | **เวลาตื่นนอนโดยประมาณ** | **คำนวณ** `wakeTimeRange()` — ไม่ถามซ้ำ (ดูเหตุผลด้านล่าง) |
| | จำนวนชั่วโมงการนอน | `sleep_hours` |
| | คุณภาพการนอนที่ประเมินเอง | `sleep_quality` |
| | ระดับพลังงานหลังตื่น | `energy_level` |
| | สาเหตุที่นอนดึก | `late_reason` |
| **5.4** การเคลื่อนไหว | เวลาที่เคลื่อนไหว | `movement_minutes` |
| | กิจกรรมสั้น ๆ | `movement_types` |
| | ความรู้สึกหลังทำกิจกรรม | `movement_feeling` |
| | ข้อจำกัด (ฝนตก/ไม่มีเวลา/นั่งนาน/เหนื่อย) | `movement_blocker` |

**เจตนา 3 อย่างที่ทำให้ครบโดยไม่เพิ่มภาระ:**

1. **บริบทชีวิต (5.1) ถามครั้งเดียวตอน onboarding** ไม่ใช่ทุกวัน → ภาระรายวัน = 0
2. **คำถามเสริมโผล่เฉพาะเมื่อเกี่ยว** — ไม่ได้กิน ไม่ถามเวลามื้อแรก · ไม่ได้ขยับ ไม่ถามความรู้สึกหลังขยับ (บังคับใน `validate.ts` ไม่ใช่แค่ซ่อนใน UI)
3. **เวลาตื่นนอน: ถาม 2 ใน 3 พอ** — โจทย์ขอเวลาเข้านอน + เวลาตื่น + ชั่วโมงนอน แต่ 3 ค่านี้เป็นอิสระต่อกันแค่ 2 ค่า เรารับ `bed_time_bucket` + `sleep_hours` แล้วคำนวณเวลาตื่นแสดงให้ผู้ใช้เห็น (เช่น เข้านอน 00:00–01:00 นอน 7 ชม. → ตื่นราว 07:00–08:00) · **ถามข้อที่ 3 = เพิ่มภาระโดยไม่ได้ข้อมูลใหม่** ซึ่งขัดเกณฑ์ Low Burden Design โดยตรง

## แบบจำลองข้อมูล check-in (1 รายการ/วัน)

### กิน (eating)

| ฟิลด์ | ชนิด | ค่า | ใช้ทำอะไร |
|---|---|---|---|
| `meals_count` | int | 0–3 | ความสม่ำเสมอการกิน |
| `skipped_meals` | text[] | `breakfast` `lunch` `dinner` | pattern ข้ามมื้อ × วันเรียนเช้า |
| `first_meal_time` | text? | `before_9` `9_12` `after_12` | **"กินเป็นเวลา"** × energy (โจทย์ F3 ข้อ ง) · ถามเฉพาะวันที่ได้กิน |
| `food_types` | text[] | `snack` `veg_fruit` | ประเภทอาหารตามโจทย์ 5.2 (มื้อหลัก = `meals_count` · เครื่องดื่มหวาน = `sweet_drinks`) |
| `sweet_drinks` | int | 0–4+ แก้ว | pattern เครื่องดื่มหวาน × นอนน้อย |
| `meal_feeling` | text? | `just_right` `sleepy` `hungry_fast` `energized` | เสริม ข้ามได้ (FR-1.4) · ถามเฉพาะวันที่ได้กิน |

### นอน (sleep)

| ฟิลด์ | ชนิด | ค่า | ใช้ทำอะไร |
|---|---|---|---|
| `sleep_hours` | numeric | 0–14 (step 0.5) | แกนหลักของ pattern ทุกตัว |
| `bed_time_bucket` | text | `before_23` `23_00` `00_01` `01_02` `after_02` | ความคงที่ของเวลานอน (บัคเก็ตพอ ไม่ต้องเวลาเป๊ะ) |
| *(เวลาตื่น)* | **คำนวณ ไม่เก็บ** | `wakeTimeRange()` = `bed_time_bucket` + `sleep_hours` | โจทย์ 5.3 ขอ "เวลาเข้านอนและตื่นนอนโดยประมาณ" — ถาม 2 ใน 3 พอ ข้อที่ 3 คำนวณได้ **ถามซ้ำ = เพิ่มภาระโดยไม่ได้ข้อมูลใหม่** |
| `sleep_quality` | int | 1–5 | คุณภาพที่ประเมินเอง |
| `late_reason` | text? | `work` `exam` `phone` `commute` `other` | สาเหตุนอนดึก (ถามเฉพาะเมื่อ bed_time ดึก) |

### เคลื่อนไหว (movement)

| ฟิลด์ | ชนิด | ค่า | ใช้ทำอะไร |
|---|---|---|---|
| `movement_types` | text[] | `walk` `stretch` `stairs` `bike` `sport` `none` | ชนิดกิจกรรม |
| `movement_minutes` | int | 0–120+ | ปริมาณ × energy วันถัดไป |
| `movement_blocker` | text? | `no_time` `rain` `tired` `long_sitting` | ข้อจำกัด ใช้เลือก micro goal |
| `movement_feeling` | text? | `refreshed` `relaxed` `tired` `no_change` | เสริม ข้ามได้ (FR-1.4) · ถามเฉพาะวันที่ได้ขยับ |

### บริบทวัน (context)

| ฟิลด์ | ชนิด | ค่า | ใช้ทำอะไร |
|---|---|---|---|
| `energy_level` | text | `low` `medium` `high` | ตัวแปรผลลัพธ์หลักของ pattern analysis |
| `disruptors` | text[] | `deadline` `long_meeting` `early_class` `online_class` `commute` `exam` `none` | เชื่อมพฤติกรรมกับตารางชีวิต — หัวใจของ personalization |
| `note` | text? | อิสระ ≤ 200 ตัวอักษร | ให้ AI ใช้เป็นบริบท เช่น "ประชุมยาวเลยกินช้า" |

### บริบทชีวิต — ถามครั้งเดียวตอน onboarding (โจทย์ 5.1)

ถามใน `profiles` ไม่ใช่ check-in รายวัน → **ภาระรายวันเป็นศูนย์**

| ฟิลด์ | ชนิด | ค่า | ใช้ทำอะไร |
|---|---|---|---|
| `status` | text | `student` `first_jobber` | เลือกภาษาและ micro goal ให้ตรงกลุ่ม |
| `early_days` | text[] | `mon`…`sun` | ตารางเรียน/ทำงานเช้า → คู่กับ pattern ข้ามมื้อเช้า |
| `busy_periods` | text[] | `exam` `project_deadline` `month_end` `weekly` `unpredictable` | **ช่วงที่มักมี deadline หรือภาระงานสูง** |
| `typical_constraints` | text[] | `no_time` `no_place` `limited_budget` `poor_rest` `long_commute` | ข้อจำกัด → กรอง micro goal ที่ทำไม่ได้จริงออก |

## Supabase Schema

```sql
create table profiles (
  user_id uuid primary key references auth.users on delete cascade,
  display_name text not null,
  status text not null check (status in ('student', 'first_jobber')),
  early_days text[] default '{}',
  busy_periods text[] default '{}',
  typical_constraints text[] default '{}',
  disclaimer_accepted_at timestamptz,
  created_at timestamptz default now()
);

create table checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  checkin_date date not null,
  meals_count int not null,
  skipped_meals text[] default '{}',
  first_meal_time text check (first_meal_time in ('before_9','9_12','after_12')),
  food_types text[] default '{}',
  sweet_drinks int default 0,
  meal_feeling text,
  sleep_hours numeric(3,1) not null,
  bed_time_bucket text not null,
  sleep_quality int not null check (sleep_quality between 1 and 5),
  late_reason text,
  movement_types text[] default '{}',
  movement_minutes int default 0,
  movement_blocker text,
  movement_feeling text check (movement_feeling in ('refreshed','relaxed','tired','no_change')),
  energy_level text not null check (energy_level in ('low','medium','high')),
  disruptors text[] default '{}',
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, checkin_date)
);

create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  week_start date not null,
  title text not null,
  situation_tag text,
  status text not null default 'active' check (status in ('active','done','dropped')),
  progress_dates date[] default '{}',
  created_at timestamptz default now()
);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  role text not null check (role in ('user','coach')),
  content text not null,
  created_at timestamptz default now()
);

create table ai_outputs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  kind text not null check (kind in ('pattern_analysis','weekly_reflection')),
  period_start date not null,
  period_end date not null,
  content jsonb not null,
  created_at timestamptz default now()
);
```

ทุกตารางเปิด RLS: `user_id = auth.uid()` สำหรับ select/insert/update/delete (รายละเอียด policy ใน docs/08)

**ไฟล์ migration จริงอยู่ที่ `supabase/migrations/`** — `0001_init.sql` (ตารางทั้งหมด + RLS) และ `0002_mission_input_coverage.sql` (ฟิลด์ที่โจทย์ข้อ 5 ขอเพิ่ม) · รันตามลำดับใน Supabase SQL Editor

## การจำแนกชั้นข้อมูล

| ชั้น | ข้อมูล | การปฏิบัติ |
|---|---|---|
| ข้อมูลสุขภาพ (อ่อนไหว) | checkins ทุกฟิลด์, chat_messages, ai_outputs | RLS เข้มงวด, ลบได้ทั้งหมด, ไม่ส่งให้ third party นอกจาก Gemini ตอน generate (ไม่แนบชื่อ) |
| ข้อมูลส่วนบุคคล | email (auth), display_name | ลบพร้อมบัญชี |
| ข้อมูลบริบท | status, early_days, busy_periods, typical_constraints | ใช้ personalize เท่านั้น |

## สิ่งที่จงใจไม่เก็บ

น้ำหนัก, ส่วนสูง, BMI, แคลอรี, รูปถ่ายอาหาร/ร่างกาย, ตำแหน่งที่อยู่, เวลานอนแบบนาทีเป๊ะ — ตัดตาม guardrail (ไม่โฟกัสรูปร่าง) และ data minimization
