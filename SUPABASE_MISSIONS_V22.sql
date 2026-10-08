-- DT-01 V2.2: eigene Missionstabelle; bestehende Tabellen bleiben unberührt.
create table if not exists public.player_missions (
 user_id uuid not null references auth.users(id) on delete cascade,
 mission_id text not null,
 payload jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now(),
 primary key(user_id,mission_id)
);
alter table public.player_missions enable row level security;
drop policy if exists "player_missions_select_own" on public.player_missions;
create policy "player_missions_select_own" on public.player_missions for select to authenticated using (auth.uid()=user_id);
drop policy if exists "player_missions_insert_own" on public.player_missions;
create policy "player_missions_insert_own" on public.player_missions for insert to authenticated with check (auth.uid()=user_id);
drop policy if exists "player_missions_update_own" on public.player_missions;
create policy "player_missions_update_own" on public.player_missions for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
