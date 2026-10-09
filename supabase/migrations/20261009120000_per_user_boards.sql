-- Окрема дошка для кожного користувача (зокрема анонімного — Supabase Anonymous Sign-ins).
-- Виконати один раз: Supabase → SQL Editor → вставити → Run.
-- Уся міграція — одна транзакція: якщо будь-який крок впаде, база лишиться як була.

begin;

-- 1. Демо-рядки нікому не належать — після міграції їх однаково ніхто б не побачив
delete from public.applications;

-- 2. Власник рядка. default auth.uid() — id користувача з токена запиту:
--    застосунку не треба передавати user_id, база підставить його сама.
--    on delete cascade — видалили користувача → видалились і його вакансії
alter table public.applications
  add column user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade;

-- 3. Дублікат тепер рахується в межах ОДНОГО користувача: у двох людей може бути
--    та сама вакансія. user_id першим — цей самий індекс пришвидшує фільтр RLS по user_id
drop index if exists public.applications_company_position_key;
create unique index applications_user_company_position_key
  on public.applications (user_id, lower(trim(company)), lower(trim(position)));

-- 4. Права ролей. Анонімний користувач після входу має роль authenticated (як і звичайний).
--    Роль anon (запит без входу) більше нічого не може
revoke all on public.applications from anon;
grant select, insert, update, delete on public.applications to authenticated;

-- 5. RLS: замість тимчасового "доступ для всіх" — лише власні рядки.
--    (select auth.uid()) у дужках — Postgres обчислить його один раз на запит, а не для кожного рядка
drop policy if exists "temporary: public access until auth" on public.applications;

create policy "users read own applications"
  on public.applications for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "users create own applications"
  on public.applications for insert
  to authenticated
  with check (user_id = (select auth.uid()));

-- using — які рядки можна змінювати; with check — яким рядок має бути ПІСЛЯ зміни
-- (не можна "передати" свою вакансію іншому користувачу, змінивши user_id)
create policy "users update own applications"
  on public.applications for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "users delete own applications"
  on public.applications for delete
  to authenticated
  using (user_id = (select auth.uid()));

commit;
