import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { initData } from '@tma.js/sdk-react';
import { request } from '../api/request';
import type { UserData } from '../interfaces/UserData';

export type SessionState =
  | { status: 'booting' }
  | { status: 'auth_error' }
  | { status: 'access_denied' }
  | { status: 'ready'; userData: UserData | undefined };

const DEBUG_INIT_DATA = import.meta.env.VITE_DEBUG_INIT_DATA ?? '';

function isTelegramContext(ready: boolean): boolean {
  if (!ready) return true;
  if (DEBUG_INIT_DATA) return true;

  try {
    const raw = initData.raw();
    return typeof raw === 'string' && raw.length > 0;
  } catch {
    return false;
  }
}

function getApiStatus(error: unknown): number | undefined {
  return (error as { response?: { status?: number } } | null)?.response?.status;
}

export function useUserSession(ready: boolean): SessionState {
  const inTelegram = useMemo(() => isTelegramContext(ready), [ready]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await request<UserData>('users/me');
      return res.data;
    },
    enabled: ready && inTelegram,
    retry: (failureCount, err) => {
      const status = getApiStatus(err);
      if (status === 401 || status === 403) return false;
      return failureCount < 1;
    },
  });

  if (!ready || (inTelegram && isLoading)) return { status: 'booting' };
  if (!inTelegram || getApiStatus(error) === 401)
    return { status: 'auth_error' };
  if (getApiStatus(error) === 403) return { status: 'access_denied' };

  return { status: 'ready', userData: data };
}
