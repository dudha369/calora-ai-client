import { request } from './request';
import type { DeleteResponse } from '../types/api/common';
import type {
  FoodAnalyzeResponse,
  FoodByDateResponse,
  FoodLogIn,
  BarcodeLogIn,
  CreateFoodLogResponse,
  FoodLog,
} from '../types/api/food';
import { toApiDate } from '../lib/date';

export const todayApiDate = (): string => toApiDate(new Date());

export const food = {
  /** notes — необязательное уточнение пользователя для ИИ (см. FoodNotesSheet) */
  analyze: (file: File, notes?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (notes) formData.append('notes', notes);
    return request<FoodAnalyzeResponse>('food/analyze', 'POST', formData);
  },

  log: (data: FoodLogIn) =>
    request<CreateFoodLogResponse>('food/log', 'POST', data),

  logBarcode: (payload: BarcodeLogIn) =>
    request<CreateFoodLogResponse>('food/log-barcode', 'POST', payload),

  getByDate: (date: string) => request<FoodByDateResponse>(`food/${date}`),

  remove: (logId: number) => request<DeleteResponse>(`food/${logId}`, 'DELETE'),

  deleteOrphanPhoto: (photoKey: string) =>
    request<DeleteResponse>(`food/photo/${photoKey}`, 'DELETE'),

  /**
   * Повторяет уже залогированную запись на сегодня.
   *
   * water_ml передаётся на уровне items — backend сам суммирует
   * и создаёт WaterLog, привязанный к новому FoodLog. Это означает,
   * что вода из повторённой записи будет корректно удалена вместе
   * с едой при следующем delete.
   */
  repeat: (log: FoodLog) =>
    request<CreateFoodLogResponse>('food/log', 'POST', {
      log_date: todayApiDate(),
      items: log.items.map((item) => ({
        food_name: item.food_name,
        portion_g: item.portion_g,
        calories: item.calories,
        protein_g: item.protein_g,
        fat_g: item.fat_g,
        carbs_g: item.carbs_g,
        fiber_g: item.fiber_g,
        sugar_g: item.sugar_g,
        water_ml: item.water_ml,
      })),
      // Нет явного water_ml на уровне лога — backend суммирует из items
    } satisfies FoodLogIn),
};
