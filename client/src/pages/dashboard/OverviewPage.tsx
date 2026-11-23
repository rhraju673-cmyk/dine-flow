import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Check,
  Circle,
  Clock,
  CreditCard,
  LineChart,
  Lock,
  Percent,
  QrCode,
  ShieldCheck,
  Store,
  UtensilsCrossed,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SetupRadial } from '../../components/dashboard/SetupRadial';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Alert, Badge, EmptyState, ProgressBar } from '../../components/ui/Feedback';
import { useI18n } from '../../contexts/I18nContext';
import { useApi } from '../../hooks/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { restaurantService } from '../../services/restaurant.service';
import { cn } from '../../utils/cn';
import { formatDate, formatNumber, greetingKey } from '../../utils/format';

/** Where each checklist item links to. */
const checklistLinks: Record<string, string> = {
  completeProfile: '/dashboard/settings#general',
  configureTaxes: '/dashboard/settings#charges',
  setOpeningHours: '/dashboard/settings#hours',
  addMenu: '/dashboard/menu',
  setupTables: '/dashboard/tables',
  inviteStaff: '/dashboard/waiters',
};

function OverviewSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden>
      <div className="h-48 rounded-[var(--radius-card)] bg-card" />
      <div className="grid gap-5 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-52 rounded-[var(--radius-card)] bg-card" />
        ))}
      </div>
      <div className="h-80 rounded-[var(--radius-card)] bg-card" />
    </div>
  );
}

export function OverviewPage() {
  const { t, locale } = useI18n();
  useDocumentTitle(t('dashboard.nav.overview'));
  const { data, loading, error, reload } = useApi(() => restaurantService.overview(), []);

  if (loading && !data) return <OverviewSkeleton />;
  if (error || !data) {
    return (
      <div className="card p-6">
        <Alert>{t('errors.loadFailed')}</Alert>
        <Button variant="secondary" className="mt-4" onClick={() => void reload()}>
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  const { restaurant, subscription, profileCompletion, setup, user, role } = data;
  const firstName = user.name.split(' ')[0] ?? user.name;
  const available = setup.checklist.filter((c) => c.available);
  const done = available.filter((c) => c.complete).length;
  const missing = profileCompletion.fields.filter((f) => !f.complete);

  const days = subscription?.trialDaysRemaining;
  // Trial length is configurable (TRIAL_DAYS), so derive it from the real dates.
  const trialTotal = subscription?.trialEndsAt
    ? Math.max(1, Math.round((new Date(subscription.trialEndsAt).getTime() - new Date(restaurant.createdAt).getTime()) / 86_400_000))
    : 1;
  const trialLabel =
    days == null ? null : days === 0 ? t('dashboard.subscription.trialOver') : days === 1 ? t('dashboard.subscription.dayLeft') : t('dashboard.subscription.daysLeft', { n: formatNumber(days, locale) });

  const quickActions = [
    { key: 'editProfile', icon: Store, to: '/dashboard/settings#general' },
    { key: 'hours', icon: Clock, to: '/dashboard/settings#hours' },
    { key: 'charges', icon: Percent, to: '/dashboard/settings#charges' },
    { key: 'account', icon: ShieldCheck, to: '/dashboard/profile' },
    { key: 'menu', icon: UtensilsCrossed, to: '/dashboard/menu', soon: true },
    { key: 'qr', icon: QrCode, to: '/dashboard/tables', soon: true },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-[var(--radius-card)] border border-line">
        <img src={restaurant.coverImage || '/images/restaurant-floor.jpg'} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/90 to-bg/40" />
        <div className="relative flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-brand-2">{t('dashboard.signedInAs', { role: t(`roles.${role}`) })}</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-fg sm:text-4xl">
              {t(`dashboard.greeting.${greetingKey()}`, { name: firstName })}
            </h1>
            <p className="mt-2 text-muted">{t('dashboard.subtitle', { restaurant: restaurant.name })}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge tone={restaurant.status === 'ACTIVE' ? 'success' : 'warning'} dot>
                {t('dashboard.restaurantStatus')}: {t(`status.${restaurant.status}`)}
              </Badge>
              <Badge>{t(`categories.${restaurant.category}`)}</Badge>
              <Badge>
                {restaurant.currency} · {restaurant.timezone.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>
          <ButtonLink to="/dashboard/settings" variant="secondary" iconRight={<ArrowRight className="size-4" />}>
            {t('dashboard.viewSettings')}
          </ButtonLink>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Setup progress */}
        <section className="card p-6">
          <h2 className="font-semibold text-fg">{t('dashboard.setup.title')}</h2>
          <p className="mt-1 text-sm text-muted">{t('dashboard.setup.subtitle', { done: formatNumber(done, locale), total: formatNumber(available.length, locale) })}</p>
          <div className="mt-5 flex justify-center">
            <SetupRadial percent={setup.percent} label={t('dashboard.setup.title')} />
          </div>
        </section>

        {/* Subscription */}
        <section className="card flex flex-col p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-fg">{t('dashboard.subscription.title')}</h2>
            <CreditCard className="size-5 text-muted" />
          </div>
          {subscription ? (
            <>
              <div className="mt-5 flex items-center gap-2">
                <span className="font-display text-2xl font-semibold text-fg">{subscription.plan ? t(`plans.${subscription.plan}`) : '—'}</span>
                {subscription.status && (
                  <Badge tone={subscription.status === 'TRIALING' ? 'brand' : subscription.status === 'ACTIVE' ? 'success' : 'warning'}>
                    {t(`status.${subscription.status}`)}
                  </Badge>
                )}
              </div>
              {trialLabel && (
                <div className="mt-5 space-y-2">
                  <p className="text-sm text-fg">{trialLabel}</p>
                  <ProgressBar value={((trialTotal - Math.min(days ?? 0, trialTotal)) / trialTotal) * 100} />
                  {subscription.trialEndsAt && (
                    <p className="flex items-center gap-1.5 text-xs text-subtle">
                      <CalendarClock className="size-3.5" />
                      {t('dashboard.subscription.trialEnds', { date: formatDate(subscription.trialEndsAt, locale) })}
                    </p>
                  )}
                </div>
              )}
              <p className="mt-auto pt-5 text-xs text-subtle">{t('dashboard.subscription.paymentsSoon')}</p>
            </>
          ) : (
            <p className="mt-5 flex items-center gap-2 text-sm text-muted">
              <Lock className="size-4" /> —
            </p>
          )}
        </section>

        {/* Profile completion */}
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-fg">{t('dashboard.profile.title')}</h2>
            <span className="font-display text-2xl font-semibold text-brand-2">{profileCompletion.percent}%</span>
          </div>
          <ProgressBar value={profileCompletion.percent} className="mt-4" />
          {missing.length === 0 ? (
            <p className="mt-5 flex items-center gap-2 text-sm text-success">
              <BadgeCheck className="size-4" /> {t('dashboard.profile.complete')}
            </p>
          ) : (
            <>
              <p className="mt-5 text-xs font-medium tracking-wide text-subtle uppercase">{t('dashboard.profile.missing')}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {missing.map((f) => (
                  <Link key={f.key} to="/dashboard/settings" className="rounded-full border border-line px-2.5 py-1 text-xs text-muted hover:border-brand/40 hover:text-brand-2">
                    {t(`dashboard.profile.fields.${f.key}`)}
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        {/* Getting started */}
        <section className="card p-6">
          <h2 className="font-semibold text-fg">{t('dashboard.checklist.title')}</h2>
          <p className="mt-1 text-sm text-muted">{t('dashboard.checklist.subtitle')}</p>
          <ul className="mt-5 space-y-1">
            {setup.checklist.map((item) => (
              <li key={item.key} className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5', !item.complete && item.available && 'hover:bg-white/[0.03]')}>
                <span
                  className={cn(
                    'grid size-6 shrink-0 place-items-center rounded-full border',
                    item.complete ? 'border-success/40 bg-success/15 text-success' : 'border-line text-subtle',
                  )}
                >
                  {item.complete ? <Check className="size-3.5" strokeWidth={3} /> : <Circle className="size-2 fill-current" />}
                </span>
                <span className={cn('flex-1 text-sm', item.complete ? 'text-muted line-through decoration-line-2' : item.available ? 'text-fg' : 'text-muted')}>
                  {t(`dashboard.checklist.items.${item.key}`)}
                </span>
                {!item.available ? (
                  <Badge>{t('common.comingSoon')}</Badge>
                ) : (
                  !item.complete &&
                  checklistLinks[item.key] && (
                    <Link to={checklistLinks[item.key]!} className="text-sm font-medium text-brand-2 hover:underline">
                      {t('dashboard.checklist.go')}
                    </Link>
                  )
                )}
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-5">
          {/* Account */}
          <section className="card p-6">
            <h2 className="font-semibold text-fg">{t('dashboard.account.title')}</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                [t('dashboard.account.name'), user.name],
                [t('dashboard.account.email'), user.email],
                [t('dashboard.account.role'), t(`roles.${role}`)],
                [t('dashboard.account.since'), formatDate(restaurant.createdAt, locale)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-muted">{k}</dt>
                  <dd className="truncate text-right text-fg">{v}</dd>
                </div>
              ))}
            </dl>
            <ButtonLink to="/dashboard/profile" variant="secondary" size="sm" fullWidth className="mt-5">
              {t('dashboard.account.manage')}
            </ButtonLink>
          </section>

          {/* Honest empty state instead of fake revenue */}
          <section className="card">
            <EmptyState
              icon={<LineChart className="size-5" />}
              title={t('dashboard.insights.title')}
              body={t('dashboard.insights.empty')}
              action={
                <ButtonLink to="/dashboard/analytics" variant="ghost" size="sm" iconRight={<ArrowRight className="size-4" />}>
                  {t('dashboard.insights.cta')}
                </ButtonLink>
              }
            />
          </section>
        </div>
      </div>

      {/* Quick actions */}
      <section>
        <h2 className="mb-4 font-semibold text-fg">{t('dashboard.quick.title')}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map(({ key, icon: Icon, to, soon }) => (
            <Link
              key={key}
              to={to}
              className="group flex items-start gap-4 rounded-[var(--radius-card)] border border-line bg-card p-5 transition-colors hover:border-line-2 hover:bg-card-2"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-bg-2 text-brand-2">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 font-medium text-fg">
                  {t(`dashboard.quick.${key}.title`)}
                  {soon && <Badge>{t('common.comingSoon')}</Badge>}
                </span>
                <span className="mt-1 block text-sm text-muted">{t(`dashboard.quick.${key}.desc`)}</span>
              </span>
              <ArrowRight className="mt-1 size-4 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-brand-2" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
