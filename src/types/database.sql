------------------------------------------
-- EXTENSIONS
------------------------------------------
create extension if not exists "uuid-ossp";

------------------------------------------
-- ENUMS
------------------------------------------
create type user_role as enum (
  'admin',
  'basic',
  'sponsor',
  'doctor',
  'manager'
);

create type gender_type as enum (
  'male',
  'female',
  'other'
);

create type theme_type as enum (
  'science',
  'technology',
  'engineering',
  'medicine'
);

create type abstract_type as enum (
  'poster',
  'oral'
);

create type abstract_status as enum (
  'submitted',
  'reviewing',
  'approved',
  'rejected'
);

create type congress_type as enum (
  'in-person',
  'virtual',
  'hybrid'
);

create type activity_role as enum (
  'speaker',
  'moderator'
);

create type payment_type as enum (
  'online',
  'in-person'
);

-- New enumerations
create type activity_type as enum (
  'atelier',
  'wetlab',
  'cour',
  'lunch-symposium'
);

create type masterclass_role as enum (
  'moderator',
  'orateur'
);

create type conference_role as enum (
  'moderator',
  'orateur'
);

create type segment_role as enum (
  'moderator',
  'orateur'
);

------------------------------------------
-- TABLES
------------------------------------------

------------------------------------------
-- Base Tables
------------------------------------------
create table addresses (
  id uuid primary key default uuid_generate_v4(),
  street text not null,
  number text,
  city text not null,
  country text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table buildings (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address_id uuid references addresses(id)
    on update cascade
    on delete set null,
  latitude numeric,
  longitude numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table rooms (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  building_id uuid references buildings(id)
    on update cascade
    on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

------------------------------------------
-- User Management
------------------------------------------
create table users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  password text not null,
  role user_role not null default 'basic',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id)
    on update cascade
    on delete cascade,
  name text not null,
  surname text not null,
  profile_picture text,
  phone text,
  address_id uuid references addresses(id)
    on update cascade
    on delete set null,
  gender gender_type not null,
  status text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table professional_infos (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid references accounts(id)
    on update cascade
    on delete cascade,
  profession text not null,
  status text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

------------------------------------------
-- Congress Management
------------------------------------------
create table congresses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  start_date timestamptz not null,
  end_date timestamptz not null,
  location_id uuid references buildings(id)
    on update cascade
    on delete set null,
  accommodation_id uuid references buildings(id)
    on update cascade
    on delete set null,
  program_file text,
  site_plan text,
  banner text,
  images text[],
  webinars text[],
  state integer not null,
  abstract_form boolean default false,
  sponsor_selection boolean default false,
  registration boolean default false,
  congress_type congress_type not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

------------------------------------------
-- Abstract Management
------------------------------------------
create table abstracts (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid references accounts(id)
    on update cascade
    on delete cascade,
  congress_id uuid references congresses(id)
    on update cascade
    on delete cascade,
  name text not null,
  surname text not null,
  email text not null,
  phone text,
  co_authors text[],
  theme theme_type not null,
  type abstract_type not null,
  title text not null,
  introduction text not null,
  materials text not null,
  results text not null,
  discussion text not null,
  conclusion text not null,
  status abstract_status not null default 'submitted',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

------------------------------------------
-- Activity Management
------------------------------------------
create table activities (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  start_date timestamptz not null,
  end_date timestamptz not null,
  room_id uuid references rooms(id)
    on update cascade
    on delete set null,
  price numeric not null default 0,
  -- Newly added column:
  type activity_type not null default 'atelier',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table account_activities (
  account_id uuid references accounts(id)
    on update cascade
    on delete cascade,
  activity_id uuid references activities(id)
    on update cascade
    on delete cascade,
  role activity_role not null,
  primary key (account_id, activity_id, role)
);

------------------------------------------
-- Masterclasses
-- (Similar to Activities but without type)
------------------------------------------
create table masterclasses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  -- Timestamps can be undetermined (NULLable)
  start_date timestamptz,
  end_date timestamptz,
  room_id uuid references rooms(id)
    on update cascade
    on delete set null,
  price numeric not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table account_masterclasses (
  account_id uuid references accounts(id)
    on update cascade
    on delete cascade,
  masterclass_id uuid references masterclasses(id)
    on update cascade
    on delete cascade,
  role masterclass_role not null,
  primary key (account_id, masterclass_id, role)
);

------------------------------------------
-- Segments (Linked to Masterclasses)
------------------------------------------
create table segments (
  id uuid primary key default uuid_generate_v4(),
  masterclass_id uuid references masterclasses(id)
    on update cascade
    on delete cascade,
  title text not null,
  description text,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table account_segments (
  account_id uuid references accounts(id)
    on update cascade
    on delete cascade,
  segment_id uuid references segments(id)
    on update cascade
    on delete cascade,
  role segment_role not null,
  primary key (account_id, segment_id, role)
);

------------------------------------------
-- Conferences (Linked to Congresses)
------------------------------------------
create table conferences (
  id uuid primary key default uuid_generate_v4(),
  congress_id uuid references congresses(id)
    on update cascade
    on delete cascade,
  title text not null,
  description text,
  session text,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table account_conferences (
  account_id uuid references accounts(id)
    on update cascade
    on delete cascade,
  conference_id uuid references conferences(id)
    on update cascade
    on delete cascade,
  role conference_role not null,
  primary key (account_id, conference_id, role)
);

------------------------------------------
-- Organizations and Sponsors
------------------------------------------
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  website text,
  logo text,
  address_id uuid references addresses(id)
    on update cascade
    on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table sponsors (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid references accounts(id)
    on update cascade
    on delete cascade,
  organization_id uuid references organizations(id)
    on update cascade
    on delete cascade,
  congress_id uuid references congresses(id)
    on update cascade
    on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

------------------------------------------
-- Registration and Payment
------------------------------------------
create table inscriptions (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid references accounts(id)
    on update cascade
    on delete cascade,
  congress_id uuid references congresses(id)
    on update cascade
    on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table inscription_activities (
  inscription_id uuid references inscriptions(id)
    on update cascade
    on delete cascade,
  activity_id uuid references activities(id)
    on update cascade
    on delete cascade,
  primary key (inscription_id, activity_id)
);

create table invoices (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid references accounts(id)
    on update cascade
    on delete cascade,
  inscription_id uuid references inscriptions(id)
    on update cascade
    on delete cascade,
  amount numeric not null,
  paid boolean default false,
  payment_type payment_type not null,
  caisse_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table invoice_activities (
  invoice_id uuid references invoices(id)
    on update cascade
    on delete cascade,
  activity_id uuid references activities(id)
    on update cascade
    on delete cascade,
  primary key (invoice_id, activity_id)
);

CREATE TABLE stand (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    congress_id UUID NOT NULL REFERENCES congresses(id) ON UPDATE CASCADE ON DELETE CASCADE,
    sponsor_id UUID NULL REFERENCES sponsors(id) ON UPDATE CASCADE ON DELETE SET NULL,
    number INTEGER NOT NULL,
    price NUMERIC NOT NULL,
    length NUMERIC NOT NULL,
    width NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- ✅ Changed to UUID
    title VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    image VARCHAR(255) NOT NULL,
    call_to_action TEXT NULL,
    call_to_action_url VARCHAR(2083) NULL,
    likes_count INT DEFAULT 0, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL -- ✅ Soft delete column (NULL = not deleted)

);

CREATE TABLE post_likes (
    id SERIAL PRIMARY KEY,
    post_id UUID NOT NULL, -- ✅ Changed to UUID to match posts.id
    user_id UUID NOT NULL, -- ✅ Changed to UUID to match users.id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (post_id, user_id), -- Prevents duplicate likes by the same user
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

------------------------------------------
-- TRIGGERS
------------------------------------------
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

-- Create update trigger for all relevant tables
create trigger update_addresses_updated_at
  before update on addresses
  for each row execute procedure update_updated_at_column();

create trigger update_buildings_updated_at
  before update on buildings
  for each row execute procedure update_updated_at_column();

create trigger update_rooms_updated_at
  before update on rooms
  for each row execute procedure update_updated_at_column();

create trigger update_users_updated_at
  before update on users
  for each row execute procedure update_updated_at_column();

create trigger update_accounts_updated_at
  before update on accounts
  for each row execute procedure update_updated_at_column();

create trigger update_professional_infos_updated_at
  before update on professional_infos
  for each row execute procedure update_updated_at_column();

create trigger update_congresses_updated_at
  before update on congresses
  for each row execute procedure update_updated_at_column();

create trigger update_abstracts_updated_at
  before update on abstracts
  for each row execute procedure update_updated_at_column();

create trigger update_activities_updated_at
  before update on activities
  for each row execute procedure update_updated_at_column();

create trigger update_organizations_updated_at
  before update on organizations
  for each row execute procedure update_updated_at_column();

create trigger update_sponsors_updated_at
  before update on sponsors
  for each row execute procedure update_updated_at_column();

create trigger update_inscriptions_updated_at
  before update on inscriptions
  for each row execute procedure update_updated_at_column();

create trigger update_invoices_updated_at
  before update on invoices
  for each row execute procedure update_updated_at_column();

-- New triggers for the newly added tables
create trigger update_masterclasses_updated_at
  before update on masterclasses
  for each row execute procedure update_updated_at_column();

create trigger update_account_masterclasses_updated_at
  before update on account_masterclasses
  for each row execute procedure update_updated_at_column();

create trigger update_segments_updated_at
  before update on segments
  for each row execute procedure update_updated_at_column();

create trigger update_account_segments_updated_at
  before update on account_segments
  for each row execute procedure update_updated_at_column();

create trigger update_conferences_updated_at
  before update on conferences
  for each row execute procedure update_updated_at_column();

create trigger update_account_conferences_updated_at
  before update on account_conferences
  for each row execute procedure update_updated_at_column();
