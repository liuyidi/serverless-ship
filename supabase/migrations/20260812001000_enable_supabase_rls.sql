alter table public.projects enable row level security;
alter table public.releases enable row level security;
alter table public.deliveries enable row level security;

comment on table public.projects is
  'ServerlessShip project registry. Access is server-side only via the Supabase service role.';
comment on table public.releases is
  'ServerlessShip release history. Access is server-side only via the Supabase service role.';
comment on table public.deliveries is
  'ServerlessShip delivery audit log. Access is server-side only via the Supabase service role.';
