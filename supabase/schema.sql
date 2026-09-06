create extension if not exists pgcrypto;

create table if not exists public.profiles (
  uid uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Escritor',
  photo_url text not null default '',
  bio text not null default '',
  email text not null default '',
  role text not null default 'writer' check (role in ('writer', 'admin')),
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  excerpt text not null,
  content text not null,
  category text not null check (category in ('historia-alternativa', 'curiosidades-geradas')),
  author_email text not null,
  author_name text not null default 'Escritor',
  author_uid uuid not null references auth.users(id) on delete cascade,
  cover_image text not null default '',
  status text not null default 'pendente_revisao'
    check (status in ('pendente_pagamento', 'pagamento_erro', 'pendente_revisao', 'aprovado', 'rejeitado')),
  review_note text not null default '',
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  payment_id text,
  payment_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists articles_author_uid_idx on public.articles(author_uid);
create index if not exists articles_status_idx on public.articles(status);
create index if not exists articles_created_at_idx on public.articles(created_at desc);

alter table public.profiles enable row level security;
alter table public.articles enable row level security;

create policy "Users can read their profile"
  on public.profiles for select
  using (auth.uid() = uid);

create policy "Users can create their profile"
  on public.profiles for insert
  with check (auth.uid() = uid);

create policy "Users can update their profile"
  on public.profiles for update
  using (auth.uid() = uid)
  with check (auth.uid() = uid);

create policy "Approved articles are public"
  on public.articles for select
  using (status = 'aprovado' or auth.uid() = author_uid);

create policy "Users can submit their articles"
  on public.articles for insert
  with check (auth.uid() = author_uid);

create policy "Users can update their own articles"
  on public.articles for update
  using (auth.uid() = author_uid)
  with check (auth.uid() = author_uid);
