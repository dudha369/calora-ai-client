/**
 * DTO-типы для /api/stats/*
 */

/** Ответ GET /api/stats/daily?date=YYYY-MM-DD */
export interface DailyStats {
  // Потреблено
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  water_ml: number;
  // Цели (DailyGoal пользователя; нули, если онбординг не пройден)
  calories_goal: number;
  protein_goal_g: number;
  fat_goal_g: number;
  carbs_goal_g: number;
  water_goal_ml: number;
  /** Есть ли хоть одна запись в FoodLog или WaterLog за этот день */
  has_data: boolean;
}

/** Одна дата с флагами наличия записей */
export interface ActiveDateEntry {
  date: string; // YYYY-MM-DD
  has_food: boolean;
  has_water: boolean;
}

/** Ответ GET /api/stats/active-dates?from=...&to=... */
export interface ActiveDatesResponse {
  dates: ActiveDateEntry[];
}
