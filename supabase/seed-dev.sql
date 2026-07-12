-- ใส่ข้อมูล check-in ย้อนหลัง 14 วัน ให้บัญชีของคุณเอง (สำหรับ dev เท่านั้น)
--
-- วิธีใช้:
--   1. สมัคร + ล็อกอินในแอปด้วยอีเมลของคุณก่อน (ต้องมีบัญชีอยู่จริง)
--   2. Supabase → SQL Editor → New query → วางไฟล์นี้ทั้งหมด
--   3. แก้อีเมลบรรทัดล่างเป็นอีเมลของคุณ → กด Run
--
-- รันซ้ำได้ ไม่สร้างข้อมูลซ้ำ (on conflict do nothing)
--
-- ข้อมูลจะมี pattern ฝังไว้: ทุก ๆ วันที่ 3 = วันมี deadline
--   → นอนน้อย (5.5 ชม.) + ข้ามมื้อเช้า + พลังงานต่ำ + ดื่มหวานเยอะ

with me as (
  select id from auth.users where email = 'เปลี่ยนเป็นอีเมลของคุณ@example.com'
),
days as (
  select generate_series(0, 13) as d
)
insert into checkins (
  user_id, checkin_date, meals_count, skipped_meals, sweet_drinks,
  sleep_hours, bed_time_bucket, sleep_quality,
  movement_types, movement_minutes, energy_level, disruptors, note
)
select
  me.id,
  current_date - d,
  case when d % 3 = 0 then 2 else 3 end,
  case when d % 3 = 0 then array['breakfast'] else array[]::text[] end,
  case when d % 3 = 0 then 2 else 0 end,
  case when d % 3 = 0 then 5.5 else 7.0 end,
  case when d % 3 = 0 then 'after_02' else '23_00' end,
  case when d % 3 = 0 then 2 else 4 end,
  case when d % 2 = 0 then array['walk'] else array['none']::text[] end,
  case when d % 2 = 0 then 25 else 0 end,
  case when d % 3 = 0 then 'low' else 'high' end,
  case when d % 3 = 0 then array['deadline'] else array[]::text[] end,
  case when d % 3 = 0 then 'คืนก่อน deadline นอนดึก' else null end
from me, days
on conflict (user_id, checkin_date) do nothing;

-- เช็คว่าเข้าแล้ว:
-- select checkin_date, sleep_hours, energy_level, disruptors from checkins order by checkin_date desc;
