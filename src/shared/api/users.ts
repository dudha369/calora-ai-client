import { request } from './request';
import type { UserData } from '../types/UserData';
import type {
  RestoreStreakResponse,
  DeclineStreakRestoreResponse,
  StreakInfo,
} from '../types/api/streak';

export const users = {
  /** GET /api/users/me — текущий пользователь + профиль + цели */
  getMe: () => request<UserData>('users/me'),

  /** Персистит явный выбор языка для персонализации на бэкенде
   *  (рассылки, будущие уведомления). Не источник истины для UI —
   *  им остаётся CloudStorage, синхронизируемый через LanguageProvider. */
  updateLanguage: (languageCode: string) =>
    request('users/language', 'PATCH', { language_code: languageCode }),

  getStreak: () => request<StreakInfo>('users/streak'),
  restoreStreak: () =>
    request<RestoreStreakResponse>('users/streak/restore', 'POST'),
  /** Отказ от восстановления сгоревшей серии — без траты щита восстановления */
  declineStreakRestore: () =>
    request<DeclineStreakRestoreResponse>('users/streak/decline', 'POST'),

  /** DELETE /api/users/me — полное и безвозвратное удаление аккаунта */
  deleteAccount: () => request('users/me', 'DELETE'),
};
