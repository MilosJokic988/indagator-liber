-- =====================================================================
--  INDAGATOR LIBER — podešavanje baze (pokreni jednom u Supabase → SQL Editor)
--  ⚠️  PRE POKRETANJA: zameni  tvoj@mejl.com  svojim mejlom (3 mesta dole).
-- =====================================================================

-- 1) Tabela sa pričama
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  date        date not null default current_date,
  category    text not null default 'istorija',
  status      text,
  excerpt     text,
  cover       text,
  featured    boolean not null default false,
  published   boolean not null default false,
  sources     jsonb not null default '[]'::jsonb,
  body        text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2) Zaštita: posetioci čitaju SAMO objavljene priče, menjati može samo admin
alter table public.posts enable row level security;

drop policy if exists "javno citanje objavljenih" on public.posts;
create policy "javno citanje objavljenih" on public.posts
  for select using (published = true);

drop policy if exists "admin sve" on public.posts;
create policy "admin sve" on public.posts
  for all to authenticated
  using      ((auth.jwt() ->> 'email') = 'tvoj@mejl.com')
  with check ((auth.jwt() ->> 'email') = 'tvoj@mejl.com');

-- 3) Skladište za slike (javno vidljive, otprema samo admin)
insert into storage.buckets (id, name, public)
values ('slike', 'slike', true)
on conflict (id) do nothing;

drop policy if exists "admin slike" on storage.objects;
create policy "admin slike" on storage.objects
  for all to authenticated
  using      (bucket_id = 'slike' and (auth.jwt() ->> 'email') = 'tvoj@mejl.com')
  with check (bucket_id = 'slike' and (auth.jwt() ->> 'email') = 'tvoj@mejl.com');
