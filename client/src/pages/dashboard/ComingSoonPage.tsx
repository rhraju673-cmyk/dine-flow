import { ArrowLeft, CheckCircle2, Hourglass } from 'lucide-react';
import { ButtonLink } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Feedback';
import type { DashboardModule } from '../../config/modules';
import { useI18n } from '../../contexts/I18nContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

/** Honest placeholder for modules planned in later phases. */
export function ComingSoonPage({ module }: { module: DashboardModule }) {
  const { t, tList } = useI18n();
  const name = t(module.labelKey);
  useDocumentTitle(name);
  const items = tList(`moduleDetails.${module.key}`);

  return (
    <div className="card relative overflow-hidden">
      <div className="grid-pattern absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" aria-hidden />
      <div className="relative mx-auto max-w-2xl px-6 py-16 text-center sm:py-20">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-line bg-bg-2 text-brand-2">
          <module.icon className="size-7" />
        </div>
        <Badge tone="brand" className="mt-6">
          <Hourglass className="size-3" /> {t('comingSoon.planned', { phase: module.phase })}
        </Badge>
        <h1 className="mt-4 font-display text-3xl font-semibold text-fg">{t('comingSoon.title', { module: name })}</h1>
        <p className="mt-3 text-muted">{t('comingSoon.body', { phase: module.phase })}</p>

        {items.length > 0 && (
          <div className="mx-auto mt-8 max-w-sm rounded-xl border border-line bg-bg-2/80 p-5 text-left">
            <p className="text-xs font-semibold tracking-wide text-subtle uppercase">{t('comingSoon.whatsNext')}</p>
            <ul className="mt-3 space-y-2.5">
              {items.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-fg/90">
                  <CheckCircle2 className="size-4 text-brand-2/70" /> {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <ButtonLink to="/dashboard" variant="secondary" className="mt-8" icon={<ArrowLeft className="size-4" />}>
          {t('comingSoon.back')}
        </ButtonLink>
      </div>
    </div>
  );
}
