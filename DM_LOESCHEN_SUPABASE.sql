-- DT-01: each conversation participant may hide their own copy of a DM.
-- Run once in Supabase SQL Editor, after marketplace-v20.sql. Existing messages are preserved.
alter table public.dt01_dm_messages
  add column if not exists hidden_for_sender_at timestamptz,
  add column if not exists hidden_for_recipient_at timestamptz;

grant select,insert,update on public.dt01_dm_messages to authenticated;

drop policy if exists dm_mark_read on public.dt01_dm_messages;
drop policy if exists dm_participant_update on public.dt01_dm_messages;
create policy dm_participant_update on public.dt01_dm_messages
 for update to authenticated
 using (sender_id=(select auth.uid()) or recipient_id=(select auth.uid()))
 with check (sender_id=(select auth.uid()) or recipient_id=(select auth.uid()));

-- Supabase trigger validates changes field-by-field to prohibit modifying message contents,
-- clearing read flags, or hiding messages for someone else.
create or replace function public.dt01_dm_guard_update()
returns trigger language plpgsql set search_path = '' as $$
declare actor uuid := (select auth.uid());
begin
 if actor is null or actor not in (old.sender_id,old.recipient_id) then
   raise exception 'Not a participant';
 end if;
 if new.id is distinct from old.id or new.sender_id is distinct from old.sender_id
    or new.recipient_id is distinct from old.recipient_id
    or new.listing_id is distinct from old.listing_id
    or new.body is distinct from old.body or new.created_at is distinct from old.created_at then
   raise exception 'Changing message contents is not permitted';
 end if;
 if actor<>old.recipient_id and new.read_at is distinct from old.read_at then
   raise exception 'Only the recipient may mark a message read';
 end if;
 if old.read_at is not null and new.read_at is distinct from old.read_at then
   raise exception 'Read flags cannot be changed once set';
 end if;
 if actor<>old.sender_id and new.hidden_for_sender_at is distinct from old.hidden_for_sender_at then
   raise exception 'Only sender may hide own message copy';
 end if;
 if actor<>old.recipient_id and new.hidden_for_recipient_at is distinct from old.hidden_for_recipient_at then
   raise exception 'Only recipient may hide own message copy';
 end if;
 if old.hidden_for_sender_at is not null and new.hidden_for_sender_at is distinct from old.hidden_for_sender_at then
   raise exception 'Hidden messages cannot be unhidden';
 end if;
 if old.hidden_for_recipient_at is not null and new.hidden_for_recipient_at is distinct from old.hidden_for_recipient_at then
   raise exception 'Hidden messages cannot be unhidden';
 end if;
 return new;
end; $$;
-- Existing dt01_dm_guard_update_trigger automatically uses the updated function.
