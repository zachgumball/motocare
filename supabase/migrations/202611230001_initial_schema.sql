create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.motorcycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  brand text not null,
  model text not null,
  variant text,
  production_year integer check (production_year between 1900 and 2100),
  plate_number text,
  purchase_date date,
  initial_usage_date date,
  initial_kilometers integer not null default 0 check (initial_kilometers >= 0),
  current_kilometers integer not null default 0 check (current_kilometers >= 0),
  manual_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.maintenance_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists public.maintenance_tasks (
  id uuid primary key default gen_random_uuid(),
  source_table text not null check (source_table in ('emissions','general')),
  source_number integer not null,
  name text not null,
  category_id uuid references public.maintenance_categories(id),
  page_reference text not null,
  dealer_required boolean not null default false,
  annual boolean not null default false,
  schedule_kilometers integer[] not null default '{}',
  schedule_months integer[] not null default '{}',
  data jsonb not null default '{}'::jsonb,
  unique(source_table, source_number)
);

create table if not exists public.maintenance_intervals (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.maintenance_tasks(id) on delete cascade,
  work_type text not null,
  description text not null,
  kilometer_interval integer check (kilometer_interval is null or kilometer_interval > 0),
  month_interval integer check (month_interval is null or month_interval > 0),
  year_interval integer check (year_interval is null or year_interval > 0),
  fixed_kilometers integer[] not null default '{}',
  indicator text check (indicator is null or indicator in ('oil','belt')),
  first_at_kilometer integer check (first_at_kilometer is null or first_at_kilometer >= 0),
  repeat_after_kilometer integer check (repeat_after_kilometer is null or repeat_after_kilometer >= 0),
  dealer_required boolean not null default false,
  notes text
);

create table if not exists public.maintenance_records (
  id uuid primary key default gen_random_uuid(),
  motorcycle_id uuid not null references public.motorcycles(id) on delete cascade,
  task_id uuid not null references public.maintenance_tasks(id),
  interval_id uuid references public.maintenance_intervals(id),
  service_date date not null,
  kilometers integer not null check (kilometers >= 0),
  work_description text not null,
  work_type text not null,
  cost numeric(14,2) check (cost is null or cost >= 0),
  workshop text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.odometer_records (
  id uuid primary key default gen_random_uuid(),
  motorcycle_id uuid not null references public.motorcycles(id) on delete cascade,
  previous_kilometers integer not null check (previous_kilometers >= 0),
  kilometers integer not null check (kilometers >= 0),
  recorded_at timestamptz not null default now(),
  correction boolean not null default false,
  reason text
);

create table if not exists public.maintenance_reminders (
  id uuid primary key default gen_random_uuid(),
  motorcycle_id uuid not null references public.motorcycles(id) on delete cascade,
  task_id uuid not null references public.maintenance_tasks(id),
  status text not null check (status in ('Normal','Upcoming','Due','Overdue','Completed','Needs Attention')),
  reason text,
  next_kilometers integer,
  next_date date,
  updated_at timestamptz not null default now(),
  unique(motorcycle_id, task_id)
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  motorcycle_id uuid references public.motorcycles(id) on delete cascade,
  maintenance_record_id uuid references public.maintenance_records(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.motorcycles enable row level security;
alter table public.maintenance_records enable row level security;
alter table public.odometer_records enable row level security;
alter table public.maintenance_reminders enable row level security;
alter table public.documents enable row level security;

create policy "Users manage own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users manage own motorcycles" on public.motorcycles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own maintenance records" on public.maintenance_records
  for all using (exists (
    select 1 from public.motorcycles m
    where m.id = motorcycle_id and m.user_id = auth.uid()
  )) with check (exists (
    select 1 from public.motorcycles m
    where m.id = motorcycle_id and m.user_id = auth.uid()
  ));

create policy "Users manage own odometer records" on public.odometer_records
  for all using (exists (
    select 1 from public.motorcycles m
    where m.id = motorcycle_id and m.user_id = auth.uid()
  )) with check (exists (
    select 1 from public.motorcycles m
    where m.id = motorcycle_id and m.user_id = auth.uid()
  ));

create policy "Users manage own reminders" on public.maintenance_reminders
  for all using (exists (
    select 1 from public.motorcycles m
    where m.id = motorcycle_id and m.user_id = auth.uid()
  )) with check (exists (
    select 1 from public.motorcycles m
    where m.id = motorcycle_id and m.user_id = auth.uid()
  ));

create policy "Users manage own documents" on public.documents
  for all using (
    exists (select 1 from public.motorcycles m where m.id = motorcycle_id and m.user_id = auth.uid())
    or exists (select 1 from public.maintenance_records r join public.motorcycles m on m.id=r.motorcycle_id
      where r.id=maintenance_record_id and m.user_id=auth.uid())
  ) with check (
    exists (select 1 from public.motorcycles m where m.id = motorcycle_id and m.user_id = auth.uid())
  );
