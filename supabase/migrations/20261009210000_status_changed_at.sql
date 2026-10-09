-- Коли вакансія востаннє змінила етап. Потрібно для блоку "Потребують уваги" на статистиці:
-- вакансії, що стоять без руху понад 14 днів.
-- Виконати один раз: Supabase → SQL Editor → вставити → Run.

begin;

-- default now(): нова вакансія "змінила етап" у момент створення
alter table public.applications
  add column status_changed_at timestamptz not null default now();

-- Для наявних вакансій точної дати немає — найкраще наближення: дата створення
update public.applications set status_changed_at = created_at;

-- Ставить дату САМА база, а не застосунок: так вона правильна, хоч би звідки змінили етап
-- (дошка, сторінка вакансії, SQL Editor). "is distinct from" — порівняння, що коректно працює й з null
create function public.touch_status_changed_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    new.status_changed_at := now();
  end if;
  return new;
end;
$$;

-- "before update of status" — тригер спрацьовує лише на оновлення, де фігурує колонка status
create trigger applications_touch_status_changed_at
  before update of status on public.applications
  for each row
  execute function public.touch_status_changed_at();

commit;
