-- Delta Tigre — precio por cantidad de huéspedes
-- Ejecutar una vez en Supabase → SQL Editor → New query

create table if not exists guest_prices (
  id text primary key,
  property_id text not null references properties(id) on delete cascade,
  guests int not null,
  price_mon_thu int not null default 0,
  price_fri int not null default 0,
  price_sat_sun int not null default 0,
  unique (property_id, guests)
);

create index if not exists idx_gp_prop on guest_prices(property_id);
