import { request } from './request';
import type { DeleteResponse } from '../interfaces/api/common';
import type {
  FoodAnalyzeResponse,
  FoodByDateResponse,
  FoodLogIn,
  CreateFoodLogResponse,
} from '../interfaces/api/food';
import { toApiDate } from '../utils/date.ts';

export const food = {
  /**
   * POST /api/food/analyze — отправляет фото на анализ через Gemini.
   * Параллельно фото загружается в B2 (бэкенд) — ничего не сохраняется в БД.
   *
   * Возвращает распознанные блюда + photo_key, который нужно передать
   * в food.log(), чтобы привязать фото к записи при сохранении.
   */
  analyze: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<FoodAnalyzeResponse>('food/analyze', 'POST', formData);
  },

  /** POST /api/food/log — сохранить запись еды (после подтверждения пользователем) */
  log: (data: FoodLogIn) =>
    request<CreateFoodLogResponse>('food/log', 'POST', data),

  /** POST /api/food/log-barcode — запись по штрихкоду, всегда без фото (B2 не используется) */
  logBarcode: (payload) => request('food/log-barcode', 'POST', payload),

  /** GET /api/food/{date} — все записи еды за дату + суммарный КБЖУ за день */
  getByDate: (date: string) => request<FoodByDateResponse>(`food/${date}`),

  /** DELETE /api/food/{log_id} — удалить запись еды */
  remove: (logId: number) => request<DeleteResponse>(`food/${logId}`, 'DELETE'),
};

export const todayApiDate = (): string => toApiDate(new Date());
