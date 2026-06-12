import { request } from './request';

/** Статистика за конкретный день */
export interface DailyStats {
  // Потреблено
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  water_ml: number;
  // Цели (берутся из DailyGoal пользователя)
  calories_goal: number;
  protein_goal_g: number;
  fat_goal_g: number;
  carbs_goal_g: number;
  water_goal_ml: number;
  /** Есть ли хоть одна запись в FoodLog или WaterLog за этот день */
  has_data: boolean;
}

/** Список YYYY-MM-DD дат с хотя бы одной записью (для окраски карусели) */
export interface ActiveDatesResponse {
  dates: string[];
}

export const stats = {
  /** GET /api/stats/daily?date=YYYY-MM-DD */
  getDaily: (date: string) => request<DailyStats>(`stats/daily?date=${date}`),

  /**
   * GET /api/stats/active-dates?from=YYYY-MM-DD&to=YYYY-MM-DD
   * Возвращает только те даты, за которые что-то залогировано.
   * Используется для окраски дат в карусели.
   */
  getActiveDates: (from: string, to: string) =>
    request<ActiveDatesResponse>(`stats/active-dates?from=${from}&to=${to}`),
};
