import { request } from './request';
import type { DeleteResponse } from '../types/api/common';
import type { FavoriteMeal, FavoriteMealIn } from '../types/api/favorites';

export const favorites = {
  getAll: () => request<FavoriteMeal[]>('favorites'),
  create: (data: FavoriteMealIn) =>
    request<FavoriteMeal>('favorites', 'POST', data),
  remove: (id: number) => request<DeleteResponse>(`favorites/${id}`, 'DELETE'),

  /** Сохранена ли копия этого лога в избранном — null, если нет */
  getByLog: (logId: number) =>
    request<FavoriteMeal | null>(`favorites/by-log/${logId}`),
  removeByLog: (logId: number) =>
    request<DeleteResponse>(`favorites/by-log/${logId}`, 'DELETE'),
};
