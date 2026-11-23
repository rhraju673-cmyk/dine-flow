import type { RestaurantCategory } from '../config/app';
import type { DashboardOverview, MembershipRole, OpeningHours, Restaurant } from '../types/api';
import { api } from './api';

export interface CreateRestaurantPayload {
  name: string;
  category: RestaurantCategory;
  phone: string;
  email: string;
  address: string;
  country: string;
  currency: string;
  timezone: string;
}

export type UpdateRestaurantPayload = Partial<
  Omit<CreateRestaurantPayload, 'phone' | 'email' | 'address'> & {
    description: string;
    logo: string;
    coverImage: string;
    phone: string;
    email: string;
    address: string;
    settings: { taxRate?: number; serviceCharge?: number; openingHours?: OpeningHours | null };
  }
>;

type RestaurantResponse = { restaurant: Restaurant; role: MembershipRole };

export const restaurantService = {
  create: (data: CreateRestaurantPayload) => api.post<RestaurantResponse>('/api/restaurants', data),
  current: () => api.get<RestaurantResponse>('/api/restaurants/current'),
  update: (data: UpdateRestaurantPayload) => api.patch<RestaurantResponse>('/api/restaurants/current', data),
  overview: () => api.get<DashboardOverview>('/api/dashboard/overview'),
};
