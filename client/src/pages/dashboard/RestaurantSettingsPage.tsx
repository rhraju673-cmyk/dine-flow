import { Copy, ImageOff, Info, Save } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Alert, PageLoader } from '../../components/ui/Feedback';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { imageGallery, restaurantCategories, type RestaurantCategory } from '../../config/app';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { useToast } from '../../contexts/ToastContext';
import { useApi } from '../../hooks/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useFormErrors } from '../../hooks/useFormErrors';
import { restaurantService } from '../../services/restaurant.service';
import type { DayKey, OpeningHours, Restaurant } from '../../types/api';
import { cn } from '../../utils/cn';
import { countryOptions, currencyOptions, timezoneOptions } from '../../utils/format';

const DAYS: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const defaultHours = (): OpeningHours =>
  Object.fromEntries(DAYS.map((d) => [d, { closed: false, open: '10:00', close: '22:00' }])) as OpeningHours;

interface FormState {
  name: string;
  category: RestaurantCategory;
  description: string;
  logo: string;
  coverImage: string;
  phone: string;
  email: string;
  address: string;
  country: string;
  currency: string;
  timezone: string;
  taxRate: string;
  serviceCharge: string;
  openingHours: OpeningHours | null;
}

function toForm(r: Restaurant): FormState {
  return {
    name: r.name,
    category: r.category,
    description: r.description ?? '',
    logo: r.logo ?? '',
    coverImage: r.coverImage ?? '',
    phone: r.phone ?? '',
    email: r.email ?? '',
    address: r.address ?? '',
    country: r.country,
    currency: r.currency,
    timezone: r.timezone,
    taxRate: String(r.settings?.taxRate ?? 0),
    serviceCharge: String(r.settings?.serviceCharge ?? 0),
    openingHours: r.settings?.openingHours ?? null,
  };
}

function Section({ id, title, desc, children }: { id: string; title: string; desc: string; children: ReactNode }) {
  return (
    <section id={id} className="grid scroll-mt-24 gap-6 border-b border-line py-8 last:border-0 lg:grid-cols-[260px_1fr]">
      <div>
        <h2 className="font-semibold text-fg">{title}</h2>
        <p className="mt-1 text-sm text-muted">{desc}</p>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function ImagePicker({
  label,
  value,
  onChange,
  error,
  disabled,
  round,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  disabled?: boolean;
  round?: boolean;
}) {
  const { t } = useI18n();
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [value]);
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-4">
        <div className={cn('grid shrink-0 place-items-center overflow-hidden border border-line bg-bg-2', round ? 'size-20 rounded-2xl' : 'h-20 w-32 rounded-xl')}>
          {value && !broken ? (
            <img src={value} alt="" className="size-full object-cover" onError={() => setBroken(true)} />
          ) : (
            <ImageOff className="size-5 text-subtle" />
          )}
        </div>
        <Input
          label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… or /images/…"
          error={error}
          disabled={disabled}
          optional
          wrapperClassName="flex-1"
        />
      </div>
      {!disabled && (
        <div>
          <p className="mb-2 text-xs text-subtle">{t('settings.fields.chooseGallery')}</p>
          <div className="flex flex-wrap gap-2">
            {imageGallery.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => onChange(src)}
                className={cn('size-11 overflow-hidden rounded-lg border-2 transition', value === src ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100')}
                aria-label={src}
              >
                <img src={src} alt="" className="size-full object-cover" loading="lazy" />
              </button>
            ))}
            {value && (
              <button type="button" onClick={() => onChange('')} className="h-11 rounded-lg border border-line px-3 text-xs text-muted hover:text-fg">
                {t('settings.fields.remove')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function RestaurantSettingsPage() {
  const { t, locale } = useI18n();
  useDocumentTitle(t('settings.title'));
  const { show } = useToast();
  const { refresh } = useAuth();
  const location = useLocation();
  const { data, loading, error, reload } = useApi(() => restaurantService.current(), []);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const { fieldErrors, formError, handleError, clear } = useFormErrors();

  const countries = useMemo(() => countryOptions(locale), [locale]);
  const currencies = useMemo(() => currencyOptions(locale), [locale]);
  const timezones = useMemo(() => timezoneOptions(), []);

  useEffect(() => {
    if (data) setForm(toForm(data.restaurant));
  }, [data]);

  // Scroll to #section when arriving from a checklist link.
  useEffect(() => {
    if (form && location.hash) document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(form), location.hash]);

  if (loading && !form) return <PageLoader label={t('common.loading')} />;
  if (error || !data || !form) {
    return (
      <div className="card p-6">
        <Alert>{t('errors.loadFailed')}</Alert>
        <Button variant="secondary" className="mt-4" onClick={() => void reload()}>
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  // The server enforces this too — the UI just avoids offering edits that would be rejected.
  const canEdit = data.role === 'RESTAURANT_OWNER' || data.role === 'RESTAURANT_MANAGER';
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => (f ? { ...f, [key]: value } : f));
  const setDay = (day: DayKey, patch: Partial<OpeningHours[DayKey]>) =>
    setForm((f) => (f && f.openingHours ? { ...f, openingHours: { ...f.openingHours, [day]: { ...f.openingHours[day], ...patch } } } : f));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    clear();
    setSaving(true);
    try {
      const res = await restaurantService.update({
        name: form.name,
        category: form.category,
        description: form.description,
        logo: form.logo,
        coverImage: form.coverImage,
        phone: form.phone,
        email: form.email,
        address: form.address,
        country: form.country,
        currency: form.currency,
        timezone: form.timezone,
        settings: {
          taxRate: Number(form.taxRate),
          serviceCharge: Number(form.serviceCharge),
          openingHours: form.openingHours,
        },
      });
      setForm(toForm(res.restaurant));
      await refresh(); // update sidebar name/logo
      show(t('common.saved'));
    } catch (err) {
      handleError(err);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-fg">{t('settings.title')}</h1>
          <p className="mt-2 max-w-2xl text-muted">{t('settings.subtitle')}</p>
        </div>
        {canEdit && (
          <Button type="submit" loading={saving} icon={<Save className="size-4" />}>
            {saving ? t('common.saving') : t('common.save')}
          </Button>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {!canEdit && <Alert tone="info">{t('settings.readOnly')}</Alert>}
        {formError && <Alert>{formError}</Alert>}
      </div>

      <fieldset disabled={!canEdit} className="card mt-6 px-6 sm:px-8">
        <Section id="general" title={t('settings.sections.general.title')} desc={t('settings.sections.general.desc')}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label={t('settings.fields.name')} value={form.name} onChange={(e) => set('name', e.target.value)} error={fieldErrors.name} required />
            <Select label={t('settings.fields.category')} value={form.category} onChange={(e) => set('category', e.target.value as RestaurantCategory)} error={fieldErrors.category}>
              {restaurantCategories.map((c) => (
                <option key={c} value={c}>
                  {t(`categories.${c}`)}
                </option>
              ))}
            </Select>
          </div>
          <Textarea
            label={t('settings.fields.description')}
            placeholder={t('settings.fields.descriptionPlaceholder')}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            error={fieldErrors.description}
            maxLength={1000}
            optional
          />
          <Input label={t('settings.fields.slug')} value={data.restaurant.slug} readOnly disabled hint={t('settings.fields.slugHint')} />
        </Section>

        <Section id="branding" title={t('settings.sections.branding.title')} desc={t('settings.sections.branding.desc')}>
          <ImagePicker label={t('settings.fields.logo')} value={form.logo} onChange={(v) => set('logo', v)} error={fieldErrors.logo} disabled={!canEdit} round />
          <ImagePicker label={t('settings.fields.coverImage')} value={form.coverImage} onChange={(v) => set('coverImage', v)} error={fieldErrors.coverImage} disabled={!canEdit} />
        </Section>

        <Section id="contact" title={t('settings.sections.contact.title')} desc={t('settings.sections.contact.desc')}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label={t('settings.fields.phone')} type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} error={fieldErrors.phone} />
            <Input label={t('settings.fields.email')} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={fieldErrors.email} />
          </div>
          <Input label={t('settings.fields.address')} value={form.address} onChange={(e) => set('address', e.target.value)} error={fieldErrors.address} />
        </Section>

        <Section id="regional" title={t('settings.sections.regional.title')} desc={t('settings.sections.regional.desc')}>
          <Select label={t('settings.fields.country')} value={form.country} onChange={(e) => set('country', e.target.value)} error={fieldErrors.country}>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </Select>
          <div className="grid gap-5 sm:grid-cols-2">
            <Select label={t('settings.fields.currency')} value={form.currency} onChange={(e) => set('currency', e.target.value)} error={fieldErrors.currency}>
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select label={t('settings.fields.timezone')} value={form.timezone} onChange={(e) => set('timezone', e.target.value)} error={fieldErrors.timezone}>
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace(/_/g, ' ')}
                </option>
              ))}
            </Select>
          </div>
        </Section>

        <Section id="charges" title={t('settings.sections.charges.title')} desc={t('settings.sections.charges.desc')}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label={t('settings.fields.taxRate')}
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={form.taxRate}
              onChange={(e) => set('taxRate', e.target.value)}
              error={fieldErrors['settings.taxRate']}
            />
            <Input
              label={t('settings.fields.serviceCharge')}
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={form.serviceCharge}
              onChange={(e) => set('serviceCharge', e.target.value)}
              error={fieldErrors['settings.serviceCharge']}
            />
          </div>
        </Section>

        <Section id="hours" title={t('settings.sections.hours.title')} desc={t('settings.sections.hours.desc')}>
          {!form.openingHours ? (
            <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-line-2 p-5">
              <p className="flex items-center gap-2 text-sm text-muted">
                <Info className="size-4" /> {t('settings.hours.notSet')}
              </p>
              {canEdit && (
                <Button type="button" variant="secondary" size="sm" onClick={() => set('openingHours', defaultHours())}>
                  {t('settings.hours.enable')}
                </Button>
              )}
            </div>
          ) : (
            <>
              <ul className="divide-y divide-line rounded-xl border border-line">
                {DAYS.map((day) => {
                  const h = form.openingHours![day];
                  return (
                    <li key={day} className="flex flex-wrap items-center gap-3 px-4 py-3">
                      <span className="w-28 text-sm font-medium text-fg">{t(`settings.hours.days.${day}`)}</span>
                      <label className="flex items-center gap-2 text-sm text-muted">
                        <input
                          type="checkbox"
                          checked={!h.closed}
                          onChange={(e) => setDay(day, { closed: !e.target.checked })}
                          className="size-4 accent-[var(--color-brand)]"
                        />
                        {h.closed ? t('settings.hours.closed') : t('settings.hours.open')}
                      </label>
                      {!h.closed && (
                        <div className="ml-auto flex items-center gap-2">
                          <input
                            type="time"
                            value={h.open}
                            onChange={(e) => setDay(day, { open: e.target.value })}
                            aria-label={`${t(`settings.hours.days.${day}`)} ${t('settings.hours.open')}`}
                            className="h-9 rounded-lg border border-line bg-bg-2 px-2 text-sm text-fg"
                          />
                          <span className="text-subtle">–</span>
                          <input
                            type="time"
                            value={h.close}
                            onChange={(e) => setDay(day, { close: e.target.value })}
                            aria-label={`${t(`settings.hours.days.${day}`)} ${t('settings.hours.closed')}`}
                            className="h-9 rounded-lg border border-line bg-bg-2 px-2 text-sm text-fg"
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              {canEdit && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={<Copy className="size-4" />}
                  onClick={() => {
                    const mon = form.openingHours!.mon;
                    set('openingHours', Object.fromEntries(DAYS.map((d) => [d, { ...mon }])) as OpeningHours);
                  }}
                >
                  {t('settings.hours.copyToAll')}
                </Button>
              )}
              {fieldErrors['settings.openingHours'] && <Alert>{fieldErrors['settings.openingHours']}</Alert>}
            </>
          )}
        </Section>
      </fieldset>

      {canEdit && (
        <div className="sticky bottom-4 mt-6 flex justify-end">
          <Button type="submit" size="lg" loading={saving} icon={<Save className="size-4" />} className="shadow-2xl">
            {saving ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      )}
    </form>
  );
}
