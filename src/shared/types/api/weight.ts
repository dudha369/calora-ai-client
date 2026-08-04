/**
 * DTO-типы для /api/weight
 */

/** Одна запись истории взвешиваний (для графика прогресса и списка WeightPage) */
export interface WeightRecord {
  id: number;
  user_id: number;
  weight_kg: number;
  recorded_at: string; // ISO datetime
  log_date: string | null; // YYYY-MM-DD, local date of measurement
  note: string | null;
}

export interface WeightLogIn {
  weight_kg: number;
  note?: string;
  log_date?: string;
}
