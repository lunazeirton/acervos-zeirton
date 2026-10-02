create extension if not exists pgcrypto;

create schema if not exists private;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Zeirton Luna',
  role text not null default 'reader' check (role in ('reader','editor','admin')),
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  slug text not null unique,
  excerpt text,
  content_html text not null default '',
  cover_url text,
  author_id uuid references public.profiles(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','scheduled','published','archived')),
  scheduled_at timestamptz,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  reading_time integer not null default 1,
  references_text text,
  seo_title text,
  seo_description text,
  canonical_url text,
  featured boolean not null default false,
  search_vector tsvector generated always as (
    setweight(to_tsvector('portuguese', coalesce(title,'')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(subtitle,'')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(excerpt,'')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(content_html,'')), 'C')
  ) stored
);

create table if not exists public.article_tags (
  article_id uuid not null references public.articles(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

create table if not exists public.archive_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  context_text text,
  item_type text not null default 'outro',
  original_author text,
  original_date date,
  published_at timestamptz,
  category_id uuid references public.categories(id) on delete set null,
  cover_url text,
  file_url text,
  source_text text,
  references_text text,
  status text not null default 'draft' check (status in ('draft','scheduled','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    setweight(to_tsvector('portuguese', coalesce(title,'')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(description,'')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(context_text,'')), 'C')
  ) stored
);

create table if not exists public.archive_tags (
  archive_item_id uuid not null references public.archive_items(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (archive_item_id, tag_id)
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  storage_path text not null unique,
  public_url text,
  mime_type text,
  size_bytes bigint,
  alt_text text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  site_name text not null default 'Zeirton Luna',
  site_subtitle text not null default 'Artigos, reflexões e acervo',
  home_intro text not null default 'Artigos, reflexões, pesquisas e registros reunidos em um só lugar.',
  about_html text not null default '<p>Este é um espaço pessoal dedicado à escrita, pesquisa, memória e preservação de conteúdo.</p>',
  social_links jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.site_settings(id) values (1) on conflict (id) do nothing;

insert into public.categories(name,slug) values
('Reflexões','reflexoes'),('Sociedade','sociedade'),('História','historia'),('Religião','religiao'),('Ciência','ciencia'),('Educação','educacao'),('Política','politica'),('Meio Ambiente','meio-ambiente'),('Textos pessoais','textos-pessoais'),('Pesquisas','pesquisas'),('Acervo','acervo')
on conflict (slug) do nothing;

create index if not exists articles_status_published_idx on public.articles(status,published_at desc);
create index if not exists articles_category_idx on public.articles(category_id);
create index if not exists articles_search_idx on public.articles using gin(search_vector);
create index if not exists archive_status_published_idx on public.archive_items(status,published_at desc);
create index if not exists archive_search_idx on public.archive_items using gin(search_vector);

create or replace function private.is_admin()
returns boolean language sql security definer set search_path = '' stable as $$
  select exists(select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
$$;
revoke all on function private.is_admin() from public, anon, authenticated;
grant execute on function private.is_admin() to authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id,display_name) values(new.id, coalesce(new.raw_user_meta_data->>'display_name','Zeirton Luna')) on conflict(id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.search_public_content(search_text text)
returns table(content_type text,id uuid,title text,slug text,excerpt text,published_at timestamptz,rank real)
language sql security invoker stable as $$
  with q as (select websearch_to_tsquery('portuguese', search_text) query)
  select 'article',a.id,a.title,a.slug,a.excerpt,a.published_at,ts_rank(a.search_vector,q.query)
  from public.articles a,q where a.status='published' and a.search_vector @@ q.query
  union all
  select 'archive',i.id,i.title,i.slug,i.description,i.published_at,ts_rank(i.search_vector,q.query)
  from public.archive_items i,q where i.status='published' and i.search_vector @@ q.query
  order by rank desc;
$$;

grant select on public.categories, public.tags, public.article_tags, public.archive_tags to anon, authenticated;
grant select on public.articles, public.archive_items, public.site_settings to anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant select,insert,update,delete on public.articles, public.archive_items, public.categories, public.tags, public.article_tags, public.archive_tags, public.media, public.site_settings to authenticated;
grant execute on function public.search_public_content(text) to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.articles enable row level security;
alter table public.article_tags enable row level security;
alter table public.archive_items enable row level security;
alter table public.archive_tags enable row level security;
alter table public.media enable row level security;
alter table public.site_settings enable row level security;

create policy "public profiles read" on public.profiles for select to anon,authenticated using (true);
create policy "admin profiles" on public.profiles for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "public categories read" on public.categories for select to anon,authenticated using (true);
create policy "admin categories" on public.categories for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "public tags read" on public.tags for select to anon,authenticated using (true);
create policy "admin tags" on public.tags for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "public published articles" on public.articles for select to anon,authenticated using (status='published' or (select private.is_admin()));
create policy "admin articles" on public.articles for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "public article tags" on public.article_tags for select to anon,authenticated using (true);
create policy "admin article tags" on public.article_tags for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "public published archive" on public.archive_items for select to anon,authenticated using (status='published' or (select private.is_admin()));
create policy "admin archive" on public.archive_items for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "public archive tags" on public.archive_tags for select to anon,authenticated using (true);
create policy "admin archive tags" on public.archive_tags for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admin media" on public.media for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "public site settings" on public.site_settings for select to anon,authenticated using (true);
create policy "admin site settings" on public.site_settings for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

insert into storage.buckets(id,name,public,allowed_mime_types) values('media','media',true,array['image/jpeg','image/png','image/webp','application/pdf']) on conflict (id) do nothing;
create policy "admin media upload" on storage.objects for insert to authenticated with check (bucket_id='media' and (select private.is_admin()));
create policy "admin media update" on storage.objects for update to authenticated using (bucket_id='media' and (select private.is_admin())) with check (bucket_id='media' and (select private.is_admin()));
create policy "admin media delete" on storage.objects for delete to authenticated using (bucket_id='media' and (select private.is_admin()));

-- Depois de criar seu usuário em Authentication > Users, torne-o administrador com:
-- update public.profiles set role='admin', display_name='Zeirton Luna' where id=(select id from auth.users where email='SEU_EMAIL');
