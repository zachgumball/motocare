insert into public.maintenance_categories(name) values
  ('Mesin'),('Sistem bahan bakar'),('Sistem pengereman'),('Sistem CVT'),
  ('Kelistrikan'),('Roda dan ban'),('Suspensi'),('Rangka dan kemudi'),
  ('Pelumasan'),('Sistem emisi')
on conflict(name) do nothing;

with source_tasks(source_table, source_number, name, category_name, page_reference, dealer_required, annual, schedule_kilometers, schedule_months, app_id) as (
  values
    ('emissions',1,'Saluran bahan bakar','Sistem bahan bakar','8-2',true,true,array[4000,7000,10000,13000],array[4,7,10,13],'e1-fuel-line'),
    ('emissions',2,'Saringan bahan bakar','Sistem bahan bakar','8-2',true,false,array[12000]::integer[],array[]::integer[],'e2-fuel-filter'),
    ('emissions',3,'Busi','Mesin','8-2',false,false,array[4000,7000,10000,13000],array[4,7,10,13],'e3-spark-plug'),
    ('emissions',4,'Klep','Mesin','8-2',true,false,array[4000,13000],array[4,13],'e4-valve'),
    ('emissions',5,'Fuel injection','Sistem bahan bakar','8-2',true,true,array[4000,7000,10000,13000],array[4,7,10,13],'e5-fuel-injection'),
    ('emissions',6,'Sistem pembuangan','Sistem emisi','8-2',true,true,array[4000,7000,10000,13000],array[4,7,10,13],'e6-exhaust'),
    ('general',1,'Pemeriksaan sistem diagnostik','Mesin','8-3',true,true,array[1000,4000,7000,10000,13000],array[1,4,7,10,13],'g1-diagnostic'),
    ('general',2,'Elemen saringan udara','Mesin','8-3',false,false,array[12000]::integer[],array[]::integer[],'g2-air-filter'),
    ('general',3,'Selang pemeriksa saringan udara','Sistem emisi','8-3',false,true,array[4000,7000,10000,13000],array[4,7,10,13],'g3-air-hose'),
    ('general',4,'Elemen saringan udara wadah V-belt','Sistem CVT','8-3',true,false,array[4000,7000,10000,13000],array[4,7,10,13],'g4-v-belt-filter'),
    ('general',5,'Aki','Kelistrikan','8-3',true,true,array[1000,4000,7000,10000,13000],array[1,4,7,10,13],'g5-battery'),
    ('general',6,'Rem depan','Sistem pengereman','8-3',true,true,array[1000,4000,7000,10000,13000],array[1,4,7,10,13],'g6-front-brake'),
    ('general',7,'Rem belakang','Sistem pengereman','8-3',true,true,array[1000,4000,7000,10000,13000],array[1,4,7,10,13],'g7-rear-brake'),
    ('general',8,'Selang rem','Sistem pengereman','8-4',true,true,array[4000,7000,10000,13000],array[4,7,10,13],'g8-brake-hose'),
    ('general',9,'Minyak rem','Sistem pengereman','8-4',true,false,array[]::integer[],array[]::integer[],'g9-brake-fluid'),
    ('general',10,'Roda','Roda dan ban','8-4',true,true,array[4000,7000,10000,13000],array[4,7,10,13],'g10-wheels'),
    ('general',11,'Ban','Roda dan ban','8-4',true,true,array[1000,4000,7000,10000,13000],array[1,4,7,10,13],'g11-tires'),
    ('general',12,'Bearing roda','Roda dan ban','8-4',true,false,array[4000,7000,10000,13000],array[4,7,10,13],'g12-wheel-bearings'),
    ('general',13,'Bearing kemudi','Rangka dan kemudi','8-4',true,true,array[1000,4000,7000,10000,13000],array[1,4,7,10,13],'g13-steering-bearing'),
    ('general',14,'Part pengunci rangka','Rangka dan kemudi','8-4',true,true,array[1000,4000,7000,10000,13000],array[1,4,7,10,13],'g14-fasteners'),
    ('general',15,'Engsel tuas rem depan','Sistem pengereman','8-4',false,true,array[4000,7000,10000,13000],array[4,7,10,13],'g15-front-lever-hinge'),
    ('general',16,'Engsel tuas rem belakang','Sistem pengereman','8-4',false,true,array[4000,7000,10000,13000],array[4,7,10,13],'g16-rear-lever-hinge'),
    ('general',17,'Standar samping dan standar tengah','Rangka dan kemudi','8-5',false,true,array[4000,7000,10000,13000],array[4,7,10,13],'g17-side-center-stand'),
    ('general',18,'Sidestand switch','Kelistrikan','8-5',true,true,array[1000,4000,7000,10000,13000],array[1,4,7,10,13],'g18-sidestand-switch'),
    ('general',19,'Front fork','Suspensi','8-5',true,false,array[4000,7000,10000,13000],array[4,7,10,13],'g19-front-fork'),
    ('general',20,'Unit shock absorber','Suspensi','8-5',true,false,array[4000,7000,10000,13000],array[4,7,10,13],'g20-shock'),
    ('general',21,'Oli mesin','Pelumasan','8-5',false,false,array[3000]::integer[],array[]::integer[],'g21-engine-oil'),
    ('general',22,'Kawat saringan oli mesin','Pelumasan','8-5',true,false,array[1000,4000,7000,10000,13000],array[1,4,7,10,13],'g22-oil-screen'),
    ('general',23,'Sistem pendinginan','Mesin','8-5',false,true,array[4000,7000,10000,13000],array[4,7,10,13],'g23-cooling'),
    ('general',24,'Oli transmisi akhir','Pelumasan','8-5',false,false,array[1000,12000],array[]::integer[],'g24-final-gear-oil'),
    ('general',25,'V-belt','Sistem CVT','8-5',true,false,array[7000,10000,13000,25000],array[7,10,13],'g25-v-belt'),
    ('general',26,'Sheave sekunder V-belt','Sistem CVT','8-6',true,false,array[12000]::integer[],array[]::integer[],'g26-secondary-sheave'),
    ('general',27,'Sakelar rem depan dan belakang','Sistem pengereman','8-6',true,true,array[1000,4000,7000,10000,13000],array[1,4,7,10,13],'g27-brake-switches'),
    ('general',28,'Komponen yang bergerak dan kabel-kabel','Rangka dan kemudi','8-6',false,true,array[4000,7000,10000,13000],array[4,7,10,13],'g28-moving-cables'),
    ('general',29,'Grip gas','Kelistrikan','8-6',true,true,array[4000,7000,10000,13000],array[4,7,10,13],'g29-throttle-grip'),
    ('general',30,'Lampu, sinyal, dan sakelar','Kelistrikan','8-6',true,true,array[1000,4000,7000,10000,13000],array[1,4,7,10,13],'g30-lights')
)
insert into public.maintenance_tasks(
  source_table, source_number, name, category_id, page_reference,
  dealer_required, annual, schedule_kilometers, schedule_months, data
)
select
  t.source_table, t.source_number, t.name, c.id, t.page_reference,
  t.dealer_required, t.annual, t.schedule_kilometers, t.schedule_months,
  jsonb_build_object('app_id', t.app_id)
from source_tasks t
join public.maintenance_categories c on c.name=t.category_name
on conflict(source_table, source_number) do update set
  name=excluded.name,
  category_id=excluded.category_id,
  page_reference=excluded.page_reference,
  dealer_required=excluded.dealer_required,
  annual=excluded.annual,
  schedule_kilometers=excluded.schedule_kilometers,
  schedule_months=excluded.schedule_months,
  data=excluded.data;
