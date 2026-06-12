import { request } from './request';
import type { UserData } from '../interfaces/UserData';

export const users = {
  /** GET /api/users/me — текущий пользователь + профиль + цели */
  getMe: () => request<UserData>('users/me'),

  /** DELETE /api/users/me — полное и безвозвратное удаление аккаунта */
  deleteAccount: () => request('users/me', 'DELETE'),
};
