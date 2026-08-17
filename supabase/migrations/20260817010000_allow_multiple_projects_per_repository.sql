alter table public.projects
  drop constraint if exists projects_repository_key;

create index if not exists projects_repository_idx
  on public.projects (repository);
