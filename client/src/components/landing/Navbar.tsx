import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { landingNav } from '../../config/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { cn } from '../../utils/cn';
import { ButtonLink } from '../ui/Button';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { Logo } from '../ui/Logo';

export function Navbar() {
  const { t } = useI18n();
  const { status } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const signedIn = status === 'authenticated';

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-all duration-300',
        scrolled || open ? 'border-b border-line/70 bg-bg/90 backdrop-blur-md' : 'border-b border-transparent',
      )}
    >
      <nav className="container-page flex h-18 items-center justify-between gap-6" aria-label="Main">
        <Logo />

        <ul className="hidden items-center gap-1 lg:flex">
          {landingNav.map((item) => (
            <li key={item.href}>
              <a href={item.href} className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-fg">
                {t(item.labelKey)}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher />
          {signedIn ? (
            <ButtonLink to="/dashboard" size="sm">
              {t('common.dashboard')}
            </ButtonLink>
          ) : (
            <>
              <ButtonLink to="/login" variant="ghost" size="sm">
                {t('common.signIn')}
              </ButtonLink>
              <ButtonLink to="/register" size="sm">
                {t('common.startTrial')}
              </ButtonLink>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid size-9 place-items-center rounded-lg border border-line text-fg"
            aria-expanded={open}
            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="container-page animate-fade-up pb-6 lg:hidden">
          <ul className="space-y-1 border-t border-line pt-4">
            {landingNav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-fg hover:bg-white/5"
                >
                  {t(item.labelKey)}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {signedIn ? (
              <ButtonLink to="/dashboard" className="col-span-2">
                {t('common.dashboard')}
              </ButtonLink>
            ) : (
              <>
                <ButtonLink to="/login" variant="secondary">
                  {t('common.signIn')}
                </ButtonLink>
                <ButtonLink to="/register">{t('common.startTrial')}</ButtonLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
