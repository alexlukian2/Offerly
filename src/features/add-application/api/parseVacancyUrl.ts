import { FunctionsFetchError, FunctionsHttpError } from '@supabase/supabase-js'
import { z } from 'zod'
import { WORK_FORMATS } from '@/entities/application'
import { supabase } from '@/shared/api'
import { NetworkError } from '@/shared/lib/errors'

// Що повертає Edge Function parse-vacancy (supabase/functions/parse-vacancy).
// Відповідь сервера — "чужі" дані: перевіряємо схемою, а не віримо типу на слово
const vacancyDraftSchema = z.object({
  position: z.string().optional(),
  company: z.string().optional(),
  workFormat: z.enum(WORK_FORMATS).optional(),
  salary: z.string().optional(),
  url: z.string(),
})

export type VacancyDraft = z.infer<typeof vacancyDraftSchema>

const errorBodySchema = z.object({ error: z.string() })

export async function parseVacancyUrl(url: string): Promise<VacancyDraft> {
  // invoke = POST на https://<проект>.supabase.co/functions/v1/parse-vacancy з нашим ключем
  const { data, error } = await supabase.functions.invoke('parse-vacancy', {
    body: { url },
  })

  if (error) {
    if (error instanceof FunctionsFetchError) throw new NetworkError()

    if (error instanceof FunctionsHttpError) {
      // Функція відповіла 4xx/5xx — у тілі наше повідомлення { error: '...' }
      const body = errorBodySchema.safeParse(await error.context.json().catch(() => null))
      if (body.success) throw new Error(body.data.error, { cause: error })
    }

    // Функцію не задеплоєно, вимкнено, або відповів не наш код (шлюз Supabase)
    throw new Error('Автозаповнення зараз недоступне. Заповни поля вручну', {
      cause: error,
    })
  }

  return vacancyDraftSchema.parse(data)
}
