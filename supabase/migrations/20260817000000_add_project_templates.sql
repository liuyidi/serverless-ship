alter table public.projects
  add column if not exists template_config jsonb not null default '{"preset":"mono","title":"","signature":"ServerlessShip","showVersion":true,"showChannel":true,"showLinks":true}'::jsonb,
  add column if not exists notify_token_hash text,
  add column if not exists notify_token_last4 text;

create unique index if not exists projects_notify_token_hash_idx
  on public.projects (notify_token_hash)
  where notify_token_hash is not null;
