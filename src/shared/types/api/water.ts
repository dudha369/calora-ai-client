/**
 * DTO-типы для /api/water/*
 */

export interface LinkedFoodLogSummary {
  id: number;
  log_date: string; // YYYY-MM-DD
  meal_name: string | null;
  first_item_name: string | null;
  logged_at: string; // ISO datetime
}

export interface WaterLog {
  id: number;
  user_id: number;
  log_date: string;
  logged_at: string;
  amount_ml: number;
  notes: string | null;
  food_log_id: number | null;
  linked_food_log: LinkedFoodLogSummary | null;
}

export interface WaterIn {
  log_date: string;
  amount_ml: number;
  notes?: string;
  food_log_id?: number;
}

/** PATCH-тело: поле, не переданное вовсе, не трогается на бэкенде.
 *  Явный null — очищает заметку / отвязывает от еды. */
export interface WaterUpdateIn {
  notes?: string | null;
  food_log_id?: number | null;
}

/** Ответ GET /api/water/{date} */
export interface WaterByDateResponse {
  date: string;
  logs: WaterLog[];
  total_ml: number;
}
