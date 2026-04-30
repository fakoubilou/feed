-- ── RESTAURANTS ──
create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  taux_horaire decimal(5,2) not null default 12.50,
  created_at timestamptz default now()
);

-- ── PROFILES (extends auth.users) ──
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('manager', 'directeur')),
  restaurant_id uuid references restaurants(id) on delete set null,
  nom text
);

-- ── RAZ ENTRIES ──
create table if not exists raz_entries (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  date date not null,
  ca decimal(10,2) not null,
  couverts integer not null,
  staff_hours decimal(6,2) not null default 0,
  offerts decimal(10,2) not null default 0,
  annulations decimal(10,2) not null default 0,
  ouverture text,
  fermeture text,
  note text not null default 'R.a.s',
  created_at timestamptz default now(),
  unique (restaurant_id, date)
);

-- ── STAFF ENTRIES ──
create table if not exists staff_entries (
  id uuid primary key default gen_random_uuid(),
  raz_id uuid not null references raz_entries(id) on delete cascade,
  nom text,
  debut text,
  fin text,
  pause_minutes integer not null default 0,
  duree_minutes integer
);

-- ── SEED: restaurants par défaut ──
insert into restaurants (name, taux_horaire) values
  ('Brasserie Le Zinc', 12.50),
  ('L''Atelier du Chef', 13.00),
  ('Pizzeria Napoli', 12.00)
on conflict do nothing;

-- ── RLS ──
alter table restaurants enable row level security;
alter table profiles enable row level security;
alter table raz_entries enable row level security;
alter table staff_entries enable row level security;

-- Tout le monde peut lire les restaurants (pour le login manager)
create policy "restaurants_read_all" on restaurants for select using (true);

-- Directeur peut tout écrire sur les restaurants
create policy "restaurants_write_directeur" on restaurants for all
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'directeur')
  );

-- Chacun peut lire son propre profil
create policy "profiles_read_own" on profiles for select using (auth.uid() = id);

-- On peut créer son profil à la connexion
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

-- RAZ: directeur lit tout, manager lit son restaurant
create policy "raz_read" on raz_entries for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'directeur')
  or
  exists (select 1 from profiles where id = auth.uid() and restaurant_id = raz_entries.restaurant_id)
);

-- RAZ: manager écrit seulement pour son restaurant
create policy "raz_write_manager" on raz_entries for insert with check (
  exists (select 1 from profiles where id = auth.uid() and restaurant_id = raz_entries.restaurant_id)
);

create policy "raz_update_manager" on raz_entries for update using (
  exists (select 1 from profiles where id = auth.uid() and restaurant_id = raz_entries.restaurant_id)
);

-- Staff entries: suit les droits de la RAZ parente
create policy "staff_read" on staff_entries for select using (
  exists (
    select 1 from raz_entries re
    join profiles p on p.id = auth.uid()
    where re.id = staff_entries.raz_id
      and (p.role = 'directeur' or p.restaurant_id = re.restaurant_id)
  )
);

create policy "staff_write" on staff_entries for insert with check (
  exists (
    select 1 from raz_entries re
    join profiles p on p.id = auth.uid()
    where re.id = staff_entries.raz_id
      and p.restaurant_id = re.restaurant_id
  )
);

-- Fonction appelée automatiquement à la création d'un user
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, role, nom)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'manager'),
    new.raw_user_meta_data->>'nom'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
