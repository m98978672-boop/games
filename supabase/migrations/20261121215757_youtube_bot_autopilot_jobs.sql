create table if not exists public.youtube_bot_autopilot_jobs (
  id uuid primary key,
  game_id text not null,
  title text not null check (char_length(title) between 1 and 100),
  publish_at timestamptz not null,
  made_for_kids boolean not null,
  status text not null check (status in ('processing', 'scheduled', 'failed')),
  video_id text unique,
  watch_url text,
  safe_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (publish_at)
);

create index if not exists youtube_bot_autopilot_jobs_recent_idx
  on public.youtube_bot_autopilot_jobs (created_at desc);

alter table public.youtube_bot_autopilot_jobs enable row level security;
revoke all on public.youtube_bot_autopilot_jobs from anon, authenticated;
grant all on public.youtube_bot_autopilot_jobs to service_role;
