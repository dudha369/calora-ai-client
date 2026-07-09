/**
 * DTO-типы для /api/weight
 */

/** Одна запись истории взвешиваний (для графика прогресса) */
export interface WeightRecord {
  id: number;
  user_id: number;
  weight_kg: number;
  recorded_at: string; // ISO datetime
  log_date: string | null; // YYYY-MM-DD, local date of measurement
}
