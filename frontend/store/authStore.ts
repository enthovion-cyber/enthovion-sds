'use client';
import { create } from 'zustand';
import type { User } from '@/types/auth.types';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  setLoading: (v: boolean) => void;
  initFromStorage: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('authUser', JSON.stringify(user));
      // Also set cookie for middleware edge detection
      document.cookie = `accessToken=${accessToken}; path=/; max-age=900; SameSite=Lax`;
    }
    set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
  },

  setUser: (user) => set({ user }),

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('authUser');
      document.cookie = 'accessToken=; path=/; max-age=0';
    }
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (v) => set({ isLoading: v }),

  initFromStorage: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('accessToken');
    const refresh = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('authUser');
    let user = null;
    if (storedUser) {
      try {
        user = JSON.parse(storedUser);
      } catch {
        localStorage.removeItem('authUser');
      }
    }
    if (token && refresh) {
      document.cookie = `accessToken=${token}; path=/; max-age=900; SameSite=Lax`;
      set({ user, accessToken: token, refreshToken: refresh, isAuthenticated: true, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },
}));
