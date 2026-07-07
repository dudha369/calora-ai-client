/**
 * DTO-типы для /api/water/*
 */

export interface WaterLog {
  id: number;
  user_id: number;
  log_date: string;
  logged_at: string;
  amount_ml: number;
  source_label: string | null;
}

export interface WaterIn {
  log_date: string;
  amount_ml: number;
  source_label?: string;
}

/** Ответ GET /api/water/{date} */
export interface WaterByDateResponse {
  date: string;
  logs: WaterLog[];
  total_ml: number;
}
