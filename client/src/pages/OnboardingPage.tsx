import { ArrowLeft, ArrowRight, Check, LogOut, Sparkles } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Feedback';
import { Input, Select } from '../components/ui/Field';
import { appDefaults, countryCurrency, countryTimezone, restaurantCategories, type RestaurantCategory } from '../config/app';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useFormErrors } from '../hooks/useFormErrors';
import { AuthLayout } from '../layouts/AuthLayout';
import { restaurantService, type CreateRestaurantPayload } from '../services/restaurant.service';
import { cn } from '../utils/cn';
import { countryName, countryOptions, currencyOptions, timezoneOptions } from '../utils/format';

const STEPS = ['basics', 'contact', 'region', 'review'] as const;
/** Which form fields belong to which step (used to jump back to the step with an error). */
const FIELD_STEP: Record<string, number> = { name: 0, category: 0, phone: 1, email: 1, address: 1, country: 2, currency: 2, timezone: 2 };

function browserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || appDefaults.timezone;
  } catch {
    return appDefaults.timezone;
  }
}

export function OnboardingPage() {
  const { t, locale } = useI18n();
  useDocumentTitle(t('onboarding.title'));
  const { user, memberships, refresh, logout } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { fieldErrors, formError, handleError, clear, setFieldErrors } = useFormErrors();

  const [form, setForm] = useState<CreateRestaurantPayload>({
    name: '',
    category: 'CASUAL_DINING',
    phone: '',
    email: user?.email ?? '',
    address: '',
    country: appDefaults.country,
    currency: appDefaults.currency,
    timezone: browserTimezone() === 'UTC' ? appDefaults.timezone : browserTimezone(),
  });

  const countries = useMemo(() => countryOptions(locale), [locale]);
  const currencies = useMemo(() => currencyOptions(locale), [locale]);
  const timezones = useMemo(() => timezoneOptions(), []);

  // Already has a restaurant → straight to the dashboard.
  if (memberships.length > 0) return <Navigate to="/dashboard" replace />;

  const set = <K extends keyof CreateRestaurantPayload>(key: K, value: CreateRestaurantPayload[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  /** Light client-side checks so users get instant feedback; the server validates again. */
  function validateStep(index: number) {
    const errs: Record<string, string> = {};
    if (index === 0 && form.name.trim().length < 2) errs.name = t('errors.required');
    if (index === 1) {
      if (!/^\+?[0-9()\-\s.]{6,40}$/.test(form.phone.trim())) errs.phone = t('errors.invalid');
      if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = t('errors.invalid');
      if (form.address.trim().length < 5) errs.address = t('errors.required');
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function next(e?: FormEvent) {
    e?.preventDefault();
    if (step < STEPS.length - 1) {
      if (validateStep(step)) setStep((s) => s + 1);
      return;
    }
    void submit();
  }

  async function submit() {
    clear();
    setLoading(true);
    try {
      await restaurantService.create(form);
      await refresh();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      handleError(err);
      // Jump back to the first step that has a server-side error.
      const steps = Object.keys((err as { fields?: Record<string, string> }).fields ?? {}).map((f) => FIELD_STEP[f] ?? 3);
      if (steps.length) setStep(Math.min(...steps));
    } finally {
      setLoading(false);
    }
  }

  const reviewRows = [
    [t('onboarding.fields.name'), form.name],
    [t('onboarding.fields.category'), t(`categories.${form.category}`)],
    [t('onboarding.fields.phone'), form.phone],
    [t('onboarding.fields.email'), form.email],
    [t('onboarding.fields.address'), form.address],
    [t('onboarding.fields.country'), countryName(form.country, locale)],
    [t('onboarding.fields.currency'), form.currency],
    [t('onboarding.fields.timezone'), form.timezone],
  ];

  return (
    <AuthLayout image="/images/cafe-interior.jpg" wide>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-brand-2 uppercase">{t('onboarding.stepOf', { n: step + 1, total: STEPS.length })}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-fg">{t('onboarding.title')}</h1>
          <p className="mt-2 text-muted">{t('onboarding.subtitle')}</p>
        </div>
        <Button variant="ghost" size="sm" icon={<LogOut className="size-4" />} onClick={() => void logout()}>
          <span className="hidden sm:inline">{t('common.signOut')}</span>
        </Button>
      </div>

      {/* Stepper */}
      <ol className="mt-8 grid grid-cols-4 gap-2">
        {STEPS.map((s, i) => (
          <li key={s}>
            <div className={cn('h-1.5 rounded-full transition-colors', i <= step ? 'bg-brand' : 'bg-line')} />
            <p className={cn('mt-2 flex items-center gap-1 text-xs', i === step ? 'text-fg' : 'text-subtle')}>
              {i < step && <Check className="size-3 text-brand-2" />}
              {t(`onboarding.steps.${s}`)}
            </p>
          </li>
        ))}
      </ol>

      <form onSubmit={next} className="mt-8 space-y-5" noValidate>
        {formError && <Alert>{formError}</Alert>}

        {step === 0 && (
          <>
            <Input
              label={t('onboarding.fields.name')}
              placeholder={t('onboarding.fields.namePlaceholder')}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              error={fieldErrors.name}
              autoFocus
              required
            />
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-fg/90">{t('onboarding.fields.category')}</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {restaurantCategories.map((c) => (
                  <label
                    key={c}
                    className={cn(
                      'cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm transition-colors',
                      form.category === c ? 'border-brand bg-brand/10 text-brand-2' : 'border-line text-muted hover:border-line-2 hover:text-fg',
                    )}
                  >
                    <input type="radio" name="category" value={c} checked={form.category === c} onChange={() => set('category', c as RestaurantCategory)} className="sr-only" />
                    {t(`categories.${c}`)}
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        )}

        {step === 1 && (
          <>
            <Input label={t('onboarding.fields.phone')} type="tel" autoComplete="tel" placeholder="+880 1700-000000" value={form.phone} onChange={(e) => set('phone', e.target.value)} error={fieldErrors.phone} autoFocus required />
            <Input label={t('onboarding.fields.email')} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={fieldErrors.email} required />
            <Input label={t('onboarding.fields.address')} placeholder={t('onboarding.fields.addressPlaceholder')} autoComplete="street-address" value={form.address} onChange={(e) => set('address', e.target.value)} error={fieldErrors.address} required />
          </>
        )}

        {step === 2 && (
          <>
            <Select
              label={t('onboarding.fields.country')}
              value={form.country}
              onChange={(e) => {
                const country = e.target.value;
                setForm((f) => ({
                  ...f,
                  country,
                  currency: countryCurrency[country] ?? f.currency,
                  timezone: countryTimezone[country] ?? f.timezone,
                }));
              }}
              error={fieldErrors.country}
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </Select>
            <div className="grid gap-5 sm:grid-cols-2">
              <Select label={t('onboarding.fields.currency')} value={form.currency} onChange={(e) => set('currency', e.target.value)} error={fieldErrors.currency}>
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <Select label={t('onboarding.fields.timezone')} value={form.timezone} onChange={(e) => set('timezone', e.target.value)} error={fieldErrors.timezone}>
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace(/_/g, ' ')}
                  </option>
                ))}
              </Select>
            </div>
          </>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted">{t('onboarding.review')}</p>
            <dl className="divide-y divide-line rounded-xl border border-line bg-card">
              {reviewRows.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[140px_1fr] gap-3 px-4 py-3 text-sm">
                  <dt className="text-muted">{label}</dt>
                  <dd className="break-words text-fg">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="flex items-center gap-2 text-sm text-brand-2">
              <Sparkles className="size-4" />
              {t('onboarding.trial')}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-2">
          <Button type="button" variant="ghost" icon={<ArrowLeft className="size-4" />} onClick={() => setStep((s) => s - 1)} disabled={step === 0 || loading}>
            {t('common.back')}
          </Button>
          <Button type="submit" loading={loading} iconRight={step < 3 ? <ArrowRight className="size-4" /> : undefined}>
            {step < 3 ? t('common.next') : loading ? t('onboarding.creating') : t('onboarding.submit')}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
