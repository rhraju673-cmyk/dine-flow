import { Check, Languages } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { languages } from '../../config/app';
import { useI18n } from '../../contexts/I18nContext';
import { cn } from '../../utils/cn';

/** Dropdown to switch between English, বাংলা and हिन्दी. */
export function LanguageSwitcher({ align = 'right', className }: { align?: 'left' | 'right'; className?: string }) {
  const { language, setLanguage, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = languages.find((l) => l.code === language)!;

  useEffect(() => {
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-2.5 text-sm text-muted transition-colors hover:border-line-2 hover:text-fg"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('common.language')}
      >
        <Languages className="size-4" />
        <span className="font-medium">{current.short}</span>
      </button>
      {open && (
        <ul
          role="listbox"
          className={cn(
            'absolute z-50 mt-2 w-44 animate-fade-up overflow-hidden rounded-xl border border-line bg-card p-1 shadow-2xl',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {languages.map((l) => (
            <li key={l.code}>
              <button
                role="option"
                aria-selected={l.code === language}
                onClick={() => {
                  setLanguage(l.code);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5',
                  l.code === language ? 'text-brand-2' : 'text-fg',
                )}
              >
                {l.label}
                {l.code === language && <Check className="size-4" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
