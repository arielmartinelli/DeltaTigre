-- Delta Tigre — tarifas por día
-- Ejecutar una vez en Supabase → SQL Editor → New query

create table if not exists rates (
  id text primary key,
  property_id text not null references properties(id) on delete cascade,
  day text not null,                    -- YYYY-MM-DD
  price int not null,
  unique (property_id, day)
);

create index if not exists idx_rates_prop_day on rates(property_id, day);

-- Las reservas ahora las crea el propietario desde el panel:
-- el email del huésped pasa a ser opcional.
alter table bookings alter column guest_email set default '';
