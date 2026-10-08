-- DT-01 marketplace + private messages. Run in Supabase SQL Editor BEFORE deploying UI.
create table if not exists public.dt01_market_listings (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check(kind in ('suche','biete')),
 mode text not null check(mode in ('geschenk','tausch','beides')),
 droid text not null check(length(trim(droid)) between 1 and 90),
 variant text not null check(variant in ('BASIS','GOLD','DIAMANT','RAINBOW','BESKAR','GALAKTISCH','STELLAR','KYBER INAKT','KYBER GRÜN','KYBER BLAU','KYBER LILA','MAKELLOS')),
 desired_droid text check(desired_droid is null or length(desired_droid)<=90),
 note text not null default '' check(length(note)<=280),
 status text not null default 'aktiv' check(status in ('aktiv','erledigt')),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index if not exists dt01_market_listings_active on public.dt01_market_listings(status,variant,droid);
create index if not exists dt01_market_listings_owner on public.dt01_market_listings(user_id,status);
create or replace function public.dt01_market_limit() returns trigger language plpgsql set search_path='' as $$
begin
 if new.status='aktiv' and (tg_op='INSERT' or old.status<>'aktiv' or old.user_id<>new.user_id) then
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 71451));
  if (select count(*) from public.dt01_market_listings where user_id=new.user_id and status='aktiv' and id<>new.id)>=5 then
    raise exception 'Maximal 5 aktive Einträge erlaubt';
  end if;
 end if;
 new.updated_at=now(); return new;
end;$$;
drop trigger if exists dt01_market_limit_trigger on public.dt01_market_listings;
create trigger dt01_market_limit_trigger before insert or update on public.dt01_market_listings for each row execute function public.dt01_market_limit();

create table if not exists public.dt01_dm_blocks (
 blocker_id uuid not null references auth.users(id) on delete cascade,
 blocked_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),primary key(blocker_id,blocked_id),check(blocker_id<>blocked_id)
);
create table if not exists public.dt01_dm_messages (
 id uuid primary key default gen_random_uuid(),sender_id uuid not null references auth.users(id) on delete cascade,
 recipient_id uuid not null references auth.users(id) on delete cascade,
 listing_id uuid references public.dt01_market_listings(id) on delete set null,
 body text not null check(length(trim(body)) between 1 and 1000),
 created_at timestamptz not null default now(), read_at timestamptz,
 check(sender_id<>recipient_id)
);
create index if not exists dt01_dm_sender on public.dt01_dm_messages(sender_id,created_at desc);
create index if not exists dt01_dm_recipient on public.dt01_dm_messages(recipient_id,created_at desc);
create table if not exists public.dt01_dm_reports (
 id uuid primary key default gen_random_uuid(),reporter_id uuid not null references auth.users(id) on delete cascade,
 message_id uuid not null references public.dt01_dm_messages(id) on delete cascade,
 reason text not null default 'Unangemessene Nachricht' check(length(reason) between 3 and 280),
 created_at timestamptz not null default now(), unique(reporter_id,message_id)
);

alter table public.dt01_market_listings enable row level security;
alter table public.dt01_dm_blocks enable row level security;
alter table public.dt01_dm_messages enable row level security;
alter table public.dt01_dm_reports enable row level security;
revoke all on public.dt01_market_listings,public.dt01_dm_blocks,public.dt01_dm_messages,public.dt01_dm_reports from anon;
grant select,insert,update,delete on public.dt01_market_listings to authenticated;
grant select,insert,delete on public.dt01_dm_blocks to authenticated;
grant select,insert,update on public.dt01_dm_messages to authenticated;
grant insert on public.dt01_dm_reports to authenticated;
create policy market_read on public.dt01_market_listings for select to authenticated using(true);
create policy market_add on public.dt01_market_listings for insert to authenticated with check(user_id=(select auth.uid()));
create policy market_edit on public.dt01_market_listings for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy market_delete on public.dt01_market_listings for delete to authenticated using(user_id=(select auth.uid()));
create policy dm_block_read on public.dt01_dm_blocks for select to authenticated using(blocker_id=(select auth.uid()) or blocked_id=(select auth.uid()));
create policy dm_block_add on public.dt01_dm_blocks for insert to authenticated with check(blocker_id=(select auth.uid()));
create policy dm_block_del on public.dt01_dm_blocks for delete to authenticated using(blocker_id=(select auth.uid()));
create policy dm_read on public.dt01_dm_messages for select to authenticated using(sender_id=(select auth.uid()) or recipient_id=(select auth.uid()));
create policy dm_send on public.dt01_dm_messages for insert to authenticated with check(
 sender_id=(select auth.uid()) and not exists(select 1 from public.dt01_dm_blocks b where (b.blocker_id=sender_id and b.blocked_id=recipient_id) or (b.blocker_id=recipient_id and b.blocked_id=sender_id))
 and exists(select 1 from public.dt01_member_profiles p where p.user_id=recipient_id)
 and (listing_id is null or exists(select 1 from public.dt01_market_listings l where l.id=listing_id and l.user_id in (sender_id,recipient_id)))
);
create policy dm_mark_read on public.dt01_dm_messages for update to authenticated using(recipient_id=(select auth.uid())) with check(recipient_id=(select auth.uid()));
-- Prevent changes other than marking read via DB trigger (RLS alone cannot protect individual columns).
create or replace function public.dt01_dm_guard_update() returns trigger language plpgsql set search_path='' as $$
begin
 if new.id<>old.id or new.sender_id<>old.sender_id or new.recipient_id<>old.recipient_id or new.body<>old.body or new.created_at<>old.created_at or new.listing_id is distinct from old.listing_id or new.read_at is null or (old.read_at is not null and new.read_at<>old.read_at) then raise exception 'Only marking messages as read is permitted'; end if;
 return new;
end;$$;
drop trigger if exists dt01_dm_guard_update_trigger on public.dt01_dm_messages;
create trigger dt01_dm_guard_update_trigger before update on public.dt01_dm_messages for each row execute function public.dt01_dm_guard_update();
create policy dm_report on public.dt01_dm_reports for insert to authenticated with check(reporter_id=(select auth.uid()) and exists(select 1 from public.dt01_dm_messages m where m.id=message_id and m.recipient_id=(select auth.uid())));
-- Profiles already have authenticated-only RLS in community-profiles-v20.sql.
