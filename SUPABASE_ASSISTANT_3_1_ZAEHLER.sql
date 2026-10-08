-- Nur ergänzende, lesende Funktion. Bestehende Tabellen und Quota-RPC bleiben unverändert.
create or replace function public.dt01_get_ai_usage()
returns integer
language sql stable security definer
set search_path = public, pg_temp
as $$
  select case when auth.uid() is null then null
    else coalesce((select request_count from public.dt01_ai_daily_usage
      where user_id = auth.uid() and usage_day = (now() at time zone 'utc')::date), 0)
  end;
$$;
revoke all on function public.dt01_get_ai_usage() from public, anon;
grant execute on function public.dt01_get_ai_usage() to authenticated;
