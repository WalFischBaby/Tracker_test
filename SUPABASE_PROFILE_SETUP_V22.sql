-- V2.2 private player profiles. Run once in Supabase SQL Editor.
create table if not exists public.player_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  avatar text not null default '🤖',
  bio text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint player_profiles_username_format check (username ~ '^[A-Za-z0-9_-]{3,24}$'),
  constraint player_profiles_bio_length check (char_length(bio) <= 180),
  constraint player_profiles_avatar_allowed check (avatar in ('🤖','🚀','🌌','⭐','🐋'))
);
create unique index if not exists player_profiles_username_unique_ci on public.player_profiles (lower(username));
alter table public.player_profiles enable row level security;
revoke all on public.player_profiles from anon;
grant select,insert,update,delete on public.player_profiles to authenticated;
drop policy if exists "Private profile select" on public.player_profiles;
drop policy if exists "Private profile insert" on public.player_profiles;
drop policy if exists "Private profile update" on public.player_profiles;
drop policy if exists "Private profile delete" on public.player_profiles;
create policy "Private profile select" on public.player_profiles for select to authenticated using (auth.uid()=user_id);
create policy "Private profile insert" on public.player_profiles for insert to authenticated with check (auth.uid()=user_id);
create policy "Private profile update" on public.player_profiles for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "Private profile delete" on public.player_profiles for delete to authenticated using (auth.uid()=user_id);
-- Unique-index constraint prevents duplicates; RLS keeps profile records private.
