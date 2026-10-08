-- In Supabase SQL Editor einmal ausführen. Authentifizierte Benutzer: max. 10 KI-Aufrufe/UTC-Tag.
create table if not exists public.dt01_ai_daily_usage (
 user_id uuid not null references auth.users(id) on delete cascade,
 usage_day date not null,
 request_count integer not null default 0 check (request_count between 0 and 10),
 primary key(user_id,usage_day)
);
alter table public.dt01_ai_daily_usage enable row level security;
revoke all on public.dt01_ai_daily_usage from anon, authenticated;
create or replace function public.dt01_take_ai_quota() returns boolean
language plpgsql security definer set search_path = public, pg_temp as $$
declare n integer;
begin
 if auth.uid() is null then return false; end if;
 insert into public.dt01_ai_daily_usage(user_id,usage_day,request_count)
 values(auth.uid(), (now() at time zone 'utc')::date,1)
 on conflict(user_id,usage_day) do update set request_count=public.dt01_ai_daily_usage.request_count+1
 where public.dt01_ai_daily_usage.request_count<10
 returning request_count into n;
 return n is not null;
end $$;
revoke all on function public.dt01_take_ai_quota() from public, anon;
grant execute on function public.dt01_take_ai_quota() to authenticated;
