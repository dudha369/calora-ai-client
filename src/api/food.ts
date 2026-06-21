import { request } from './request';
import type { DeleteResponse } from '../interfaces/api/common';
import type {
  FoodAnalyzeResponse,
  FoodByDateResponse,
  FoodLogIn,
  BarcodeLogIn,
  CreateFoodLogResponse,
  FoodLog,
} from '../interfaces/api/food';
import { toApiDate } from '../utils/date';

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
   * Намеренно без отдельного backend-эндпоинта: переиспользует уже
   * загруженные `log.items` через обычный POST /food/log — пересчёт
   * total_*, начисление стрика и инвалидация кэша работают так же, как
   * при обычном логировании, без дублирования логики. Фото и вода исходной
   * записи не переносятся: фото физически не копируется, а вода привязана
   * не к FoodLog, а к отдельной WaterLog-записи в момент исходного лога.
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
      })),
    } satisfies FoodLogIn),
};
