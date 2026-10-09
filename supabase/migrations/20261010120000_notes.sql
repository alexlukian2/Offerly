-- Нотатки "у клітинку": прикріплені до колонки дошки або до конкретної вакансії.
-- Виконати один раз: Supabase → SQL Editor → вставити → Run.

begin;

create table public.notes (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Де висить нотатка — рівно одне з двох: вакансія АБО колонка дошки (етап)
  application_id uuid references public.applications (id) on delete cascade,
  status         text check (status in ('wishlist', 'applied', 'test', 'interview', 'offer', 'rejected')),
  text           text not null check (char_length(trim(text)) between 1 and 2000),
  color          text not null default 'paper' check (color in ('paper', 'yellow', 'pink', 'mint')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  -- "<>" для boolean — це XOR: заповнене рівно одне поле з двох
  constraint notes_one_place check ((application_id is null) <> (status is null))
);

create index notes_user_id_idx on public.notes (user_id);
create index notes_application_id_idx on public.notes (application_id) where application_id is not null;

-- updated_at ставить сама база при кожній зміні
create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger notes_touch_updated_at
  before update on public.notes
  for each row
  execute function public.touch_updated_at();

-- Права і RLS: власник бачить і змінює лише свої нотатки
alter table public.notes enable row level security;
grant select, insert, update, delete on public.notes to authenticated;

create policy "users read own notes"
  on public.notes for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Прикріпити можна лише до СВОЄЇ вакансії
create policy "users create own notes"
  on public.notes for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and (
      application_id is null
      or exists (select 1 from public.applications a where a.id = application_id and a.user_id = (select auth.uid()))
    )
  );

create policy "users update own notes"
  on public.notes for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (
      application_id is null
      or exists (select 1 from public.applications a where a.id = application_id and a.user_id = (select auth.uid()))
    )
  );

create policy "users delete own notes"
  on public.notes for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- Посилання "Поділитися" (get_share) нотатки не віддає: вони особисті

commit;
