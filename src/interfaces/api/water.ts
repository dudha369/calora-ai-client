/**
 * DTO-типы для /api/water/*
 */

export interface WaterLog {
  id: number;
  user_id: number;
  log_date: string;  // YYYY-MM-DD
  logged_at: string;  // ISO datetime
  amount_ml: number;
}

/** Тело запроса POST /api/water */
export interface WaterIn {
  log_date: string; // YYYY-MM-DD
  amount_ml: number; // 250 | 400 | 500 ...
}

/** Ответ GET /api/water/{date} */
export interface WaterByDateResponse {
  date: string;
  logs: WaterLog[];
  total_ml: number;
}
