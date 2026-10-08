-- DT-01 Moderation V2.2. Nach Community-Chat-SQL ausfuehren.
-- Admin-Account wird anhand der bestaetigten Auth-E-Mail gesetzt.
create table if not exists public.dt01_chat_roles(user_id uuid primary key references auth.users(id) on delete cascade, role text not null check(role in ('admin','moderator')), granted_at timestamptz not null default now());
create table if not exists public.dt01_chat_bans(user_id uuid primary key references auth.users(id) on delete cascade, expires_at timestamptz, reason text not null default '', issued_by uuid references auth.users(id), created_at timestamptz not null default now());
create table if not exists public.dt01_chat_acceptance(user_id uuid primary key references auth.users(id) on delete cascade, accepted_at timestamptz not null default now());
create table if not exists public.dt01_chat_audit(id bigint generated always as identity primary key, actor_id uuid references auth.users(id), action text not null, target_id uuid, message_id bigint, created_at timestamptz not null default now());
alter table public.dt01_chat_roles enable row level security;
alter table public.dt01_chat_bans enable row level security;
alter table public.dt01_chat_acceptance enable row level security;
alter table public.dt01_chat_audit enable row level security;
revoke all on public.dt01_chat_roles,public.dt01_chat_bans,public.dt01_chat_acceptance,public.dt01_chat_audit from anon,authenticated;
-- Existing moderator permissions remain valid while moving to role-based access.
insert into public.dt01_chat_roles(user_id,role)
select id,'admin' from auth.users where lower(email)=lower('walfischbaby@gmx.net')
on conflict(user_id) do update set role='admin';
create or replace function public.dt01_chat_my_role() returns text language sql stable security definer set search_path=public,pg_temp as $$select role from public.dt01_chat_roles where user_id=auth.uid()$$;
revoke all on function public.dt01_chat_my_role() from public,anon;grant execute on function public.dt01_chat_my_role() to authenticated;
create or replace function public.dt01_chat_accept_rules() returns void language plpgsql security definer set search_path=public,pg_temp as $$begin if auth.uid() is null then raise exception 'Anmeldung erforderlich';end if;insert into public.dt01_chat_acceptance(user_id) values(auth.uid()) on conflict do nothing;end$$;
revoke all on function public.dt01_chat_accept_rules() from public,anon;grant execute on function public.dt01_chat_accept_rules() to authenticated;
create or replace function public.dt01_chat_my_status() returns table(role text,accepted boolean,banned_until timestamptz,banned_permanent boolean) language sql stable security definer set search_path=public,pg_temp as $$select (select r.role from public.dt01_chat_roles r where r.user_id=auth.uid()),exists(select 1 from public.dt01_chat_acceptance a where a.user_id=auth.uid()),(select b.expires_at from public.dt01_chat_bans b where b.user_id=auth.uid() and (b.expires_at is null or b.expires_at>now())),exists(select 1 from public.dt01_chat_bans b where b.user_id=auth.uid() and b.expires_at is null)$$;
revoke all on function public.dt01_chat_my_status() from public,anon;grant execute on function public.dt01_chat_my_status() to authenticated;
-- Harden existing RPC: no sending without rules or while banned; server-side 8-second cooldown.
create or replace function public.dt01_send_chat_message(p_body text) returns bigint language plpgsql security definer set search_path=public,pg_temp as $$declare uid uuid:=auth.uid();msg text:=btrim(p_body);result_id bigint;begin
if uid is null then raise exception 'Bitte anmelden.';end if;
if not exists(select 1 from public.dt01_chat_acceptance where user_id=uid) then raise exception 'Bitte zuerst Chat-Regeln akzeptieren.';end if;
if exists(select 1 from public.dt01_chat_bans where user_id=uid and (expires_at is null or expires_at>now())) then raise exception 'Dein Chat-Zugang ist gesperrt.';end if;
if msg is null or char_length(msg)<1 or char_length(msg)>500 then raise exception 'Nachricht muss 1 bis 500 Zeichen haben.';end if;
-- advisory lock prevents concurrent cooldown bypass
perform pg_advisory_xact_lock(hashtextextended(uid::text,12345));
if exists(select 1 from public.community_messages where user_id=uid and created_at>now()-interval '8 seconds') then raise exception 'Bitte 8 Sekunden warten.';end if;
insert into public.community_messages(user_id,body) values(uid,msg) returning id into result_id;return result_id;end$$;
revoke all on function public.dt01_send_chat_message(text) from public,anon;grant execute on function public.dt01_send_chat_message(text) to authenticated;
-- Only staff may read report queue, author identifiers and audit records.
create or replace function public.dt01_chat_reports_queue() returns table(report_id bigint,message_id bigint,body text,author_id uuid,reporter_id uuid,created_at timestamptz) language sql security definer set search_path=public,pg_temp as $$select r.id,r.message_id,m.body,m.user_id,r.reporter_id,r.created_at from public.community_chat_reports r join public.community_messages m on m.id=r.message_id where m.is_deleted=false and exists(select 1 from public.dt01_chat_roles a where a.user_id=auth.uid()) order by r.created_at desc limit 100$$;
revoke all on function public.dt01_chat_reports_queue() from public,anon;grant execute on function public.dt01_chat_reports_queue() to authenticated;
create or replace function public.dt01_chat_staff_action(p_action text,p_target uuid default null,p_message_id bigint default null,p_minutes integer default null,p_reason text default '') returns void language plpgsql security definer set search_path=public,pg_temp as $$declare actor uuid:=auth.uid();myrole text;targetrole text;begin
select role into myrole from public.dt01_chat_roles where user_id=actor;
if myrole is null then raise exception 'Keine Moderationsberechtigung.';end if;
if p_action='delete' then
 if p_message_id is null then raise exception 'Nachricht fehlt';end if;
 update public.community_messages set is_deleted=true where id=p_message_id;
 if not found then raise exception 'Nachricht nicht gefunden';end if;
 delete from public.community_chat_reports where message_id=p_message_id;
elsif p_action='dismiss' then
 if p_message_id is null then raise exception 'Nachricht fehlt';end if;
 delete from public.community_chat_reports where message_id=p_message_id;
elsif p_action in ('ban','unban','promote','demote') then
 if p_target is null then raise exception 'Nutzer fehlt';end if;
 select role into targetrole from public.dt01_chat_roles where user_id=p_target;
 if p_target=actor or targetrole='admin' then raise exception 'Administrator kann hier nicht bearbeitet werden';end if;
 if p_action in ('promote','demote') and myrole<>'admin' then raise exception 'Nur Administratoren verwalten Rollen';end if;
 if p_action='promote' then insert into public.dt01_chat_roles(user_id,role) values(p_target,'moderator') on conflict(user_id) do update set role='moderator';
 elsif p_action='demote' then delete from public.dt01_chat_roles where user_id=p_target and role='moderator';
 elsif p_action='ban' then
  if p_minutes is not null and (p_minutes<1 or p_minutes>525600) then raise exception 'Ungueltige Sperrdauer';end if;
  insert into public.dt01_chat_bans(user_id,expires_at,reason,issued_by) values(p_target,case when p_minutes is null then null else now()+make_interval(mins=>p_minutes) end,left(coalesce(p_reason,''),250),actor) on conflict(user_id) do update set expires_at=excluded.expires_at,reason=excluded.reason,issued_by=actor,created_at=now();
 else delete from public.dt01_chat_bans where user_id=p_target;end if;
else raise exception 'Unbekannte Aktion';end if;
insert into public.dt01_chat_audit(actor_id,action,target_id,message_id) values(actor,p_action,p_target,p_message_id);end$$;
revoke all on function public.dt01_chat_staff_action(text,uuid,bigint,integer,text) from public,anon;grant execute on function public.dt01_chat_staff_action(text,uuid,bigint,integer,text) to authenticated;
-- Public lookup by exact display name for admin role assignments; returns only user ID + name.
create or replace function public.dt01_chat_find_player(p_username text) returns table(user_id uuid,username text) language sql stable security definer set search_path=public,pg_temp as $$select p.user_id,p.username::text from public.player_profiles p where exists(select 1 from public.dt01_chat_roles r where r.user_id=auth.uid() and r.role='admin') and lower(p.username)=lower(btrim(p_username)) limit 5$$;
revoke all on function public.dt01_chat_find_player(text) from public,anon;grant execute on function public.dt01_chat_find_player(text) to authenticated;
-- Existing legacy delete RPC: keep access limited to staff, now including new moderators.
create or replace function public.dt01_moderate_chat_message(p_message_id bigint) returns void language plpgsql security definer set search_path=public,pg_temp as $$begin if not exists(select 1 from public.dt01_chat_roles where user_id=auth.uid()) then raise exception 'Keine Moderationsberechtigung';end if;perform public.dt01_chat_staff_action('delete',null,p_message_id,null,'');end$$;
revoke all on function public.dt01_moderate_chat_message(bigint) from public,anon;grant execute on function public.dt01_moderate_chat_message(bigint) to authenticated;
-- Staff-only audit view through RPC.
create or replace function public.dt01_chat_audit_recent() returns table(action text,created_at timestamptz,actor_id uuid,target_id uuid,message_id bigint) language sql security definer set search_path=public,pg_temp as $$select a.action,a.created_at,a.actor_id,a.target_id,a.message_id from public.dt01_chat_audit a where exists(select 1 from public.dt01_chat_roles r where r.user_id=auth.uid()) order by a.created_at desc limit 30$$;
revoke all on function public.dt01_chat_audit_recent() from public,anon;grant execute on function public.dt01_chat_audit_recent() to authenticated;
