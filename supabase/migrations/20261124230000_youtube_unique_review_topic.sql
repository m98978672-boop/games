-- Existing duplicates remain untouched; serialize all future reservations for
-- both lanes with a unique key, including failed/ambiguous upload attempts.
-- Hold a table lock while backfilling so no legacy insert can escape the guard.
lock table public.youtube_bot_autopilot_jobs in share row exclusive mode;

create table public.youtube_bot_review_topics (
  game_id text primary key
);
alter table public.youtube_bot_review_topics enable row level security;
revoke all on public.youtube_bot_review_topics from public, anon, authenticated;
grant select, insert on public.youtube_bot_review_topics to service_role;
insert into public.youtube_bot_review_topics (game_id)
select distinct game_id from public.youtube_bot_autopilot_jobs;

create function public.youtube_bot_guard_review_topic()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  if tg_op = 'UPDATE' then
    if new.game_id is distinct from old.game_id then
      raise exception 'Review topic cannot be changed' using errcode = '23514';
    end if;
    return new;
  end if;
  insert into public.youtube_bot_review_topics (game_id) values (new.game_id);
  return new;
end;
$$;
create trigger youtube_bot_guard_review_topic_before_write
before insert or update of game_id on public.youtube_bot_autopilot_jobs
for each row execute function public.youtube_bot_guard_review_topic();

-- One aggregate result avoids PostgREST's row limit silently truncating history.
-- Refuse to return an incomplete list if the bound is reached.
create function public.youtube_bot_review_topic_history()
returns jsonb language plpgsql stable set search_path = public, pg_temp as $$
declare result jsonb; total bigint;
begin
  select count(*), coalesce(jsonb_agg(game_id order by game_id), '[]'::jsonb)
    into total, result from public.youtube_bot_review_topics;
  if total > 20000 then
    raise exception 'Review topic history exceeds safe bound';
  end if;
  return jsonb_build_object('version', 1, 'game_ids', result);
end;
$$;
revoke all on function public.youtube_bot_review_topic_history() from public, anon, authenticated;
grant execute on function public.youtube_bot_review_topic_history() to service_role;
