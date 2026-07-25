import { cookies } from 'next/headers';

export const getServerToken = (): string | undefined => {
  const cookieStore = cookies();
  return cookieStore.get('accessToken')?.value;
};

export const isAuthenticated = (): boolean => {
  return !!getServerToken();
};
