import { describe, expect, it } from 'vitest'
import { parseVacancy } from './parseVacancy'

// Скорочені копії справжньої розмітки сайтів — лише те, що читає парсер
const djinniHtml = `
<title>System Administrator в Noltic – Djinni</title>
<script type="application/ld+json">
  {"@context": "https://schema.org/", "@type": "JobPosting", "title": "System Administrator",
   "hiringOrganization": {"@type": "Organization", "name": "Noltic"},
   "baseSalary": {"@type": "MonetaryAmount", "currency": "USD", "value": {"minValue": 2000, "maxValue": 3000}}}
</script>
<strong class="d-block font-weight-600">Тільки офіс</strong>`

const douHtml = `
<title>React.js Developer в Interactive Online Technologies, від&nbsp;$5000, віддалено | DOU</title>
<script type="application/ld+json">{"@context": "https://schema.org", "@type": "Organization", "url": "https://dou.ua/"}</script>
<div class="l-n">
  <a href="https://jobs.dou.ua/companies/iot/">Interactive Online Technologies</a>
</div>
<span class="salary">від&nbsp;$5000</span>
<span class="place bi bi-geo-alt-fill"> віддалено</span>`

describe('parseVacancy', () => {
  it('бере дані з JSON-LD JobPosting, а формат роботи — з розмітки Djinni', () => {
    expect(parseVacancy(djinniHtml, new URL('https://djinni.co/jobs/1/'))).toEqual({
      position: 'System Administrator',
      company: 'Noltic',
      workFormat: 'office',
      salary: '$2000–3000',
    })
  })

  it('читає розмітку DOU і розкодовує HTML-сутності', () => {
    expect(
      parseVacancy(douHtml, new URL('https://jobs.dou.ua/companies/iot/vacancies/1/')),
    ).toEqual({
      position: 'React.js Developer',
      company: 'Interactive Online Technologies',
      workFormat: 'remote',
      salary: 'від $5000',
    })
  })

  it('на невідомому сайті розбирає заголовок "Позиція at Компанія | Сайт"', () => {
    const html = '<title>Frontend Developer at Acme Corp, Hybrid | Jobs</title>'
    expect(parseVacancy(html, new URL('https://jobs.example.com/1'))).toEqual({
      position: 'Frontend Developer',
      company: 'Acme Corp',
      workFormat: 'hybrid',
      salary: undefined,
    })
  })

  it('JobPosting у масиві @graph і зарплата одним числом', () => {
    const html = `<script type="application/ld+json">
      {"@graph": [{"@type": "WebPage"}, {"@type": "JobPosting", "title": "QA", "hiringOrganization": "Beta",
       "jobLocationType": "TELECOMMUTE", "baseSalary": {"currency": "UAH", "value": {"value": 40000}}}]}
    </script>`
    expect(parseVacancy(html, new URL('https://example.com'))).toEqual({
      position: 'QA',
      company: 'Beta',
      workFormat: 'remote',
      salary: '40000 UAH',
    })
  })

  it('зламаний JSON-LD не ламає розбір — береться заголовок', () => {
    const html = '<script type="application/ld+json">{oops</script><title>Designer в Studio</title>'
    expect(parseVacancy(html, new URL('https://example.com'))).toMatchObject({
      position: 'Designer',
      company: 'Studio',
    })
  })
})
