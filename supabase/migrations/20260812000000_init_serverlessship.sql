create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  repository text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.releases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  version text not null,
  tag text,
  release_url text,
  workflow_url text,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, tag)
);

create index if not exists releases_project_id_idx on public.releases (project_id);

create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  release_id uuid not null references public.releases(id) on delete cascade,
  status text not null,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists deliveries_release_id_idx on public.deliveries (release_id);
