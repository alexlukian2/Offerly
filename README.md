# Offerly

Трекер пошуку роботи для розробників: усі вакансії, на які ти відгукнувся, на одній дошці — від першого відгуку до оферу.

**Демо:** https://offerly-rho.vercel.app

## Можливості

- Канбан-дошка етапів з перетягуванням карток і колонок (миша, палець, клавіатура)
- Автозаповнення вакансії за посиланням (DOU, Djinni, сторінки зі schema.org JobPosting)
- Нагадування до вакансій — на сайті й системним сповіщенням браузера
- Нотатки у клітинку: на дошці або до конкретної вакансії
- Статистика: воронка, етапи, календар активності, тижнева ціль, «Потребують уваги»
- Посилання «Поділитися» на дошку або вакансію — лише для перегляду
- Окрема дошка для кожного відвідувача (анонімний вхід Supabase + RLS)
- Світла й темна тема, мобільна версія, доступність з клавіатури і скрінрідера

## Стек

React 19 · TypeScript · Vite · React Router · TanStack Query · react-hook-form + zod · dnd-kit · Recharts · Radix UI · Supabase (PostgreSQL, RLS, Edge Functions) · Vitest + Testing Library. Архітектура — Feature-Sliced Design.

## Запуск локально

```bash
npm install
cp .env.example .env.local   # і впиши свої значення
npm run dev
```

`.env.local`:

```
VITE_SUPABASE_URL=https://<проект>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

База: виконай у Supabase → SQL Editor `supabase/schema.sql`, потім по черзі файли з `supabase/migrations/`. Увімкни Authentication → Allow anonymous sign-ins. Функцію автозаповнення задеплой з `supabase/functions/parse-vacancy` (з вимкненою перевіркою JWT).

## Скрипти

| Команда | Що робить |
| --- | --- |
| `npm run dev` | dev-сервер |
| `npm run build` | перевірка типів і збірка |
| `npm run lint` | ESLint |
| `npx vitest run` | тести |

## Ліцензія

[MIT](LICENSE) — використовуй, змінюй і поширюй вільно.
