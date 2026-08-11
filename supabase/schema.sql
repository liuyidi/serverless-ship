create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  repository text not null,
  created_at timestamptz not null default now()
);

create table if not exists notification_targets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  channel text not null check (channel in ('feishu')),
  target_type text not null check (target_type in ('chat', 'user')),
  target_key text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists releases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  version text not null,
  tag text,
  release_url text,
  workflow_url text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists deliveries (
  id uuid primary key default gen_random_uuid(),
  release_id uuid not null references releases(id) on delete cascade,
  target_id uuid references notification_targets(id) on delete set null,
  status text not null default 'pending',
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists integration_tokens (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('feishu')),
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
