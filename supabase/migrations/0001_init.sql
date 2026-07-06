create table profiles (
  user_id uuid primary key references auth.users on delete cascade,
  display_name text not null,
  status text not null check (status in ('student', 'first_jobber')),
  early_days text[] default '{}',
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
  sweet_drinks int default 0,
  meal_feeling text,
  sleep_hours numeric(3,1) not null,
  bed_time_bucket text not null,
  sleep_quality int not null check (sleep_quality between 1 and 5),
  late_reason text,
  movement_types text[] default '{}',
  movement_minutes int default 0,
  movement_blocker text,
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

create index checkins_user_date_idx on checkins (user_id, checkin_date desc);
create index goals_user_week_idx on goals (user_id, week_start desc);
create index chat_messages_user_created_idx on chat_messages (user_id, created_at);
create index ai_outputs_user_kind_idx on ai_outputs (user_id, kind, period_start desc);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger checkins_set_updated_at
before update on checkins
for each row execute function set_updated_at();

alter table profiles enable row level security;
alter table checkins enable row level security;
alter table goals enable row level security;
alter table chat_messages enable row level security;
alter table ai_outputs enable row level security;

create policy "own_profile" on profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own_checkins" on checkins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own_goals" on goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own_chat_messages" on chat_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own_ai_outputs" on ai_outputs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
