-- Схема бази Offerly. Виконати один раз: Supabase → SQL Editor → вставити → Run.
-- Файл живе в репозиторії, щоб схема бази зберігалась і рев'юїлась разом із кодом.

-- 1. Таблиця вакансій. Назви колонок — snake_case (традиція SQL), у коді вони стануть camelCase.
create table public.applications (
  id          uuid primary key default gen_random_uuid(),
  company     text not null check (char_length(trim(company)) > 0),
  position    text not null check (char_length(trim(position)) > 0),
  status      text not null default 'applied'
              check (status in ('wishlist', 'applied', 'test', 'interview', 'offer', 'rejected')),
  work_format text not null default 'remote'
              check (work_format in ('remote', 'office', 'hybrid')),
  salary      text,
  url         text,
  created_at  timestamptz not null default now()
);

-- 2. "Серверна" перевірка дублікатів: та сама пара компанія + позиція (без урахування регістру й пробілів).
--    База сама відхилить дублікат з кодом помилки 23505 — застосунок покаже це біля поля "Позиція".
create unique index applications_company_position_key
  on public.applications (lower(trim(company)), lower(trim(position)));

-- 3. Права ролі anon (від її імені звертається браузер з публічним ключем).
--    Рівень 1 — ЧИ можна взагалі працювати з таблицею. Нові проекти Supabase не видають їх автоматично.
grant select, insert, update, delete on public.applications to anon;

-- 4. Row Level Security — рівень 2: ЯКІ САМЕ рядки доступні. Без політик — жоден.
alter table public.applications enable row level security;

-- ⚠️ ТИМЧАСОВА політика: поки в застосунку немає входу в акаунт (урок 30),
--    читати й змінювати таблицю може будь-хто, хто має публічний ключ проекту.
--    Для навчального проекту прийнятно; у справжньому продукті — НІКОЛИ.
create policy "temporary: public access until auth"
  on public.applications
  for all
  to anon
  using (true)
  with check (true);

-- 5. Демо-дані (ті самі, що були в mockApplications)
insert into public.applications (company, position, status, work_format, salary, created_at) values
  ('Nebula Labs', 'Junior React Developer', 'applied',   'remote', '$1200–1600', '2026-10-01 09:00:00+00'),
  ('Pixelforge',  'Frontend Developer',     'applied',   'office', '$1500–2000', '2026-10-02 09:00:00+00'),
  ('Krona Pay',   'Frontend Developer',     'test',      'hybrid', '$1800',      '2026-09-28 09:00:00+00'),
  ('Brightloop',  'Junior Frontend',        'interview', 'remote', '$1400',      '2026-09-24 09:00:00+00'),
  ('Datawise',    'React Engineer',         'wishlist',  'remote', null,         '2026-10-05 09:00:00+00'),
  ('Hexa Studio', 'React Developer',        'rejected',  'hybrid', null,         '2026-09-20 09:00:00+00');
