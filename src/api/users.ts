import { request } from './request';
import type { UserData } from '../interfaces/UserData';
import type {
  RestoreStreakResponse,
  StreakInfo,
} from '../interfaces/api/streak.ts';

export const users = {
  /** GET /api/users/me — текущий пользователь + профиль + цели */
  getMe: () => request<UserData>('users/me'),

  getStreak: () => request<StreakInfo>('users/streak'),
  restoreStreak: () =>
    request<RestoreStreakResponse>('users/streak/restore', 'POST'),

  /** DELETE /api/users/me — полное и безвозвратное удаление аккаунта */
  deleteAccount: () => request('users/me', 'DELETE'),
};
