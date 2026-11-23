/**
 * Dashboard modules — drives the sidebar.
 *
 * status:
 *   'available'   → links to a real page
 *   'coming-soon' → shows a "Coming Soon" badge and a placeholder page
 *
 * When you build a module in a later phase:
 *   1. create the page in src/pages/dashboard/
 *   2. add its route in src/App.tsx
 *   3. change its status here to 'available'
 */
import {
  BarChart3,
  ChefHat,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  QrCode,
  Settings,
  Users,
  UtensilsCrossed,
  ConciergeBell,
  type LucideIcon,
} from 'lucide-react';

export interface DashboardModule {
  key: string;
  labelKey: string;
  path: string;
  icon: LucideIcon;
  status: 'available' | 'coming-soon';
  /** Development phase in which the module is planned. */
  phase: number;
}

export const dashboardModules: DashboardModule[] = [
  { key: 'overview', labelKey: 'dashboard.nav.overview', path: '/dashboard', icon: LayoutDashboard, status: 'available', phase: 1 },
  { key: 'orders', labelKey: 'dashboard.nav.orders', path: '/dashboard/orders', icon: ClipboardList, status: 'coming-soon', phase: 3 },
  { key: 'menu', labelKey: 'dashboard.nav.menu', path: '/dashboard/menu', icon: UtensilsCrossed, status: 'coming-soon', phase: 2 },
  { key: 'tables', labelKey: 'dashboard.nav.tables', path: '/dashboard/tables', icon: QrCode, status: 'coming-soon', phase: 2 },
  { key: 'kitchen', labelKey: 'dashboard.nav.kitchen', path: '/dashboard/kitchen', icon: ChefHat, status: 'coming-soon', phase: 4 },
  { key: 'waiters', labelKey: 'dashboard.nav.waiters', path: '/dashboard/waiters', icon: ConciergeBell, status: 'coming-soon', phase: 4 },
  { key: 'customers', labelKey: 'dashboard.nav.customers', path: '/dashboard/customers', icon: Users, status: 'coming-soon', phase: 5 },
  { key: 'billing', labelKey: 'dashboard.nav.billing', path: '/dashboard/billing', icon: CreditCard, status: 'coming-soon', phase: 5 },
  { key: 'analytics', labelKey: 'dashboard.nav.analytics', path: '/dashboard/analytics', icon: BarChart3, status: 'coming-soon', phase: 5 },
  { key: 'settings', labelKey: 'dashboard.nav.settings', path: '/dashboard/settings', icon: Settings, status: 'available', phase: 1 },
];
