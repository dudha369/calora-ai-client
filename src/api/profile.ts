import { request } from './request';
import type { ProfileIn, ProfileResponse } from '../interfaces/api/profile';

export const profile = {
  /**
   * POST /api/profile — создать профиль напрямую, минуя онбординг
   * (для тестов/админки). Если профиль уже есть — бэкенд вернёт 400.
   */
  create: (data: ProfileIn) =>
    request<ProfileResponse>('profile', 'POST', data),

  /** PUT /api/profile — обновить профиль и пересчитать DailyGoal */
  update: (data: ProfileIn) =>
    request<ProfileResponse>('profile', 'PUT', data),
};
