-- Delta Tigre — precios por día de la semana
-- Ejecutar una vez en Supabase → SQL Editor → New query

alter table properties add column if not exists price_mon_thu int not null default 0;
alter table properties add column if not exists price_fri     int not null default 0;
alter table properties add column if not exists price_sat_sun int not null default 0;

-- arranca todo con el precio base actual
update properties
   set price_mon_thu = coalesce(nullif(price_mon_thu, 0), base_price),
       price_fri     = coalesce(nullif(price_fri, 0),     base_price),
       price_sat_sun = coalesce(nullif(price_sat_sun, 0), base_price);
