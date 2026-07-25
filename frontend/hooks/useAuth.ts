'use client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import authService from '@/services/authService';
import type { LoginCredentials, RegisterData } from '@/types/auth.types';

export const useAuth = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setAuth, clearAuth, setLoading } = useAuthStore();

  const login = async (credentials: LoginCredentials, locale = 'en') => {
    setLoading(true);
    try {
      const { data } = await authService.login(credentials);
      setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
      router.push(`/${locale}/dashboard`);
      toast.success('Welcome back!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData: RegisterData, locale = 'en') => {
    setLoading(true);
    try {
      await authService.register(formData);
      toast.success('Account created! Please check your email to verify.');
      router.push(`/${locale}/login`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (locale = 'en') => {
    try {
      const refresh = localStorage.getItem('refreshToken') || '';
      await authService.logout(refresh);
    } catch {}
    clearAuth();
    router.push(`/${locale}/login`);
    toast.success('Logged out');
  };

  return { user, isAuthenticated, isLoading, login, register, logout };
};
