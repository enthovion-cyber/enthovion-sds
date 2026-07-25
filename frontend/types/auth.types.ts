export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'ehs_manager' | 'worker';
  emailVerified: boolean;
  company?: string;
  phone?: string;
  jobTitle?: string;
  preferredLanguage?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
  company?: string;
}

export interface ForgotPasswordData { email: string }
export interface VerifyOtpData { email: string; otp: string }
export interface ResetPasswordData { resetToken: string; newPassword: string; confirmPassword: string }
export interface ChangePasswordData { currentPassword: string; newPassword: string; confirmPassword: string }
