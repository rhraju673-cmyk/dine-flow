import { BarChart3, ChefHat, ConciergeBell, QrCode, ReceiptText, Table2 } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { SectionHeading } from '../ui/SectionHeading';

const items = [
  { key: 'qr', icon: QrCode },
  { key: 'kitchen', icon: ChefHat },
  { key: 'tables', icon: Table2 },
  { key: 'waiter', icon: ConciergeBell },
  { key: 'billing', icon: ReceiptText },
  { key: 'analytics', icon: BarChart3 },
];

/** Bento-style feature grid with one photo tile. */
export function Features() {
  const { t } = useI18n();
  return (
    <section id="features" className="scroll-mt-24 border-y border-line/60 bg-bg-2/60 py-24">
      <div className="container-page">
        <SectionHeading eyebrow={t('features.eyebrow')} title={t('features.title')} description={t('features.description')} />

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-line md:col-span-2 lg:row-span-2">
            <img src="/images/dining-friends.jpg" alt="Friends sharing a meal at a restaurant table" className="absolute inset-0 size-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-transparent" />
            <div className="relative flex h-full min-h-80 flex-col justify-end p-7">
              <div className="mb-4 grid size-11 place-items-center rounded-xl bg-brand text-brand-ink">
                <QrCode className="size-5" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-fg">{t('features.items.qr.title')}</h3>
              <p className="mt-2 max-w-md text-muted">{t('features.items.qr.desc')}</p>
            </div>
          </div>

          {items.slice(1).map(({ key, icon: Icon }) => (
            <article key={key} className="card group p-6 transition-colors hover:border-line-2 hover:bg-card-2">
              <div className="grid size-11 place-items-center rounded-xl border border-line bg-bg-2 text-brand-2 transition-colors group-hover:border-brand/40">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-5 font-semibold text-fg">{t(`features.items.${key}.title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(`features.items.${key}.desc`)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const { t } = useI18n();
  const steps = ['s1', 's2', 's3', 's4'];
  return (
    <section id="how-it-works" className="scroll-mt-24 py-24">
      <div className="container-page">
        <SectionHeading eyebrow={t('how.eyebrow')} title={t('how.title')} description={t('how.description')} />
        <ol className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
          <div className="absolute top-6 right-[12%] left-[12%] hidden h-px bg-gradient-to-r from-transparent via-line-2 to-transparent md:block" aria-hidden />
          {steps.map((s, i) => (
            <li key={s} className="relative text-center">
              <div className="relative mx-auto grid size-12 place-items-center rounded-full border border-brand/40 bg-bg font-display text-lg font-semibold text-brand-2">
                {i + 1}
              </div>
              <h3 className="mt-5 font-semibold text-fg">{t(`how.steps.${s}.title`)}</h3>
              <p className="mx-auto mt-2 max-w-60 text-sm leading-relaxed text-muted">{t(`how.steps.${s}.desc`)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
