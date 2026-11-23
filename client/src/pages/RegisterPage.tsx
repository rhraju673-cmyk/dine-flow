import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Alert, Badge } from '../components/ui/Feedback';
import { Input, PasswordInput } from '../components/ui/Field';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useFormErrors } from '../hooks/useFormErrors';
import { AuthLayout } from '../layouts/AuthLayout';

export function RegisterPage() {
  const { t } = useI18n();
  useDocumentTitle(t('auth.register.title'));
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const plan = params.get('plan');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { fieldErrors, formError, handleError, clear } = useFormErrors();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    clear();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/onboarding', { replace: true });
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }

  const update = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <AuthLayout image="/images/chef-flames.jpg">
      {plan && ['starter', 'growth', 'enterprise'].includes(plan) && (
        <Badge tone="brand" className="mb-4">
          {t('auth.register.planSelected', { plan: t(`pricing.plans.${plan}.name`) })}
        </Badge>
      )}
      <h1 className="font-display text-3xl font-semibold text-fg">{t('auth.register.title')}</h1>
      <p className="mt-2 text-muted">{t('auth.register.subtitle')}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        {formError && <Alert>{formError}</Alert>}
        <Input label={t('auth.fields.name')} autoComplete="name" value={form.name} onChange={update('name')} error={fieldErrors.name} required autoFocus />
        <Input label={t('auth.fields.email')} type="email" autoComplete="email" value={form.email} onChange={update('email')} error={fieldErrors.email} required />
        <PasswordInput
          label={t('auth.fields.password')}
          autoComplete="new-password"
          value={form.password}
          onChange={update('password')}
          error={fieldErrors.password}
          hint={t('auth.register.passwordHint')}
          required
        />
        <Button type="submit" fullWidth size="lg" loading={loading}>
          {t('auth.register.submit')}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        {t('auth.register.haveAccount')}{' '}
        <Link to="/login" className="font-medium text-brand-2 hover:underline">
          {t('common.signIn')}
        </Link>
      </p>
    </AuthLayout>
  );
}
