-- Нагадування до вакансії: одне на вакансію, необов'язкове.
-- Виконати один раз: Supabase → SQL Editor → вставити → Run.

begin;

-- remind_at   — коли нагадати (timestamptz: точний момент часу, без плутанини з поясами).
-- remind_note — що зробити ("Написати рекрутеру"), необов'язково.
-- null = нагадування немає. Права й RLS — ті самі, що в рядка: бачить і змінює лише власник
alter table public.applications
  add column remind_at   timestamptz,
  add column remind_note text check (char_length(remind_note) <= 200);

-- Пошук нагадувань, що настали, — зокрема майбутньою розсилкою на пошту, яка шукатиме
-- "remind_at <= now()". Частковий індекс: лише рядки, де нагадування є
create index applications_remind_at_idx
  on public.applications (remind_at)
  where remind_at is not null;

-- get_share (посилання "Поділитися") НЕ змінюємо: він перелічує поля явно,
-- тож нагадування — особисті — гостям не потраплять

commit;
