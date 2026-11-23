/**
 * All application routes.
 * To add a dashboard page: create it in src/pages/dashboard/, add a <Route>
 * below, and set its module to 'available' in src/config/modules.ts.
 */
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { GuestRoute, ProtectedRoute, RequireRestaurant } from './components/routing/Guards';
import { dashboardModules } from './config/modules';
import { AuthProvider } from './contexts/AuthContext';
import { I18nProvider } from './contexts/I18nContext';
import { ToastProvider } from './contexts/ToastContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ComingSoonPage } from './pages/dashboard/ComingSoonPage';
import { OverviewPage } from './pages/dashboard/OverviewPage';
import { ProfileSettingsPage } from './pages/dashboard/ProfileSettingsPage';
import { RestaurantSettingsPage } from './pages/dashboard/RestaurantSettingsPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { RegisterPage } from './pages/RegisterPage';

export default function App() {
  return (
    <I18nProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />

              <Route element={<GuestRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route element={<RequireRestaurant />}>
                  <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<OverviewPage />} />
                    <Route path="settings" element={<RestaurantSettingsPage />} />
                    <Route path="profile" element={<ProfileSettingsPage />} />
                    {/* Modules planned for later phases */}
                    {dashboardModules
                      .filter((m) => m.status === 'coming-soon')
                      .map((m) => (
                        <Route key={m.key} path={m.path.replace('/dashboard/', '')} element={<ComingSoonPage module={m} />} />
                      ))}
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </I18nProvider>
  );
}
