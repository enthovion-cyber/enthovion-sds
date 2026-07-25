import { cookies } from 'next/headers';

export const getServerToken = async (): Promise<string | undefined> => {
  const cookieStore = await cookies();
  return cookieStore.get('accessToken')?.value;
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getServerToken();
  return !!token;
};