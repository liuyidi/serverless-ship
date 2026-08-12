alter table public.releases
  add column if not exists channel text;

create or replace view public.deployments_dashboard as
select
  r.id,
  r.project_id,
  p.slug as project_slug,
  p.name as project_name,
  p.repository,
  r.version,
  r.tag,
  r.channel,
  r.release_url,
  r.workflow_url,
  r.status as release_status,
  r.created_at,
  r.updated_at,
  d.status as delivery_status,
  d.error_message as delivery_error_message,
  d.sent_at as delivery_sent_at,
  d.created_at as delivery_created_at
from public.releases r
join public.projects p on p.id = r.project_id
left join lateral (
  select
    deliveries.status,
    deliveries.error_message,
    deliveries.sent_at,
    deliveries.created_at
  from public.deliveries deliveries
  where deliveries.release_id = r.id
  order by deliveries.created_at desc
  limit 1
) d on true;
