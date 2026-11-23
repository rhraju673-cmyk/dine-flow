import { ChevronDown, Info, Quote } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { cn } from '../../utils/cn';
import { initials } from '../../utils/format';
import { SectionHeading } from '../ui/SectionHeading';

/** Testimonials — clearly marked as SAMPLE content (not real customers). */
export function Testimonials() {
  const { t } = useI18n();
  return (
    <section className="py-24">
      <div className="container-page">
        <SectionHeading eyebrow={t('testimonials.eyebrow')} title={t('testimonials.title')}>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
            <Info className="size-3.5" />
            {t('testimonials.notice')}
          </p>
        </SectionHeading>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {['t1', 't2', 't3'].map((k, i) => {
            const name = t(`testimonials.items.${k}.name`);
            return (
              <figure key={k} className={cn('card flex flex-col p-7', i === 1 && 'md:-translate-y-4')}>
                <Quote className="size-7 text-brand/60" />
                <blockquote className="mt-5 flex-1 text-[15px] leading-relaxed text-fg/90">“{t(`testimonials.items.${k}.quote`)}”</blockquote>
                <figcaption className="mt-7 flex items-center gap-3 border-t border-line pt-5">
                  <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-brand-2 to-brand text-sm font-semibold text-brand-ink">
                    {initials(name) || 'S'}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-fg">{name}</p>
                    <p className="text-xs text-muted">{t(`testimonials.items.${k}.role`)}</p>
                  </div>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  const { t } = useI18n();
  const [open, setOpen] = useState<string | null>('q1');
  const keys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];
  return (
    <section id="faq" className="scroll-mt-24 border-y border-line/60 bg-bg-2/60 py-24">
      <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading align="left" eyebrow={t('faq.eyebrow')} title={t('faq.title')} />
        <div className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-card">
          {keys.map((k) => {
            const isOpen = open === k;
            return (
              <div key={k}>
                <h3>
                  <button
                    onClick={() => setOpen(isOpen ? null : k)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-${k}`}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-medium text-fg hover:text-brand-2"
                  >
                    {t(`faq.items.${k}.q`)}
                    <ChevronDown className={cn('size-5 shrink-0 text-muted transition-transform', isOpen && 'rotate-180 text-brand-2')} />
                  </button>
                </h3>
                <div id={`faq-${k}`} hidden={!isOpen} className="px-6 pb-5 text-sm leading-relaxed text-muted">
                  {t(`faq.items.${k}.a`)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
