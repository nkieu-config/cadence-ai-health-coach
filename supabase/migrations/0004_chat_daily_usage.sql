-- โควตาแชทเคยนับจากจำนวนแถวใน chat_messages ที่ยังเหลืออยู่
-- ผู้ใช้จึงกด "ล้างประวัติ" เพื่อรีเซ็ตโควตาได้ไม่จำกัด และกินโควตา Gemini รวมของทั้งแอป
-- ตารางนี้เป็นตัวนับแบบเพิ่มอย่างเดียว จึงไม่หายไปพร้อมการลบประวัติ
-- (เก็บแค่ตัวเลข ไม่มีเนื้อหาข้อความ — การลบประวัติยังลบเนื้อหาจริงครบตามที่สัญญาไว้ในหน้า privacy)

create table chat_daily_usage (
  user_id uuid not null references auth.users on delete cascade,
  usage_date date not null,
  message_count integer not null default 0,
  primary key (user_id, usage_date)
);

alter table chat_daily_usage enable row level security;

create policy "own_chat_daily_usage" on chat_daily_usage
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function bump_chat_usage(day date)
returns integer
language plpgsql
security invoker
as $$
declare
  updated integer;
begin
  insert into chat_daily_usage (user_id, usage_date, message_count)
  values (auth.uid(), day, 1)
  on conflict (user_id, usage_date)
  do update set message_count = chat_daily_usage.message_count + 1
  returning message_count into updated;

  return updated;
end;
$$;
