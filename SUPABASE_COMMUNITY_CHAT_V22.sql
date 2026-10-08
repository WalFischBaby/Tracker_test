-- DT-01 Community Chat V2.2 (Testserver)
-- Run in Supabase SQL Editor. Does not change existing tracker tables.
create table if not exists public.community_messages (
 id bigint generated always as identity primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 body text not null check (char_length(body) between 1 and 500),
 created_at timestamptz not null default now(),
 is_deleted boolean not null default false
);
create index if not exists community_messages_latest on public.community_messages(created_at desc);
alter table public.community_messages enable row level security;
revoke insert,update,delete on public.community_messages from anon,authenticated;
grant select on public.community_messages to anon,authenticated;
drop policy if exists community_messages_read on public.community_messages;
create policy community_messages_read on public.community_messages for select to anon,authenticated using (is_deleted=false);

create table if not exists public.community_chat_reports (
 id bigint generated always as identity primary key,
 message_id bigint not null references public.community_messages(id) on delete cascade,
 reporter_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 unique(message_id,reporter_id)
);
alter table public.community_chat_reports enable row level security;
revoke all on public.community_chat_reports from anon,authenticated;

create table if not exists public.community_chat_moderators (
 user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.community_chat_moderators enable row level security;
revoke all on public.community_chat_moderators from anon,authenticated;

create or replace function public.dt01_send_chat_message(p_body text) returns bigint
language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := auth.uid(); msg text := btrim(p_body); result_id bigint;
begin
 if uid is null then raise exception 'Bitte anmelden.'; end if;
 if msg is null or char_length(msg)<1 or char_length(msg)>500 then raise exception 'Nachricht muss 1 bis 500 Zeichen haben.'; end if;
 if exists(select 1 from public.community_messages where user_id=uid and created_at > now()-interval '8 seconds') then raise exception 'Bitte 8 Sekunden zwischen Nachrichten warten.'; end if;
 insert into public.community_messages(user_id,body) values(uid,msg) returning id into result_id;
 return result_id;
end $$;
revoke all on function public.dt01_send_chat_message(text) from public,anon;
grant execute on function public.dt01_send_chat_message(text) to authenticated;

create or replace function public.dt01_report_chat_message(p_message_id bigint) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
begin
 if auth.uid() is null then raise exception 'Bitte anmelden.'; end if;
 if not exists(select 1 from public.community_messages where id=p_message_id and is_deleted=false) then raise exception 'Nachricht nicht gefunden.'; end if;
 insert into public.community_chat_reports(message_id,reporter_id) values(p_message_id,auth.uid()) on conflict do nothing;
end $$;
revoke all on function public.dt01_report_chat_message(bigint) from public,anon;
grant execute on function public.dt01_report_chat_message(bigint) to authenticated;

create or replace function public.dt01_moderate_chat_message(p_message_id bigint) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
begin
 if not exists(select 1 from public.community_chat_moderators where user_id=auth.uid()) then raise exception 'Keine Moderationsberechtigung.'; end if;
 update public.community_messages set is_deleted=true where id=p_message_id;
end $$;
revoke all on function public.dt01_moderate_chat_message(bigint) from public,anon;
grant execute on function public.dt01_moderate_chat_message(bigint) to authenticated;

-- Optional: Realtime (polling works even if this fails because already enabled).
do $$ begin
 alter publication supabase_realtime add table public.community_messages;
exception when duplicate_object then null; end $$;

-- Expose ONLY public chat authors' chosen display names/avatars, not private profile details.
create or replace function public.dt01_chat_author_profiles()
returns table(user_id uuid, username text, avatar text)
language sql security definer set search_path=public,pg_temp as $$
 select distinct p.user_id, p.username::text, p.avatar::text
 from public.player_profiles p
 where exists (select 1 from public.community_messages m where m.user_id=p.user_id and m.is_deleted=false);
$$;
revoke all on function public.dt01_chat_author_profiles() from public;
grant execute on function public.dt01_chat_author_profiles() to anon,authenticated;
