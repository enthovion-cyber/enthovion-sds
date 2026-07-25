import api from '@/lib/api';
import type { LoginCredentials, RegisterData, ForgotPasswordData, VerifyOtpData, ResetPasswordData, ChangePasswordData } from '@/types/auth.types';

const authService = {
  register: (data: RegisterData) => api.post('/auth/register', data),
  login: (data: LoginCredentials) => api.post('/auth/login', data),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  forgotPassword: (data: ForgotPasswordData) => api.post('/auth/forgot-password', data),
  verifyOtp: (data: VerifyOtpData) => api.post('/auth/verify-otp', data),
  resetPassword: (data: ResetPasswordData) => api.post('/auth/reset-password', data),
  changePassword: (data: ChangePasswordData) => api.post('/auth/change-password', data),
  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${token}`),
  resendVerify: () => api.post('/auth/resend-verify'),
  refreshToken: (refreshToken: string) => api.post('/auth/refresh-token', { refreshToken }),
};

export default authService;
