alter table profiles
  add column busy_periods text[] default '{}';

alter table checkins
  add column first_meal_time text check (first_meal_time in ('before_9', '9_12', 'after_12')),
  add column food_types text[] default '{}',
  add column movement_feeling text check (movement_feeling in ('refreshed', 'relaxed', 'tired', 'no_change'));
