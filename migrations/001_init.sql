create table if not exists listings (
  id text primary key,
  intent text not null,
  title text not null,
  neighborhood text not null,
  city text not null,
  price_inr bigint not null,
  beds integer not null,
  baths integer not null,
  area_sqft integer not null,
  description text not null,
  image text not null,
  sample boolean not null default false,
  status text not null default 'live',
  sort integer not null default 0,
  owner_sub text,
  owner_name text,
  owner_phone text,
  doc_type text,
  doc_last4 text,
  created_at timestamptz not null default now()
);

create table if not exists saved_homes (
  owner_sub text not null,
  listing_id text not null references listings (id),
  created_at timestamptz not null default now(),
  primary key (owner_sub, listing_id)
);

create table if not exists inquiries (
  id text primary key,
  listing_id text not null references listings (id),
  from_sub text not null,
  from_name text not null,
  note text not null,
  created_at timestamptz not null default now()
);

create index if not exists listings_status_idx on listings (status, sample, sort);
create index if not exists inquiries_listing_idx on inquiries (listing_id);
