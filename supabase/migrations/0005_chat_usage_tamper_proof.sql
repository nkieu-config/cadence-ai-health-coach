-- INFRA-20 ปิดไม่ครบใน 0004: ย้ายตัวนับออกจากตารางที่ลบได้แล้วก็จริง
-- แต่ policy เดิมเป็น `for all` ผู้ใช้จึง update/delete แถวตัวนับของตัวเองได้
-- ยิงตรงเข้า Supabase ด้วย JWT ตัวเอง แล้วล้างประวัติแชทซ้ำ = ได้โควตาใหม่เหมือนเดิม
--
-- ผู้ใช้เหลือสิทธิ์แค่ "อ่านของตัวเอง" · การเพิ่มและการล้างทำผ่านฟังก์ชัน security definer
-- ที่บังคับ auth.uid() ไว้ในตัว จึงแตะของคนอื่นไม่ได้แม้เรียกตรง

drop policy if exists "own_chat_daily_usage" on chat_daily_usage;

create policy "read_own_chat_daily_usage" on chat_daily_usage
  for select using (auth.uid() = user_id);

create or replace function bump_chat_usage(day date)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  updated integer;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  insert into chat_daily_usage (user_id, usage_date, message_count)
  values (auth.uid(), day, 1)
  on conflict (user_id, usage_date)
  do update set message_count = chat_daily_usage.message_count + 1
  returning message_count into updated;

  return updated;
end;
$$;

-- "ลบข้อมูลทั้งหมด" ต้องคืนโควตาจริง (ผู้ใช้เริ่มต้นใหม่ทั้งหมด) — คนละเรื่องกับล้างประวัติแชท
-- ซึ่งลบเนื้อหาแต่ไม่คืนโควตา
create or replace function clear_chat_usage()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  delete from chat_daily_usage where user_id = auth.uid();
end;
$$;

revoke execute on function bump_chat_usage(date) from public;
revoke execute on function clear_chat_usage() from public;
grant execute on function bump_chat_usage(date) to authenticated;
grant execute on function clear_chat_usage() to authenticated;
