import { useState } from 'react'
import { SectionHeading } from '@/shared/ui/section-heading'
import { faqItems } from '../model/faq'
import { FaqItem } from './FaqItem'
import styles from './FaqSection.module.css'

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(faqItems[0].id)

  function handleToggle(id: string) {
    setOpenId((currentId) => (currentId === id ? null : id))
  }

  return (
    <section id="faq" className="section">
      <div className="container">
        <SectionHeading
          eyebrow="FAQ"
          title="Часті питання"
          description="Коротко про головне, перш ніж почати."
        />

        <div className={styles.list}>
          {faqItems.map((item) => (
            <FaqItem
              key={item.id}
              id={item.id}
              question={item.question}
              answer={item.answer}
              isOpen={openId === item.id}
              onToggle={() => handleToggle(item.id)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
