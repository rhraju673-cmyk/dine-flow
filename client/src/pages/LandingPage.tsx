import { useState } from 'react';
import { Contact } from '../components/landing/Contact';
import { DemoModal } from '../components/landing/DemoModal';
import { Features, HowItWorks } from '../components/landing/Features';
import { Footer } from '../components/landing/Footer';
import { Hero } from '../components/landing/Hero';
import { Navbar } from '../components/landing/Navbar';
import { Pricing } from '../components/landing/Pricing';
import { ProductPreview } from '../components/landing/ProductPreview';
import { KitchenPreview, ManagementBenefits, QrBenefits, WaiterPreview } from '../components/landing/Showcases';
import { Faq, Testimonials } from '../components/landing/Social';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useI18n } from '../contexts/I18nContext';

/**
 * Public marketing website. Section order is defined here —
 * reorder or remove sections by editing this list.
 */
export function LandingPage() {
  const { t } = useI18n();
  const [demoOpen, setDemoOpen] = useState(false);
  useDocumentTitle(t('brand.tagline'));

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-3 focus:py-2 focus:text-brand-ink">
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Hero onExploreDemo={() => setDemoOpen(true)} />
        <ProductPreview />
        <Features />
        <HowItWorks />
        <QrBenefits />
        <ManagementBenefits />
        <KitchenPreview />
        <WaiterPreview />
        <Pricing />
        <Testimonials />
        <Faq />
        <Contact />
      </main>
      <div className="h-24" />
      <Footer />
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  );
}
