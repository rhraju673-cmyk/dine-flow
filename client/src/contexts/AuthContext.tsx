/**
 * Holds the signed-in user for the whole app.
 * The source of truth is ALWAYS the server session (GET /api/auth/me) —
 * nothing about the user's role is trusted from local storage.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, ApiError } from '../services/api';
import { authService } from '../services/auth.service';
import type { Membership, User } from '../types/api';

type Status = 'loading' | 'authenticated' | 'anonymous';

interface AuthValue {
  status: Status;
  user: User | null;
  memberships: Membership[];
  /** The restaurant the dashboard shows (first membership in Phase 1). */
  currentMembership: Membership | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const me = await authService.me();
      setUser(me.user);
      setMemberships(me.memberships);
      setActiveId(me.activeRestaurantId ?? null);
      setStatus('authenticated');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
        setMemberships([]);
        setStatus('anonymous');
      } else {
        // Server unreachable: treat as signed out but keep the error visible in console.
        console.error(err);
        setStatus('anonymous');
      }
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      await authService.login(email, password);
      api.resetCsrf();
      await refresh();
    },
    [refresh],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await authService.register(name, email, password);
      api.resetCsrf();
      await refresh();
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      api.resetCsrf();
      setUser(null);
      setMemberships([]);
      setStatus('anonymous');
    }
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      status,
      user,
      memberships,
      currentMembership: memberships.find((m) => m.restaurant.id === activeId) ?? memberships[0] ?? null,
      login,
      register,
      logout,
      refresh,
      setUser,
    }),
    [status, user, memberships, activeId, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
