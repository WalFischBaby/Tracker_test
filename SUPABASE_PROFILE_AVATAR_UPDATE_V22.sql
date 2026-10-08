-- V2.2 Avatar-Erweiterung. Im bestehenden Supabase SQL Editor einmal ausführen.
-- Bestehende Profildaten bleiben erhalten.
alter table public.player_profiles drop constraint if exists player_profiles_avatar_allowed;
alter table public.player_profiles add constraint player_profiles_avatar_allowed
check (avatar in ('🤖','🚀','🌌','⭐','🐋') or avatar ~ '^droid:[A-Za-z0-9_-]+[.]webp$');
