import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
};

const setAuthCookie = (token: string | null) => {
  if (typeof document === 'undefined') {
    return;
  }

  if (!token) {
    document.cookie = 'access_token=; path=/; max-age=0';
    return;
  }

  document.cookie = `access_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, accessToken, refreshToken) => {
        setAuthCookie(accessToken);
        set({ user, accessToken, refreshToken });
      },
      updateUser: (user) => set((state) => ({ user: state.user ? { ...state.user, ...user } : null })),
      logout: () => {
        setAuthCookie(null);
        set({ user: null, accessToken: null, refreshToken: null });
      },
    }),
    {
      name: 'aalap-auth-store',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
