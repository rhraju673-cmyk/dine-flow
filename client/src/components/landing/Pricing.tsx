import { Check, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { pricingCurrency, pricingPlans, yearlyMonthsFree } from '../../config/pricing';
import { useI18n } from '../../contexts/I18nContext';
import { cn } from '../../utils/cn';
import { ButtonLink } from '../ui/Button';
import { SectionHeading } from '../ui/SectionHeading';

export function Pricing() {
  const { t } = useI18n();
  const [yearly, setYearly] = useState(false);

  const price = (monthly: number) => (yearly ? Math.round((monthly * (12 - yearlyMonthsFree)) / 12) : monthly);

  return (
    <section id="pricing" className="scroll-mt-24 border-y border-line/60 bg-bg-2/60 py-24">
      <div className="container-page">
        <SectionHeading eyebrow={t('pricing.eyebrow')} title={t('pricing.title')} description={t('pricing.description')} />

        <div className="mt-10 flex justify-center">
          <div className="inline-flex rounded-xl border border-line bg-card p-1" role="radiogroup">
            {[false, true].map((isYearly) => (
              <button
                key={String(isYearly)}
                role="radio"
                aria-checked={yearly === isYearly}
                onClick={() => setYearly(isYearly)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  yearly === isYearly ? 'bg-card-2 text-fg shadow' : 'text-muted hover:text-fg',
                )}
              >
                {isYearly ? t('pricing.yearly') : t('pricing.monthly')}
                {isYearly && <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[11px] text-brand-2">{t('pricing.yearlySave')}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-5 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <article
              key={plan.id}
              className={cn(
                'relative flex flex-col rounded-[var(--radius-card)] border p-7',
                plan.highlighted
                  ? 'border-brand/50 bg-gradient-to-b from-brand/[0.09] to-card shadow-[var(--shadow-glow)]'
                  : 'border-line bg-card',
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-7 inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-brand-ink">
                  <Sparkles className="size-3" />
                  {t('pricing.popular')}
                </span>
              )}
              <h3 className="font-display text-2xl font-semibold text-fg">{t(`pricing.plans.${plan.id}.name`)}</h3>
              <p className="mt-2 min-h-12 text-sm text-muted">{t(`pricing.plans.${plan.id}.desc`)}</p>

              <div className="mt-6 flex items-end gap-1">
                {plan.monthlyPrice === null ? (
                  <span className="font-display text-4xl font-semibold text-fg">{t('pricing.custom')}</span>
                ) : (
                  <>
                    <span className="font-display text-5xl font-semibold text-fg">
                      {pricingCurrency.symbol}
                      {price(plan.monthlyPrice)}
                    </span>
                    <span className="mb-1.5 text-sm text-muted">{t('pricing.perMonth')}</span>
                  </>
                )}
              </div>
              <p className="mt-1 h-5 text-xs text-subtle">{yearly && plan.monthlyPrice !== null ? t('pricing.billedYearly') : ''}</p>

              <ul className="mt-6 flex-1 space-y-3 border-t border-line pt-6">
                {plan.featureKeys.map((f) => (
                  <li key={f} className="flex gap-3 text-sm text-fg/90">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand-2" />
                    {t(`pricing.features.${f}`)}
                  </li>
                ))}
              </ul>

              <ButtonLink to={plan.cta.href} variant={plan.highlighted ? 'primary' : 'secondary'} fullWidth className="mt-8">
                {t(plan.cta.labelKey)}
              </ButtonLink>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
