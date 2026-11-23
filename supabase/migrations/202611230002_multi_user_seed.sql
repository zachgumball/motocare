alter table public.motorcycles add constraint motorcycles_one_profile_per_user unique (user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.maintenance_categories(name) values
  ('Mesin'),('Sistem bahan bakar'),('Sistem pengereman'),('Sistem CVT'),
  ('Kelistrikan'),('Roda dan ban'),('Suspensi'),('Rangka dan kemudi'),
  ('Pelumasan'),('Sistem emisi')
on conflict(name) do nothing;
