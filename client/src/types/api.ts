/** Shapes of the data returned by the DineFlow API. */
import type { RestaurantCategory } from '../config/app';

export type PlatformRole = 'USER' | 'SUPER_ADMIN';
export type MembershipRole = 'RESTAURANT_OWNER' | 'RESTAURANT_MANAGER' | 'KITCHEN_STAFF' | 'WAITER';
export type RestaurantStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type SubscriptionPlan = 'STARTER' | 'GROWTH' | 'ENTERPRISE';
export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';

export interface User {
  id: string;
  name: string;
  email: string;
  platformRole: PlatformRole;
  createdAt: string;
}

export interface Membership {
  role: MembershipRole;
  restaurant: { id: string; name: string; slug: string; logo: string | null; status: RestaurantStatus };
}

export interface MeResponse {
  user: User;
  memberships: Membership[];
  activeRestaurantId?: string | null;
}

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type OpeningHours = Record<DayKey, { closed: boolean; open: string; close: string }>;

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  category: RestaurantCategory;
  description: string | null;
  logo: string | null;
  coverImage: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  country: string;
  currency: string;
  timezone: string;
  status: RestaurantStatus;
  createdAt: string;
  updatedAt: string;
  settings: { taxRate: number; serviceCharge: number; openingHours: OpeningHours | null; updatedAt: string } | null;
  subscription: { plan: SubscriptionPlan; status: SubscriptionStatus; trialEndsAt: string | null } | null;
}

export interface DashboardOverview {
  user: { id: string; name: string; email: string };
  role: MembershipRole;
  restaurant: Pick<
    Restaurant,
    'id' | 'name' | 'slug' | 'status' | 'category' | 'logo' | 'coverImage' | 'currency' | 'timezone' | 'country' | 'createdAt'
  >;
  subscription: {
    plan: SubscriptionPlan | null;
    status: SubscriptionStatus | null;
    trialEndsAt: string | null;
    trialDaysRemaining: number | null;
  } | null;
  profileCompletion: { percent: number; fields: { key: string; complete: boolean }[] };
  setup: { percent: number; checklist: { key: string; complete: boolean; available: boolean }[] };
}
