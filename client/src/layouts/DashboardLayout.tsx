import { ChevronDown, LogOut, Menu, Settings, Store, UserRound, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Feedback';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { Logo } from '../components/ui/Logo';
import { Modal } from '../components/ui/Modal';
import { dashboardModules } from '../config/modules';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { cn } from '../utils/cn';
import { initials } from '../utils/format';

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useI18n();
  const { currentMembership } = useAuth();
  const restaurant = currentMembership?.restaurant;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo to="/dashboard" />
      </div>

      {restaurant && (
        <div className="mx-3 mb-3 flex items-center gap-3 rounded-xl border border-line bg-card px-3 py-2.5">
          {restaurant.logo ? (
            <img src={restaurant.logo} alt="" className="size-9 rounded-lg object-cover" />
          ) : (
            <span className="grid size-9 place-items-center rounded-lg bg-brand/15 text-sm font-semibold text-brand-2">{initials(restaurant.name)}</span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-fg">{restaurant.name}</p>
            <p className="truncate text-xs text-subtle">{currentMembership && t(`roles.${currentMembership.role}`)}</p>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Dashboard">
        <ul className="space-y-0.5">
          {dashboardModules.map((m) => (
            <li key={m.key}>
              <NavLink
                to={m.path}
                end={m.path === '/dashboard'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive ? 'bg-brand/12 font-medium text-brand-2' : 'text-muted hover:bg-white/[0.04] hover:text-fg',
                    m.status === 'coming-soon' && !isActive && 'text-muted/75',
                  )
                }
              >
                <m.icon className="size-[18px] shrink-0" />
                <span className="flex-1 truncate">{t(m.labelKey)}</span>
                {m.status === 'coming-soon' && (
                  <span className="rounded-md border border-line px-1.5 py-px text-[10px] font-medium text-subtle" title={t('common.comingSoon')}>{t('common.soon')}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function UserMenu({ onSignOut }: { onSignOut: () => void }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  if (!user) return null;
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl py-1 pr-2 pl-1 hover:bg-white/5"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-brand-2 to-brand text-xs font-bold text-brand-ink">
          {initials(user.name)}
        </span>
        <span className="hidden max-w-36 truncate text-sm text-fg sm:block">{user.name}</span>
        <ChevronDown className="size-4 text-muted" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-60 animate-fade-up rounded-xl border border-line bg-card p-1.5 shadow-2xl">
          <div className="border-b border-line px-3 py-2.5">
            <p className="truncate text-sm font-medium text-fg">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <Link role="menuitem" to="/dashboard/profile" onClick={() => setOpen(false)} className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-fg hover:bg-white/5">
            <UserRound className="size-4 text-muted" /> {t('dashboard.userMenu.account')}
          </Link>
          <Link role="menuitem" to="/dashboard/settings" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-fg hover:bg-white/5">
            <Settings className="size-4 text-muted" /> {t('dashboard.userMenu.restaurant')}
          </Link>
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-danger/10"
          >
            <LogOut className="size-4" /> {t('common.signOut')}
          </button>
        </div>
      )}
    </div>
  );
}

/** Shell for all /dashboard pages: sidebar (drawer on mobile) + top bar. */
export function DashboardLayout() {
  const { t } = useI18n();
  const { logout, currentMembership } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  async function signOut() {
    setSigningOut(true);
    await logout();
    navigate('/login', { replace: true });
  }

  const status = currentMembership?.restaurant.status;

  return (
    <div className="min-h-dvh bg-bg lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="sticky top-0 hidden h-dvh border-r border-line bg-bg-2 lg:block">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 w-72 animate-fade-up border-r border-line bg-bg-2">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-3 rounded-lg p-1.5 text-muted hover:text-fg" aria-label={t('nav.closeMenu')}>
              <X className="size-5" />
            </button>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-bg/85 px-4 backdrop-blur-md sm:px-6">
          <button onClick={() => setMobileOpen(true)} className="grid size-9 place-items-center rounded-lg border border-line text-fg lg:hidden" aria-label={t('nav.openMenu')}>
            <Menu className="size-5" />
          </button>
          <div className="flex min-w-0 items-center gap-2.5">
            <Store className="hidden size-4 text-muted sm:block" />
            <span className="truncate text-sm font-medium text-fg">{currentMembership?.restaurant.name}</span>
            {status && (
              <Badge tone={status === 'ACTIVE' ? 'success' : 'warning'} dot>
                {t(`status.${status}`)}
              </Badge>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
            <UserMenu onSignOut={() => setConfirmSignOut(true)} />
          </div>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>

      <Modal
        open={confirmSignOut}
        onClose={() => setConfirmSignOut(false)}
        icon={<LogOut className="size-5" />}
        title={t('dashboard.userMenu.signOutTitle')}
        description={t('dashboard.userMenu.signOutBody')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmSignOut(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" loading={signingOut} onClick={() => void signOut()}>
              {t('common.signOut')}
            </Button>
          </>
        }
      />
    </div>
  );
}
