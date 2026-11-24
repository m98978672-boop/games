-- Completely separate from youtube_bot_tokens and youtube_bot_oauth_states.
-- No client role may read OAuth material or initiate a database operation.
create table if not exists public.youtube_comments_oauth_states (
  state_hash text primary key check (state_hash ~ '^[0-9a-f]{64}$'),
  verifier text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists youtube_comments_oauth_states_expiry_idx on public.youtube_comments_oauth_states (expires_at);
create table if not exists public.youtube_comments_tokens (
  slot text primary key check (slot = 'comments-owner'),
  channel_id text not null check (channel_id ~ '^UC[A-Za-z0-9_-]{22}$'),
  token_cipher text not null,
  token_iv text not null,
  updated_at timestamptz not null default now()
);
alter table public.youtube_comments_oauth_states enable row level security;
alter table public.youtube_comments_tokens enable row level security;
revoke all on public.youtube_comments_oauth_states from public, anon, authenticated;
revoke all on public.youtube_comments_tokens from public, anon, authenticated;
grant all on public.youtube_comments_oauth_states to service_role;
grant all on public.youtube_comments_tokens to service_role;
