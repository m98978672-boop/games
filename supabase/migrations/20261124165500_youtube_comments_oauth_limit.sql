-- Bound uncompleted public OAuth requests, in one database transaction.
-- This limits storage growth, not denial-of-service by a determined attacker;
-- production should also use upstream IP-based rate limiting.
create or replace function public.youtube_comments_begin_oauth(p_hash text, p_verifier text, p_expires timestamptz)
returns boolean
language plpgsql security invoker set search_path = ''
as $$
declare n integer;
begin
  if p_hash is null or p_hash !~ '^[0-9a-f]{64}$' or p_verifier is null or p_verifier !~ '^[A-Za-z0-9_-]{43}$' or
     p_expires is null or p_expires <= pg_catalog.now() or p_expires > pg_catalog.now() + interval '11 minutes' then
    raise exception 'invalid oauth state';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('youtube-comments-oauth-start', 0));
  delete from public.youtube_comments_oauth_states where expires_at < pg_catalog.now();
  select count(*) into n from public.youtube_comments_oauth_states;
  if n >= 20 then return false; end if;
  insert into public.youtube_comments_oauth_states (state_hash, verifier, expires_at) values (p_hash, p_verifier, p_expires);
  return true;
end;
$$;
revoke all on function public.youtube_comments_begin_oauth(text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.youtube_comments_begin_oauth(text, text, timestamptz) to service_role;
