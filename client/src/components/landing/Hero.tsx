import { ArrowRight, BedDouble, ChefHat, Coffee, Play, QrCode, Sandwich, Store, UtensilsCrossed, Wine } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { Button, ButtonLink } from '../ui/Button';

const types = [
  { key: 'restaurants', icon: UtensilsCrossed },
  { key: 'cafes', icon: Coffee },
  { key: 'hotels', icon: BedDouble },
  { key: 'fastFood', icon: Sandwich },
  { key: 'fineDining', icon: Wine },
  { key: 'foodCourts', icon: Store },
];

export function Hero({ onExploreDemo }: { onExploreDemo: () => void }) {
  const { t } = useI18n();

  return (
    <section className="relative isolate overflow-hidden pt-28 pb-20 sm:pt-36 lg:min-h-[92vh] lg:pb-28">
      {/* Background photo with a directional fade so text stays readable */}
      <img
        src="/images/hero-restaurant.jpg"
        alt=""
        className="absolute inset-0 -z-20 size-full object-cover object-center opacity-55"
        fetchPriority="high"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-bg via-bg/90 to-bg/30" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-bg to-transparent" />

      <div className="container-page grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-medium text-brand-2">
            <span className="size-1.5 rounded-full bg-brand-2" />
            {t('hero.eyebrow')}
          </span>
          <h1 className="mt-6 font-display text-[2.6rem] leading-[1.05] font-semibold tracking-tight text-balance text-fg sm:text-6xl lg:text-[4.4rem]">
            {t('hero.title')}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted">{t('hero.description')}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink to="/register" size="lg" iconRight={<ArrowRight className="size-4" />}>
              {t('common.startTrial')}
            </ButtonLink>
            <Button variant="secondary" size="lg" icon={<Play className="size-4" />} onClick={onExploreDemo}>
              {t('common.exploreDemo')}
            </Button>
          </div>

          <div className="mt-12">
            <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">{t('hero.builtFor')}</p>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
              {types.map(({ key, icon: Icon }) => (
                <li key={key} className="flex items-center gap-2 text-sm text-muted">
                  <Icon className="size-4 text-brand-2/80" />
                  {t(`hero.types.${key}`)}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Floating product cards (illustrative) */}
        <div className="relative hidden h-[460px] lg:block" aria-hidden>
          <div className="absolute top-4 right-0 w-[300px] animate-float rounded-2xl border border-line bg-card/95 p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide text-brand-2 uppercase">{t('hero.card.newOrder')}</span>
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] text-success">{t('hero.card.table', { n: 7 })}</span>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { img: '/images/biryani.jpg', name: t('qr.phone.dishes.biryani'), qty: 2 },
                { img: '/images/salmon-bowl.jpg', name: t('qr.phone.dishes.bowl'), qty: 1 },
              ].map((d) => (
                <div key={d.name} className="flex items-center gap-3">
                  <img src={d.img} alt="" className="size-11 rounded-lg object-cover" />
                  <div className="flex-1 text-sm text-fg">{d.name}</div>
                  <span className="text-sm text-muted">×{d.qty}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-xs text-muted">
              <ChefHat className="size-4 text-brand-2" />
              {t('hero.card.sentToKitchen')}
            </div>
          </div>

          <div className="absolute bottom-6 left-4 w-[250px] rounded-2xl border border-line bg-card/95 p-5 shadow-2xl [animation-delay:1.5s] animate-float">
            <div className="flex items-center gap-4">
              <div className="grid size-16 place-items-center rounded-xl bg-fg text-bg">
                <QrCode className="size-11" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-fg">{t('hero.card.scan')}</p>
                <p className="mt-1 text-xs text-muted">{t('hero.card.noApp')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
