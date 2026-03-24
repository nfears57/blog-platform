create extension if not exists "pgcrypto";

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.posts add column if not exists title text;
alter table public.posts add column if not exists slug text;
alter table public.posts add column if not exists category text;
alter table public.posts add column if not exists content text;
alter table public.posts add column if not exists created_at timestamptz default now();
alter table public.posts add column if not exists view_count bigint not null default 0;

create unique index if not exists posts_slug_key on public.posts (slug);

alter table public.posts enable row level security;

drop policy if exists "Public can read posts" on public.posts;
create policy "Public can read posts"
on public.posts
for select
to anon, authenticated
using (true);

drop policy if exists "Admins can insert posts" on public.posts;
create policy "Admins can insert posts"
on public.posts
for insert
to authenticated
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can update posts" on public.posts;
create policy "Admins can update posts"
on public.posts
for update
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can delete posts" on public.posts;
create policy "Admins can delete posts"
on public.posts
for delete
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create or replace function public.increment_post_views(target_slug text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count bigint;
begin
  update public.posts
  set view_count = coalesce(view_count, 0) + 1
  where slug = target_slug
  returning view_count into new_count;

  return coalesce(new_count, 0);
end;
$$;

revoke all on function public.increment_post_views(text) from public;
grant execute on function public.increment_post_views(text) to anon, authenticated;

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id),
  user_id uuid references auth.users(id),
  content text,
  created_at timestamptz default now()
);

alter table public.comments add column if not exists post_id uuid;
alter table public.comments add column if not exists user_id uuid;
alter table public.comments add column if not exists content text;
alter table public.comments add column if not exists created_at timestamptz default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'comments_post_id_fkey'
  ) then
    alter table public.comments
      add constraint comments_post_id_fkey
      foreign key (post_id) references public.posts(id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'comments_user_id_fkey'
  ) then
    alter table public.comments
      add constraint comments_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

alter table public.comments enable row level security;

drop policy if exists "Public can read comments" on public.comments;
create policy "Public can read comments"
on public.comments
for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated users can create comments" on public.comments;
create policy "Authenticated users can create comments"
on public.comments
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own comments" on public.comments;
create policy "Users can delete own comments"
on public.comments
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Admins can delete comments" on public.comments;
create policy "Admins can delete comments"
on public.comments
for delete
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique (post_id, user_id)
);

alter table public.likes add column if not exists post_id uuid;
alter table public.likes add column if not exists user_id uuid;
alter table public.likes add column if not exists created_at timestamptz default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'likes_post_id_fkey'
  ) then
    alter table public.likes
      add constraint likes_post_id_fkey
      foreign key (post_id) references public.posts(id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'likes_user_id_fkey'
  ) then
    alter table public.likes
      add constraint likes_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

create unique index if not exists likes_post_user_unique on public.likes (post_id, user_id);
create index if not exists likes_post_id_idx on public.likes (post_id);

alter table public.likes enable row level security;

drop policy if exists "Public can read likes" on public.likes;
create policy "Public can read likes"
on public.likes
for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated users can create own likes" on public.likes;
create policy "Authenticated users can create own likes"
on public.likes
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own likes" on public.likes;
create policy "Users can delete own likes"
on public.likes
for delete
to authenticated
using (auth.uid() = user_id);
