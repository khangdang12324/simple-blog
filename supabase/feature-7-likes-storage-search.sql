-- BAI TAP 7.2, 7.3, 7.4
-- Chay file nay trong Supabase SQL Editor

create extension if not exists unaccent with schema extensions;

-- =========================
-- 7.2 Likes
-- =========================
create table if not exists public.likes (
  post_id uuid not null references public.posts on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (post_id, user_id)
);

comment on table public.likes is 'Likes on published blog posts';

create index if not exists likes_user_id_idx on public.likes (user_id);
create index if not exists likes_created_at_idx on public.likes (created_at desc);

alter table public.likes enable row level security;

drop policy if exists "Likes on published posts are viewable by everyone" on public.likes;
create policy "Likes on published posts are viewable by everyone"
on public.likes for select
to anon, authenticated
using (
  exists (
    select 1
    from public.posts
    where posts.id = likes.post_id
      and (
        posts.status = 'published'
        or posts.author_id = (select auth.uid())
      )
  )
);

drop policy if exists "Authenticated users can like published posts" on public.likes;
create policy "Authenticated users can like published posts"
on public.likes for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.posts
    where posts.id = likes.post_id
      and posts.status = 'published'
  )
);

drop policy if exists "Users can unlike their own likes" on public.likes;
create policy "Users can unlike their own likes"
on public.likes for delete
to authenticated
using ((select auth.uid()) = user_id);

-- =========================
-- 7.3 Storage: post-images
-- =========================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-images',
  'post-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view post images" on storage.objects;
create policy "Public can view post images"
on storage.objects for select
to public
using (bucket_id = 'post-images');

drop policy if exists "Authenticated users can upload their own post images" on storage.objects;
create policy "Authenticated users can upload their own post images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = ((select auth.uid())::text)
);

drop policy if exists "Users can update their own post images" on storage.objects;
create policy "Users can update their own post images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = ((select auth.uid())::text)
)
with check (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = ((select auth.uid())::text)
);

drop policy if exists "Users can delete their own post images" on storage.objects;
create policy "Users can delete their own post images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = ((select auth.uid())::text)
);

-- =========================
-- 7.4 Full-text search
-- =========================
create index if not exists posts_full_text_search_idx
on public.posts
using gin (
  to_tsvector(
    'simple',
    extensions.unaccent(
      coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content, '')
    )
  )
);

drop function if exists public.search_posts(text);
create or replace function public.search_posts(search_query text)
returns table (
  id uuid,
  slug text,
  title text,
  excerpt_preview text,
  published_at timestamp with time zone,
  display_name text,
  avatar_url text,
  rank real
)
language sql
stable
set search_path = public
as $$
  with normalized_query as (
    select websearch_to_tsquery(
      'simple',
      extensions.unaccent(trim(search_query))
    ) as query
  ),
  searchable_posts as (
    select
      p.id,
      p.slug,
      p.title,
      coalesce(
        nullif(p.excerpt, ''),
        left(regexp_replace(coalesce(p.content, ''), '\s+', ' ', 'g'), 220)
      ) as excerpt_preview,
      p.published_at,
      pr.display_name,
      pr.avatar_url,
      to_tsvector(
        'simple',
        extensions.unaccent(
          coalesce(p.title, '') || ' ' || coalesce(p.excerpt, '') || ' ' || coalesce(p.content, '')
        )
      ) as document
    from public.posts p
    left join public.profiles pr on pr.id = p.author_id
    where p.status = 'published'
  )
  select
    searchable_posts.id,
    searchable_posts.slug,
    searchable_posts.title,
    searchable_posts.excerpt_preview,
    searchable_posts.published_at,
    searchable_posts.display_name,
    searchable_posts.avatar_url,
    ts_rank(searchable_posts.document, normalized_query.query) as rank
  from searchable_posts
  cross join normalized_query
  where normalized_query.query @@ searchable_posts.document
  order by rank desc, published_at desc nulls last;
$$;

grant execute on function public.search_posts(text) to anon, authenticated;
