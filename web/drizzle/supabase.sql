-- Delta Tigre — esquema para Supabase (Postgres)
-- Pegar y ejecutar en Supabase → SQL Editor → New query

create table if not exists users (
  id text primary key, name text not null, email text not null unique,
  phone text not null default '', password_hash text not null,
  role text not null default 'guest', created_at bigint not null
);

create table if not exists properties (
  id text primary key, slug text not null unique, name text not null,
  kind text not null default 'Casa', tagline text not null default '',
  description text not null default '', address text not null default '',
  lat double precision not null default -34.418, lng double precision not null default -58.579,
  size_m2 int not null default 0, bedrooms int not null default 1, bathrooms int not null default 1,
  beds int not null default 1, max_guests int not null default 2,
  base_price int not null default 0,
  price_mon_thu int not null default 0, price_fri int not null default 0, price_sat_sun int not null default 0, high_price int not null default 0, cleaning_fee int not null default 0,
  min_nights int not null default 2, currency text not null default 'ARS',
  rating double precision not null default 0, reviews int not null default 0,
  check_in text not null default '10:00 - 18:00', check_out text not null default '08:00 - 18:00',
  active int not null default 1, sort_order int not null default 0
);

create table if not exists images (
  id text primary key, property_id text not null references properties(id) on delete cascade,
  url text not null, alt text not null default '', sort_order int not null default 0
);

create table if not exists amenities (
  id text primary key, property_id text not null references properties(id) on delete cascade,
  category text not null, label text not null, icon text not null default 'check',
  featured int not null default 0, sort_order int not null default 0
);

create table if not exists rules (
  id text primary key, property_id text not null references properties(id) on delete cascade,
  label text not null, value text not null, icon text not null default 'info', sort_order int not null default 0
);

create table if not exists nearby (
  id text primary key, category text not null, name text not null,
  distance text not null default '', sort_order int not null default 0
);

create table if not exists activities (
  id text primary key, title text not null, summary text not null default '',
  body text not null default '', image text not null default '',
  tag text not null default '', sort_order int not null default 0
);

create table if not exists bookings (
  id text primary key, code text not null unique,
  property_id text not null references properties(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  guest_name text not null, guest_email text not null, guest_phone text not null default '',
  check_in text not null, check_out text not null, nights int not null default 1,
  adults int not null default 1, children int not null default 0,
  message text not null default '', estimate int not null default 0,
  status text not null default 'pendiente', owner_reply text not null default '',
  created_at bigint not null, updated_at bigint not null
);

create table if not exists blocks (
  id text primary key, property_id text not null references properties(id) on delete cascade,
  from_date text not null, to_date text not null, reason text not null default 'Bloqueo manual'
);

create table if not exists rates (
  id text primary key, property_id text not null references properties(id) on delete cascade,
  day text not null, price int not null, unique (property_id, day)
);

create table if not exists guest_prices (
  id text primary key, property_id text not null references properties(id) on delete cascade,
  guests int not null, price_mon_thu int not null default 0,
  price_fri int not null default 0, price_sat_sun int not null default 0,
  unique (property_id, guests)
);

create table if not exists settings (key text primary key, value text not null default '');

create index if not exists idx_img_prop on images(property_id);
create index if not exists idx_am_prop on amenities(property_id);
create index if not exists idx_bk_prop on bookings(property_id);
create index if not exists idx_bk_user on bookings(user_id);
create index if not exists idx_rates_prop_day on rates(property_id, day);

-- La app usa su propia sesion (cookie JWT httpOnly) y se conecta con la service key
-- desde el servidor, por eso RLS queda deshabilitado en estas tablas.
-- Si en algun momento exponés la anon key al navegador, activá RLS antes.
