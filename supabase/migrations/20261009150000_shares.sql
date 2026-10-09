-- Посилання "Поділитися": на всю дошку або на одну вакансію, лише для читання.
-- Виконати один раз: Supabase → SQL Editor → вставити → Run.

begin;

-- 1. Посилання. id — це і є секретний токен в адресі /s/<id>: випадковий uuid (122 біти),
--    підібрати його неможливо. application_id = null → ділимось усією дошкою
create table public.shares (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  application_id uuid references public.applications (id) on delete cascade,
  created_at     timestamptz not null default now()
);

-- Одне посилання на дошку і одне на кожну вакансію. "nulls not distinct" — два рядки
-- з application_id = null (дошка) теж вважаються дублікатами
create unique index shares_user_application_key
  on public.shares (user_id, application_id) nulls not distinct;

-- 2. Власник керує своїми посиланнями: бачить, створює, вимикає (видаляє)
alter table public.shares enable row level security;
grant select, insert, delete on public.shares to authenticated;

create policy "users read own shares"
  on public.shares for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Ділитися можна лише СВОЄЮ вакансією: інакше можна було б створити посилання на чужий рядок
-- (security definer-функція нижче показала б його)
create policy "users create own shares"
  on public.shares for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and (
      application_id is null
      or exists (
        select 1 from public.applications a
        where a.id = application_id and a.user_id = (select auth.uid())
      )
    )
  );

create policy "users delete own shares"
  on public.shares for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- 3. Читання за посиланням. Відвідувач не має доступу до таблиць (RLS його не пустить),
--    тому — функція з security definer: виконується з правами власника функції і повертає
--    РІВНО те, чим поділились. null — посилання немає (неправильне або вимкнене).
--    set search_path = '' — захист: усі імена в тілі вказані повністю (public.…)
create function public.get_share(share_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'kind', case when s.application_id is null then 'board' else 'application' end,
    'applications', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', a.id,
            'company', a.company,
            'position', a.position,
            'status', a.status,
            'work_format', a.work_format,
            'salary', a.salary,
            'url', a.url,
            'created_at', a.created_at
          )
          order by a.created_at desc
        )
        from public.applications a
        where a.user_id = s.user_id
          and (s.application_id is null or a.id = s.application_id)
      ),
      '[]'::jsonb
    )
  )
  from public.shares s
  where s.id = share_id;
$$;

-- Функції в Postgres за замовчуванням може викликати будь-хто (public) — забираємо
-- і видаємо явно: і гостю без входу (anon), і користувачу з сесією
revoke all on function public.get_share(uuid) from public;
grant execute on function public.get_share(uuid) to anon, authenticated;

commit;
