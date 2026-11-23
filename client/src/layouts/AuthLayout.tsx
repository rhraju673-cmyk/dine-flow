import type { ReactNode } from 'react';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { Logo } from '../components/ui/Logo';
import { useI18n } from '../contexts/I18nContext';

/** Split-screen layout for sign-in / sign-up / onboarding. */
export function AuthLayout({ children, image = '/images/food-spread.jpg', wide }: { children: ReactNode; image?: string; wide?: boolean }) {
  const { t } = useI18n();
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(0,0.9fr)]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <LanguageSwitcher />
        </div>
        <main className="flex flex-1 items-center justify-center py-10">
          <div className={wide ? 'w-full max-w-xl' : 'w-full max-w-sm'}>{children}</div>
        </main>
      </div>

      <aside className="relative hidden overflow-hidden border-l border-line lg:block">
        <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-bg/10" />
        <div className="absolute inset-x-10 bottom-12">
          <p className="font-display text-3xl leading-snug font-semibold text-balance text-fg">“{t('auth.side.quote')}”</p>
          <p className="mt-3 text-sm text-muted">{t('auth.side.caption')}</p>
        </div>
      </aside>
    </div>
  );
}
