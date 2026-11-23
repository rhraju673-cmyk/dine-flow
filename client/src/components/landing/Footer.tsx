import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { brand } from '../../config/brand';
import { footerNav } from '../../config/navigation';
import { useI18n } from '../../contexts/I18nContext';
import { ButtonLink } from '../ui/Button';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { Logo } from '../ui/Logo';

const socialIcons = { facebook: Facebook, instagram: Instagram, linkedin: Linkedin, x: Twitter };

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-line bg-bg-2">
      {/* Final call to action */}
      <div className="container-page">
        <div className="relative -translate-y-1/2 overflow-hidden rounded-3xl border border-brand/30 bg-card px-8 py-10 sm:px-12">
          <img src="/images/food-spread.jpg" alt="" className="absolute inset-0 size-full object-cover opacity-25" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-r from-card via-card/90 to-card/40" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <p className="max-w-xl font-display text-2xl leading-snug font-semibold text-fg sm:text-3xl">{t('brand.tagline')}</p>
            <ButtonLink to="/register" size="lg">
              {t('common.startTrial')}
            </ButtonLink>
          </div>
        </div>
      </div>

      <div className="container-page -mt-4 grid gap-10 pb-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{t('footer.about')}</p>
          <div className="mt-5 flex gap-2">
            {(Object.keys(socialIcons) as (keyof typeof socialIcons)[])
              .filter((k) => brand.social[k])
              .map((k) => {
                const Icon = socialIcons[k];
                return (
                  <a
                    key={k}
                    href={brand.social[k]}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={k}
                    className="grid size-9 place-items-center rounded-lg border border-line text-muted hover:border-line-2 hover:text-fg"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
          </div>
        </div>

        {footerNav.map((col) => (
          <nav key={col.titleKey} aria-label={t(col.titleKey)}>
            <h3 className="text-sm font-semibold text-fg">{t(col.titleKey)}</h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.labelKey + link.href}>
                  {link.href.startsWith('/') ? (
                    <Link to={link.href} className="text-sm text-muted hover:text-fg">
                      {t(link.labelKey)}
                    </Link>
                  ) : (
                    <a href={link.href} className="text-sm text-muted hover:text-fg">
                      {t(link.labelKey)}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-6 text-xs text-subtle sm:flex-row">
          <p>
            © {brand.copyrightYear} {brand.name}. {t('footer.rights')}
          </p>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
