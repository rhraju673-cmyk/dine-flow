import { KeyRound, LogOut, Save, Store } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Alert, Badge } from '../../components/ui/Feedback';
import { Input, PasswordInput } from '../../components/ui/Field';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { useToast } from '../../contexts/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useFormErrors } from '../../hooks/useFormErrors';
import { authService } from '../../services/auth.service';

export function ProfileSettingsPage() {
  const { t } = useI18n();
  useDocumentTitle(t('profile.title'));
  const { user, memberships, setUser, logout } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? '');
  const [savingName, setSavingName] = useState(false);
  const details = useFormErrors();

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);
  const pwErrors = useFormErrors();

  async function saveName(e: FormEvent) {
    e.preventDefault();
    details.clear();
    setSavingName(true);
    try {
      const res = await authService.updateProfile(name);
      setUser(res.user);
      show(t('common.saved'));
    } catch (err) {
      details.handleError(err);
    } finally {
      setSavingName(false);
    }
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    pwErrors.clear();
    if (pw.next !== pw.confirm) {
      pwErrors.setFieldErrors({ confirm: t('profile.mismatch') });
      return;
    }
    setSavingPw(true);
    try {
      await authService.changePassword(pw.current, pw.next);
      setPw({ current: '', next: '', confirm: '' });
      show(t('profile.passwordChanged'));
    } catch (err) {
      pwErrors.handleError(err);
    } finally {
      setSavingPw(false);
    }
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-fg">{t('profile.title')}</h1>
        <p className="mt-2 text-muted">{t('profile.subtitle')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <form onSubmit={saveName} className="card space-y-5 p-6" noValidate>
            <div>
              <h2 className="font-semibold text-fg">{t('profile.details')}</h2>
              <p className="mt-1 text-sm text-muted">{t('profile.detailsDesc')}</p>
            </div>
            {details.formError && <Alert>{details.formError}</Alert>}
            <Input label={t('profile.name')} value={name} onChange={(e) => setName(e.target.value)} error={details.fieldErrors.name} autoComplete="name" />
            <Input label={t('profile.email')} value={user.email} disabled hint={t('profile.emailHint')} />
            <div className="flex justify-end">
              <Button type="submit" loading={savingName} icon={<Save className="size-4" />} disabled={name.trim() === user.name}>
                {t('common.save')}
              </Button>
            </div>
          </form>

          <form onSubmit={savePassword} className="card space-y-5 p-6" noValidate>
            <div>
              <h2 className="flex items-center gap-2 font-semibold text-fg">
                <KeyRound className="size-4 text-brand-2" /> {t('profile.password')}
              </h2>
              <p className="mt-1 text-sm text-muted">{t('profile.passwordDesc')}</p>
            </div>
            {pwErrors.formError && <Alert>{pwErrors.formError}</Alert>}
            <PasswordInput
              label={t('profile.currentPassword')}
              autoComplete="current-password"
              value={pw.current}
              onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
              error={pwErrors.fieldErrors.currentPassword}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <PasswordInput
                label={t('profile.newPassword')}
                autoComplete="new-password"
                value={pw.next}
                onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
                error={pwErrors.fieldErrors.newPassword}
                hint={t('auth.register.passwordHint')}
              />
              <PasswordInput
                label={t('profile.confirmPassword')}
                autoComplete="new-password"
                value={pw.confirm}
                onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                error={pwErrors.fieldErrors.confirm}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="secondary" loading={savingPw} disabled={!pw.current || !pw.next}>
                {t('profile.updatePassword')}
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="font-semibold text-fg">{t('profile.memberships')}</h2>
            <ul className="mt-4 space-y-2">
              {memberships.map((m) => (
                <li key={m.restaurant.id} className="flex items-center gap-3 rounded-xl border border-line bg-bg-2 px-3 py-2.5">
                  <Store className="size-4 text-brand-2" />
                  <span className="flex-1 truncate text-sm text-fg">{m.restaurant.name}</span>
                  <Badge tone="brand">{t(`roles.${m.role}`)}</Badge>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-6">
            <h2 className="font-semibold text-fg">{t('profile.session')}</h2>
            <p className="mt-1 text-sm text-muted">{t('profile.sessionDesc')}</p>
            <Button
              variant="danger"
              className="mt-4"
              icon={<LogOut className="size-4" />}
              onClick={async () => {
                await logout();
                navigate('/login', { replace: true });
              }}
            >
              {t('common.signOut')}
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
