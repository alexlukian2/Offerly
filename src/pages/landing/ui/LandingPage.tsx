import { CtaSection } from '@/widgets/cta-section'
import { FaqSection } from '@/widgets/faq-section'
import { FeaturesSection } from '@/widgets/features-section'
import { Footer } from '@/widgets/footer'
import { Header } from '@/widgets/header'
import { Hero } from '@/widgets/hero'
import { HowItWorks } from '@/widgets/how-it-works'

export function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <FeaturesSection />
        <HowItWorks />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}
