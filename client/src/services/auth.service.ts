import type { MeResponse, User } from '../types/api';
import { api } from './api';

export const authService = {
  me: () => api.get<MeResponse>('/api/auth/me'),
  login: (email: string, password: string) => api.post<MeResponse>('/api/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post<MeResponse>('/api/auth/register', { name, email, password }),
  logout: () => api.post<void>('/api/auth/logout'),
  updateProfile: (name: string) => api.patch<{ user: User }>('/api/auth/me', { name }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<{ ok: true }>('/api/auth/change-password', { currentPassword, newPassword }),
};
