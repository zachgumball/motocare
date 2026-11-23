alter table public.maintenance_categories enable row level security;
alter table public.maintenance_tasks enable row level security;
alter table public.maintenance_intervals enable row level security;

drop policy if exists "Public can read maintenance categories" on public.maintenance_categories;
create policy "Public can read maintenance categories"
  on public.maintenance_categories
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read maintenance tasks" on public.maintenance_tasks;
create policy "Public can read maintenance tasks"
  on public.maintenance_tasks
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read maintenance intervals" on public.maintenance_intervals;
create policy "Public can read maintenance intervals"
  on public.maintenance_intervals
  for select
  to anon, authenticated
  using (true);

grant select on public.maintenance_categories to anon, authenticated;
grant select on public.maintenance_tasks to anon, authenticated;
grant select on public.maintenance_intervals to anon, authenticated;
