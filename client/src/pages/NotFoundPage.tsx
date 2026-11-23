import { Home } from 'lucide-react';
import { ButtonLink } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { useI18n } from '../contexts/I18nContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function NotFoundPage() {
  const { t } = useI18n();
  useDocumentTitle(t('notFound.title'));
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-6">
      <img src="/images/plated-dishes.jpg" alt="" className="absolute inset-0 -z-20 size-full object-cover opacity-15" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-bg/80 to-bg" />
      <div className="max-w-md text-center">
        <Logo className="justify-center" />
        <p className="mt-10 font-display text-7xl font-semibold text-gradient">404</p>
        <h1 className="mt-4 font-display text-2xl font-semibold text-fg">{t('notFound.title')}</h1>
        <p className="mt-2 text-muted">{t('notFound.body')}</p>
        <ButtonLink to="/" className="mt-8" icon={<Home className="size-4" />}>
          {t('notFound.home')}
        </ButtonLink>
      </div>
    </div>
  );
}
