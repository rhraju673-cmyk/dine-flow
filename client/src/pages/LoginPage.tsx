import { FlaskConical } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Feedback';
import { Input, PasswordInput } from '../components/ui/Field';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useFormErrors } from '../hooks/useFormErrors';
import { AuthLayout } from '../layouts/AuthLayout';

/**
 * Development-only demo credentials (created by `npm run db:seed`).
 * `import.meta.env.DEV` is false in production builds, so this block —
 * and the credentials — are removed from the production bundle.
 */
const DEMO = import.meta.env.DEV ? { email: 'demo@dineflow.local', password: 'ZaikaDemo2026' } : null;

export function LoginPage() {
  const { t } = useI18n();
  useDocumentTitle(t('auth.login.title'));
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { fieldErrors, formError, handleError, clear } = useFormErrors();

  useEffect(() => {
    if (DEMO && params.get('demo') === '1') {
      setEmail(DEMO.email);
      setPassword(DEMO.password);
    }
  }, [params]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    clear();
    setLoading(true);
    try {
      await login(email, password);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from && from.startsWith('/dashboard') ? from : '/dashboard', { replace: true });
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout image="/images/fine-dining.jpg">
      <h1 className="font-display text-3xl font-semibold text-fg">{t('auth.login.title')}</h1>
      <p className="mt-2 text-muted">{t('auth.login.subtitle')}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        {formError && <Alert>{formError}</Alert>}
        <Input
          label={t('auth.fields.email')}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          required
          autoFocus
        />
        <PasswordInput
          label={t('auth.fields.password')}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          required
        />
        <Button type="submit" fullWidth size="lg" loading={loading}>
          {t('auth.login.submit')}
        </Button>
      </form>

      {DEMO && (
        <button
          type="button"
          onClick={() => {
            setEmail(DEMO.email);
            setPassword(DEMO.password);
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line-2 px-4 py-2.5 text-sm text-muted hover:border-brand/50 hover:text-brand-2"
        >
          <FlaskConical className="size-4" />
          {t('auth.login.useDemo')}
          <span className="text-xs text-subtle">· {t('auth.login.demoHint')}</span>
        </button>
      )}

      <p className="mt-8 text-center text-sm text-muted">
        {t('auth.login.noAccount')}{' '}
        <Link to="/register" className="font-medium text-brand-2 hover:underline">
          {t('auth.login.createAccount')}
        </Link>
      </p>
    </AuthLayout>
  );
}
