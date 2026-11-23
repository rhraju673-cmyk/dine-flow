import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { appDefaults, languages, type LanguageCode } from '../config/app';
import { dictionaries, interpolate, intlLocale, lookup } from '../i18n';

const STORAGE_KEY = 'dineflow.language';

interface I18nValue {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  /** Translate a key, e.g. t('hero.title') or t('dashboard.greeting.morning', { name: 'Arif' }) */
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** Translate a key that holds a list of strings. */
  tList: (key: string) => string[];
  /** Locale for Intl formatting (dates, numbers, currency). */
  locale: string;
}

const I18nContext = createContext<I18nValue | null>(null);

function initialLanguage(): LanguageCode {
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (saved && languages.some((l) => l.code === saved)) return saved as LanguageCode;
  return appDefaults.language;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(initialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = languages.find((l) => l.code === language)?.dir ?? 'ltr';
  }, [language]);

  const setLanguage = useCallback((code: LanguageCode) => {
    localStorage.setItem(STORAGE_KEY, code);
    setLanguageState(code);
  }, []);

  const value = useMemo<I18nValue>(() => {
    const dict = dictionaries[language];
    const fallback = dictionaries.en;
    return {
      language,
      setLanguage,
      locale: intlLocale[language],
      t: (key, vars) => {
        const found = lookup(dict, key) ?? lookup(fallback, key);
        if (typeof found !== 'string') {
          if (import.meta.env.DEV) console.warn(`[i18n] Missing translation: ${key}`);
          return key;
        }
        return interpolate(found, vars);
      },
      tList: (key) => {
        const found = lookup(dict, key) ?? lookup(fallback, key);
        return Array.isArray(found) ? (found as string[]) : [];
      },
    };
  }, [language, setLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
