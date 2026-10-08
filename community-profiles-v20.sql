-- DT-01 V2.0: authenticated-only member directory. Run in Supabase SQL editor.
create table if not exists public.dt01_member_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 username text not null,
 fortnite_name text not null default '',
 discord_name text not null default '',
 twitch_name text not null default '',
 tiktok_name text not null default '',
 bio text not null default '',
 avatar text not null default '🤖',
 rank_name text not null default 'Rekrut',
 rank_percent integer not null default 0 check (rank_percent between 0 and 100),
 achievement_ids text[] not null default '{}',
 updated_at timestamptz not null default now(),
 constraint dt01_member_profiles_username_valid check (username ~ '^[A-Za-z0-9_-]{3,24}$'),
 constraint dt01_member_profiles_avatar_valid check (length(avatar)<=250),
 constraint dt01_member_profiles_bio_valid check (length(bio)<=180),
 constraint dt01_member_profiles_fields_valid check (length(fortnite_name)<=60 and length(discord_name)<=60 and length(twitch_name)<=60 and length(tiktok_name)<=60)
);
create unique index if not exists dt01_member_profiles_username_unique on public.dt01_member_profiles(lower(username));
create table if not exists public.dt01_member_roles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null check(role in ('admin','moderator'))
);
alter table public.dt01_member_profiles enable row level security;
alter table public.dt01_member_roles enable row level security;
revoke all on public.dt01_member_profiles from anon;
revoke all on public.dt01_member_roles from anon;
grant select,insert,update,delete on public.dt01_member_profiles to authenticated;
grant select on public.dt01_member_roles to authenticated;
drop policy if exists dt01_profiles_member_read on public.dt01_member_profiles;
create policy dt01_profiles_member_read on public.dt01_member_profiles for select to authenticated using (auth.uid() is not null);
drop policy if exists dt01_profiles_self_insert on public.dt01_member_profiles;
create policy dt01_profiles_self_insert on public.dt01_member_profiles for insert to authenticated with check(auth.uid()=user_id);
drop policy if exists dt01_profiles_self_update on public.dt01_member_profiles;
create policy dt01_profiles_self_update on public.dt01_member_profiles for update to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists dt01_profiles_self_delete on public.dt01_member_profiles;
create policy dt01_profiles_self_delete on public.dt01_member_profiles for delete to authenticated using(auth.uid()=user_id);
drop policy if exists dt01_roles_member_read on public.dt01_member_roles;
create policy dt01_roles_member_read on public.dt01_member_roles for select to authenticated using(auth.uid() is not null);
-- No client write grants/policies on dt01_member_roles. Grant roles via SQL editor/service role.
-- Example (replace UUID): insert into public.dt01_member_roles(user_id, role) values ('UUID-HERE', 'moderator') on conflict(user_id) do update set role=excluded.role;
-- Private avatar bucket. Signed URLs are issued only to authenticated users.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('dt01-profile-avatars','dt01-profile-avatars',false,2097152,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false, file_size_limit=2097152, allowed_mime_types=array['image/jpeg','image/png','image/webp'];
drop policy if exists dt01_avatar_user_upload on storage.objects;
create policy dt01_avatar_user_upload on storage.objects for insert to authenticated
with check(bucket_id='dt01-profile-avatars' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists dt01_avatar_user_update on storage.objects;
create policy dt01_avatar_user_update on storage.objects for update to authenticated
using(bucket_id='dt01-profile-avatars' and (storage.foldername(name))[1]=auth.uid()::text)
with check(bucket_id='dt01-profile-avatars' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists dt01_avatar_user_delete on storage.objects;
create policy dt01_avatar_user_delete on storage.objects for delete to authenticated
using(bucket_id='dt01-profile-avatars' and (storage.foldername(name))[1]=auth.uid()::text);

drop policy if exists dt01_avatar_member_read on storage.objects;
create policy dt01_avatar_member_read on storage.objects for select to authenticated using(bucket_id='dt01-profile-avatars');
