/**
 * Landing sections that showcase specific modules:
 * QR ordering, restaurant management, kitchen display and waiter dashboard.
 * All UI mock-ups here are illustrative.
 */
import { Bell, Check, CheckCircle2, ChefHat, Globe2, Layers, Plus, Receipt, ShieldCheck, ShoppingBag, Timer, Users } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { SectionHeading } from '../ui/SectionHeading';

function CheckList({ keys, base }: { keys: string[]; base: string }) {
  const { t } = useI18n();
  return (
    <ul className="mt-8 space-y-3.5">
      {keys.map((k) => (
        <li key={k} className="flex gap-3 text-fg/90">
          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand/15 text-brand-2">
            <Check className="size-3" strokeWidth={3} />
          </span>
          {t(`${base}.${k}`)}
        </li>
      ))}
    </ul>
  );
}

export function QrBenefits() {
  const { t } = useI18n();
  const dishes = [
    { key: 'biryani', img: '/images/biryani.jpg', price: '৳ 450' },
    { key: 'curry', img: '/images/curry-spread.jpg', price: '৳ 380' },
    { key: 'bowl', img: '/images/salmon-bowl.jpg', price: '৳ 620' },
  ];
  return (
    <section id="qr-ordering" className="scroll-mt-24 py-24">
      <div className="container-page grid items-center gap-16 lg:grid-cols-2">
        <div className="relative order-2 lg:order-1">
          <img src="/images/guests-dining.jpg" alt="Guests enjoying dinner in a busy restaurant" className="h-[520px] w-full rounded-[2rem] object-cover" loading="lazy" />
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-bg/70 via-transparent to-transparent" />

          {/* Phone mock-up */}
          <div className="absolute -bottom-8 right-4 w-[250px] rounded-[2rem] border-[6px] border-[#0b0f18] bg-bg-2 p-3 shadow-2xl sm:right-10" aria-hidden>
            <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-line" />
            <p className="text-[11px] text-subtle">{t('qr.phone.greeting')}</p>
            <p className="font-display text-base font-semibold text-fg">Zaika Restaurant</p>
            <p className="mt-3 text-[11px] font-semibold tracking-wide text-brand-2 uppercase">{t('qr.phone.popular')}</p>
            <ul className="mt-2 space-y-2">
              {dishes.map((d) => (
                <li key={d.key} className="flex items-center gap-2.5 rounded-xl bg-card p-2">
                  <img src={d.img} alt="" className="size-10 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-fg">{t(`qr.phone.dishes.${d.key}`)}</p>
                    <p className="text-[11px] text-muted">{d.price}</p>
                  </div>
                  <span className="grid size-6 place-items-center rounded-full bg-brand text-brand-ink">
                    <Plus className="size-3.5" />
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-brand py-2 text-xs font-semibold text-brand-ink">
              <ShoppingBag className="size-3.5" />
              {t('qr.phone.viewCart', { n: 3 })}
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <SectionHeading align="left" eyebrow={t('qr.eyebrow')} title={t('qr.title')} description={t('qr.description')} />
          <CheckList base="qr.points" keys={['p1', 'p2', 'p3', 'p4']} />
        </div>
      </div>
    </section>
  );
}

export function ManagementBenefits() {
  const { t } = useI18n();
  const items = [
    { key: 'control', icon: Users },
    { key: 'multi', icon: Layers },
    { key: 'secure', icon: ShieldCheck },
    { key: 'local', icon: Globe2 },
  ];
  return (
    <section id="management" className="relative scroll-mt-24 overflow-hidden py-24">
      <img src="/images/bar-interior.jpg" alt="" className="absolute inset-0 -z-20 size-full object-cover opacity-20" loading="lazy" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-bg via-bg/85 to-bg" />
      <div className="container-page">
        <SectionHeading eyebrow={t('management.eyebrow')} title={t('management.title')} description={t('management.description')} />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ key, icon: Icon }) => (
            <article key={key} className="rounded-[var(--radius-card)] border border-line bg-card/80 p-6 backdrop-blur-sm">
              <Icon className="size-6 text-brand-2" />
              <h3 className="mt-5 font-semibold text-fg">{t(`management.items.${key}.title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(`management.items.${key}.desc`)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function KitchenPreview() {
  const { t } = useI18n();
  const columns = [
    { key: 'new', tone: 'border-t-info', tickets: [{ table: 12, min: 2, items: ['biryani', 'bowl'] }, { table: 2, min: 1, items: ['curry'] }] },
    { key: 'cooking', tone: 'border-t-warning', tickets: [{ table: 7, min: 9, items: ['biryani', 'curry'] }] },
    { key: 'ready', tone: 'border-t-success', tickets: [{ table: 3, min: 14, items: ['bowl'] }] },
  ];
  return (
    <section id="kitchen" className="scroll-mt-24 border-y border-line/60 bg-bg-2/60 py-24">
      <div className="container-page grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHeading align="left" eyebrow={t('kitchen.eyebrow')} title={t('kitchen.title')} description={t('kitchen.description')} />
          <CheckList base="kitchen.points" keys={['p1', 'p2', 'p3']} />
          <img src="/images/chef-plating.jpg" alt="Chef plating dishes under heat lamps" className="mt-10 hidden h-48 w-full rounded-2xl object-cover object-[center_20%] lg:block" loading="lazy" />
        </div>

        <div className="rounded-2xl border border-line bg-bg p-4 shadow-2xl" aria-label={t('common.sampleData')}>
          <div className="mb-4 flex items-center justify-between px-1">
            <span className="flex items-center gap-2 text-sm font-semibold text-fg">
              <ChefHat className="size-4 text-brand-2" /> Kitchen · Zaika
            </span>
            <span className="text-[11px] text-subtle">{t('common.sampleData')}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.key} className="rounded-xl bg-bg-2 p-3">
                <p className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">{t(`kitchen.columns.${col.key}`)}</p>
                <div className="space-y-3">
                  {col.tickets.map((tk) => (
                    <div key={tk.table} className={`rounded-lg border border-line border-t-2 bg-card p-3 ${col.tone}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-semibold text-fg">{t('kitchen.ticket.table', { n: tk.table })}</span>
                        <span className={`flex items-center gap-1 text-[11px] ${tk.min > 10 ? 'text-danger' : 'text-muted'}`}>
                          <Timer className="size-3" />
                          {t('kitchen.ticket.min', { n: tk.min })}
                        </span>
                      </div>
                      <ul className="mt-2 space-y-1">
                        {tk.items.map((i) => (
                          <li key={i} className="text-xs text-fg/85">
                            1× {t(`qr.phone.dishes.${i}`)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function WaiterPreview() {
  const { t } = useI18n();
  const calls = [
    { key: 'c1', icon: Receipt, tone: 'text-warning bg-warning/12' },
    { key: 'c2', icon: CheckCircle2, tone: 'text-success bg-success/12' },
    { key: 'c3', icon: Bell, tone: 'text-info bg-info/12' },
  ];
  return (
    <section id="waiter" className="scroll-mt-24 py-24">
      <div className="container-page grid items-center gap-14 lg:grid-cols-2">
        <div className="relative">
          <img src="/images/restaurant-floor.jpg" alt="Spacious restaurant dining floor" className="h-[460px] w-full rounded-[2rem] object-cover" loading="lazy" />
          <div className="absolute inset-x-6 bottom-6 space-y-2.5 sm:inset-x-auto sm:right-6 sm:w-80" aria-hidden>
            {calls.map(({ key, icon: Icon, tone }) => (
              <div key={key} className="flex items-center gap-3 rounded-xl border border-line bg-card/95 p-3 shadow-xl">
                <span className={`grid size-9 place-items-center rounded-lg ${tone}`}>
                  <Icon className="size-4" />
                </span>
                <span className="text-sm text-fg">{t(`waiter.calls.${key}`)}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionHeading align="left" eyebrow={t('waiter.eyebrow')} title={t('waiter.title')} description={t('waiter.description')} />
          <CheckList base="waiter.points" keys={['p1', 'p2', 'p3']} />
        </div>
      </div>
    </section>
  );
}
