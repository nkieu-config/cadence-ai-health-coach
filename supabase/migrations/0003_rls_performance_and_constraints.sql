begin;

-- 1. RLS: เรียก auth.uid() ครั้งเดียวต่อ query แทนที่จะเรียกทุกแถว
--    และจำกัดให้ policy ทำงานเฉพาะ role authenticated (anon ข้ามไปเลย ไม่ต้องประเมิน)

drop policy if exists "own_profile" on profiles;
create policy "own_profile" on profiles
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "own_checkins" on checkins;
create policy "own_checkins" on checkins
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "own_goals" on goals;
create policy "own_goals" on goals
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "own_chat_messages" on chat_messages;
create policy "own_chat_messages" on chat_messages
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "own_ai_outputs" on ai_outputs;
create policy "own_ai_outputs" on ai_outputs
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- 2. CHECK constraints — ด่านสุดท้ายของ DB
--    anon key เป็น public ผู้ใช้ที่ล็อกอินยิง PostgREST ตรงได้โดยไม่ผ่าน validateCheckin()
--    RLS กันได้แค่ "ห้ามแตะแถวคนอื่น" แต่ไม่ได้กัน "เขียนค่าขยะลงแถวตัวเอง"

alter table checkins drop constraint if exists checkins_bed_time_bucket_check;
alter table checkins add constraint checkins_bed_time_bucket_check
  check (bed_time_bucket in ('before_23', '23_00', '00_01', '01_02', 'after_02'));

alter table checkins drop constraint if exists checkins_meal_feeling_check;
alter table checkins add constraint checkins_meal_feeling_check
  check (meal_feeling in ('just_right', 'sleepy', 'hungry_fast', 'energized'));

alter table checkins drop constraint if exists checkins_late_reason_check;
alter table checkins add constraint checkins_late_reason_check
  check (late_reason in ('work', 'exam', 'phone', 'commute', 'other'));

alter table checkins drop constraint if exists checkins_movement_blocker_check;
alter table checkins add constraint checkins_movement_blocker_check
  check (movement_blocker in ('no_time', 'rain', 'tired', 'long_sitting'));

alter table checkins drop constraint if exists checkins_skipped_meals_check;
alter table checkins add constraint checkins_skipped_meals_check
  check (skipped_meals <@ array['breakfast', 'lunch', 'dinner']::text[]);

alter table checkins drop constraint if exists checkins_movement_types_check;
alter table checkins add constraint checkins_movement_types_check
  check (movement_types <@ array['walk', 'stretch', 'stairs', 'bike', 'sport', 'none']::text[]);

alter table checkins drop constraint if exists checkins_disruptors_check;
alter table checkins add constraint checkins_disruptors_check
  check (disruptors <@ array['deadline', 'long_meeting', 'early_class', 'online_class', 'commute', 'exam', 'none']::text[]);

alter table checkins drop constraint if exists checkins_food_types_check;
alter table checkins add constraint checkins_food_types_check
  check (food_types <@ array['snack', 'veg_fruit']::text[]);

alter table checkins drop constraint if exists checkins_meals_count_check;
alter table checkins add constraint checkins_meals_count_check
  check (meals_count between 0 and 3);

alter table checkins drop constraint if exists checkins_sweet_drinks_check;
alter table checkins add constraint checkins_sweet_drinks_check
  check (sweet_drinks between 0 and 20);

alter table checkins drop constraint if exists checkins_movement_minutes_check;
alter table checkins add constraint checkins_movement_minutes_check
  check (movement_minutes between 0 and 600);

alter table checkins drop constraint if exists checkins_note_length_check;
alter table checkins add constraint checkins_note_length_check
  check (char_length(note) <= 200);

alter table profiles drop constraint if exists profiles_early_days_check;
alter table profiles add constraint profiles_early_days_check
  check (early_days <@ array['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']::text[]);

alter table profiles drop constraint if exists profiles_busy_periods_check;
alter table profiles add constraint profiles_busy_periods_check
  check (busy_periods <@ array['exam', 'project_deadline', 'month_end', 'weekly', 'unpredictable']::text[]);

alter table profiles drop constraint if exists profiles_typical_constraints_check;
alter table profiles add constraint profiles_typical_constraints_check
  check (typical_constraints <@ array['no_time', 'no_place', 'limited_budget', 'poor_rest', 'long_commute']::text[]);

alter table goals drop constraint if exists goals_situation_tag_check;
alter table goals add constraint goals_situation_tag_check
  check (situation_tag in ('early_class', 'deadline', 'long_screen', 'long_commute', 'phone_before_bed', 'no_exercise_time'));

alter table goals drop constraint if exists goals_title_length_check;
alter table goals add constraint goals_title_length_check
  check (char_length(title) between 1 and 80);

-- ข้อความของผู้ใช้จำกัด 500 ตัวอักษร แต่คำตอบของโค้ชยาวได้ — เช็คเฉพาะฝั่งผู้ใช้
alter table chat_messages drop constraint if exists chat_messages_user_length_check;
alter table chat_messages add constraint chat_messages_user_length_check
  check (role <> 'user' or char_length(content) <= 500);

-- 3. Index สำหรับ latestCheckinAt() — ถูกเรียกทุกครั้งที่เช็คว่า cache ของ AI หมดอายุหรือยัง (INFRA-07)
create index if not exists checkins_user_updated_idx on checkins (user_id, updated_at desc);

commit;
