-- Durable fail-closed reply reservations for one shared cloud worker.
-- Attempts with unknown results remain reserved and must not be retried blindly.
create table if not exists public.youtube_comments_reply_attempts (
  channel_id text not null check (channel_id ~ '^UC[A-Za-z0-9_-]{22}$'),
  parent_id text not null check (length(parent_id) between 1 and 200),
  utc_day date not null,
  state text not null default 'sending' check (state in ('sending', 'sent')),
  reply_id text,
  created_at timestamptz not null default now(),
  primary key (channel_id, parent_id)
);
alter table public.youtube_comments_reply_attempts enable row level security;
revoke all on public.youtube_comments_reply_attempts from public, anon, authenticated;
grant all on public.youtube_comments_reply_attempts to service_role;

-- Transaction-scoped lock serializes count-and-reserve for a single channel.
-- The database uses its own UTC clock, not a runner-supplied date.
create or replace function public.youtube_comments_reserve_reply(p_channel text, p_parent text)
returns boolean
language plpgsql security invoker set search_path = ''
as $$
declare n integer;
begin
  if p_channel is null or p_channel !~ '^UC[A-Za-z0-9_-]{22}$' or p_parent is null or length(p_parent) not between 1 and 200 then
    raise exception 'invalid reply reservation';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('youtube-comments:' || p_channel, 0));
  if exists (select 1 from public.youtube_comments_reply_attempts where channel_id = p_channel and parent_id = p_parent) then
    return false;
  end if;
  select count(*) into n from public.youtube_comments_reply_attempts
    where channel_id = p_channel and utc_day = (pg_catalog.now() at time zone 'UTC')::date;
  if n >= 20 then return false; end if;
  insert into public.youtube_comments_reply_attempts (channel_id, parent_id, utc_day)
    values (p_channel, p_parent, (pg_catalog.now() at time zone 'UTC')::date);
  return true;
end;
$$;
revoke all on function public.youtube_comments_reserve_reply(text, text) from public, anon, authenticated;
grant execute on function public.youtube_comments_reserve_reply(text, text) to service_role;
