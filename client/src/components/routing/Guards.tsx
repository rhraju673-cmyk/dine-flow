/**
 * Route guards. These only improve navigation — the SERVER enforces
 * every permission, so hiding a page here is never the security boundary.
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { PageLoader } from '../ui/Feedback';

function Loading() {
  const { t } = useI18n();
  return (
    <div className="min-h-dvh">
      <PageLoader label={t('common.loading')} />
    </div>
  );
}

/** Only for signed-in users; others go to /login (and come back afterwards). */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <Loading />;
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/** Only for signed-out users (login/register); signed-in users go to the dashboard. */
export function GuestRoute() {
  const { status } = useAuth();
  if (status === 'loading') return <Loading />;
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

/** Dashboard requires a restaurant; users without one finish onboarding first. */
export function RequireRestaurant() {
  const { memberships } = useAuth();
  if (memberships.length === 0) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}
