-- Preserve atomic deduplication and unknown-outcome reservations, with a higher daily cap.
create or replace function public.youtube_comments_reserve_reply(p_channel text, p_parent text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare n integer;
begin
  if p_channel is null or p_channel !~ '^UC[A-Za-z0-9_-]{22}$' or p_parent is null or length(p_parent) not between 1 and 200 then raise exception 'invalid reply reservation'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('youtube-comments:' || p_channel, 0));
  if exists (select 1 from public.youtube_comments_reply_attempts where channel_id = p_channel and parent_id = p_parent) then return false; end if;
  select count(*) into n from public.youtube_comments_reply_attempts where channel_id = p_channel and utc_day = (pg_catalog.now() at time zone 'UTC')::date;
  if n >= 50 then return false; end if;
  insert into public.youtube_comments_reply_attempts (channel_id, parent_id, utc_day) values (p_channel, p_parent, (pg_catalog.now() at time zone 'UTC')::date);
  return true;
end; $$;
revoke all on function public.youtube_comments_reserve_reply(text, text) from public, anon, authenticated;
grant execute on function public.youtube_comments_reserve_reply(text, text) to service_role;
