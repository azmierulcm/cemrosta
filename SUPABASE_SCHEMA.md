# Cemrosta Supabase Architecture

## 1. Profiles Table
This table extends the native `auth.users` with crew-specific metadata.
```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  rank text, -- e.g., 'Senior First Officer'
  airline text, -- e.g., 'Malaysia Airlines'
  fleet text, -- e.g., 'A350'
  bio text,
  avatar_url text,
  gallery_urls text[], -- Array of 5 photo URLs for the Bento Grid
  verified_at timestamp with time zone, -- set on first successful roster parse
  active_listings_count integer default 0, -- max 5
  created_at timestamp with time zone default now()
);
```

## 2. Marketplace Listings Table
Stores all gear ads created by the crew.
```sql
create table marketplace_listings (
  id uuid default uuid_generate_v4() primary key,
  seller_id uuid references profiles(id) not null,
  title text not null,
  description text,
  price numeric not null,
  currency text default 'MYR',
  category text, -- 'Headsets', 'Luggage', 'Watches', 'Uniforms', 'Manuals', 'Other'
  condition text, -- 'New', 'Lightly used', 'Well used', 'For parts'
  image_urls text[], -- Array of product image URLs
  status text default 'available', -- 'available', 'sold', 'hidden', 'expired'
  expires_at timestamp with time zone default (now() + interval '30 days'),
  reports_count integer default 0,
  contact_preference text default 'WhatsApp', -- 'WhatsApp', 'Email', 'In-app'
  created_at timestamp with time zone default now()
);

create table marketplace_reports (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references marketplace_listings(id) on delete cascade not null,
  reporter_id uuid references profiles(id) not null,
  reason text not null, -- 'spam', 'fraud', 'inappropriate', 'other'
  details text,
  created_at timestamp with time zone default now()
);

create table waitlist_entries (
  id uuid default uuid_generate_v4() primary key,
  email text not null,
  airline_name text not null,
  created_at timestamp with time zone default now()
);

-- Functions & Triggers
create or replace function increment_listing_count(user_id uuid)
returns void as $$
begin
  update profiles
  set active_listings_count = active_listings_count + 1
  where id = user_id;
end;
$$ language plpgsql;
```

## 3. Storage Buckets
Configure these two buckets in your Supabase Dashboard:
1. **`profile-photos`**: 
   - Public access: Yes
   - Folder structure suggested: `[user_id]/gallery/[photo_name].jpg`
2. **`marketplace-images`**:
   - Public access: Yes
   - Folder structure suggested: `[listing_id]/[image_name].jpg`
3. **`roster-files`**:
   - Public access: No (Authenticated users only)
   - Folder structure: `[user_id]/rosters/[year]-[month].ics`

## 4. Digital Passport Tables

```sql
-- Crew Ranks: Captain, First Officer, Second Officer, Cadet, Inflight Supervisor, Senior Cabin Crew, Cabin Crew
create table crew_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  display_name text not null,
  rank text not null,
  base_iata text not null default 'KUL',
  airline_code text not null default 'MH',
  aircraft_types text[] default '{}',
  handle text unique not null,
  avatar_url text,
  hire_date date,
  birthday date,
  privacy_mode text not null default 'crew', -- 'public', 'crew', 'family', 'anonymous'
  created_at timestamp with time zone default now()
);

create table airports (
  iata text primary key,
  icao text unique not null,
  name text not null,
  city text not null,
  country text not null,
  country_code text not null,
  continent text not null, -- 'AS', 'EU', 'NA', 'SA', 'AF', 'OC', 'AN'
  lat numeric not null,
  lng numeric not null,
  elevation_ft integer,
  is_hot_and_high boolean default false,
  is_below_sea_level boolean default false,
  is_polar boolean default false,
  rarity_tier integer default 1 -- 1-5
);

create table flights (
  id uuid default uuid_generate_v4() primary key,
  crew_id uuid references crew_profiles(id) on delete cascade not null,
  flight_date date not null,
  flight_number text not null,
  origin_iata text references airports(iata) not null,
  destination_iata text references airports(iata) not null,
  std_utc timestamp with time zone not null,
  sta_utc timestamp with time zone not null,
  block_minutes integer not null,
  flight_minutes integer,
  distance_km numeric not null,
  aircraft_type text,
  duty_type text not null default 'flight', -- 'flight', 'standby', 'sim', etc.
  position text, -- 'P1', 'P2', 'SO', 'CC'
  is_pic boolean default false,
  is_night boolean default false,
  crosses_equator boolean default false,
  crosses_polar boolean default false,
  crosses_arctic_circle boolean default false,
  crosses_antarctic_circle boolean default false,
  crosses_idl boolean default false,
  witnessed_sunrise boolean default false,
  witnessed_sunset boolean default false,
  created_at timestamp with time zone default now()
);

create table achievements (
  id uuid default uuid_generate_v4() primary key,
  crew_id uuid references crew_profiles(id) on delete cascade not null,
  key text not null, -- matches AchievementDefinition.key
  earned_at timestamp with time zone default now(),
  flight_id uuid references flights(id),
  metadata jsonb default '{}',
  unique(crew_id, key)
);

create table crew_stats (
  crew_id uuid references crew_profiles(id) on delete cascade primary key,
  total_km numeric default 0,
  total_sectors integer default 0,
  total_block_minutes integer default 0,
  total_flight_minutes integer default 0,
  unique_destinations integer default 0,
  unique_countries integer default 0,
  unique_continents integer default 0,
  unique_aircraft_types integer default 0,
  unique_crew_flown_with integer default 0,
  sunrises_witnessed integer default 0,
  sunsets_witnessed integer default 0,
  polar_crossings integer default 0,
  equator_crossings integer default 0,
  idl_crossings integer default 0,
  ytd_km numeric default 0,
  ytd_sectors integer default 0,
  ytd_block_minutes integer default 0,
  ytd_unique_destinations integer default 0,
  ytd_unique_new_destinations integer default 0,
  ytd_sunrises integer default 0,
  top_route_pair text,
  top_route_count integer default 0,
  longest_sector_id uuid references flights(id),
  updated_at timestamp with time zone default now()
);

create table share_links (
  id text primary key, -- nanoid
  crew_id uuid references crew_profiles(id) on delete cascade not null,
  card_type text not null, -- 'year-in-air', 'monthly', 'rare', etc.
  metadata jsonb default '{}',
  expires_at timestamp with time zone,
  created_at timestamp with time zone default now()
);
```

## 5. RLS Policies for Passport

```sql
alter table crew_profiles enable row level security;
alter table flights enable row level security;
alter table achievements enable row level security;
alter table crew_stats enable row level security;
alter table share_links enable row level security;

-- Profiles: Public can view depending on privacy_mode (simplified for now)
create policy "Profiles are viewable based on privacy mode" 
on crew_profiles for select 
using (true);

-- Users can manage their own profile
create policy "Users can manage their own crew profile"
on crew_profiles for all
using (auth.uid() = user_id);

-- Flights: Owner can manage
create policy "Users can manage their own flights"
on flights for all
using (crew_id in (select id from crew_profiles where user_id = auth.uid()));

-- Stats: Public can view
create policy "Stats are public"
on crew_stats for select
using (true);
```
