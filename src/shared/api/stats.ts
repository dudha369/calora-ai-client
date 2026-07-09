import { request } from './request';
import type { DailyStats, ActiveDatesResponse } from '../types/api/stats';

export const stats = {
  /** GET /api/stats/daily?date=YYYY-MM-DD */
  getDaily: (date: string) =>
    request<DailyStats>(`stats/daily?date=${date}`),

  /**
   * GET /api/stats/active-dates?from=YYYY-MM-DD&to=YYYY-MM-DD
   * Возвращает только те даты, за которые что-то залогировано.
   * Используется для окраски дат в карусели.
   */
  getActiveDates: (from: string, to: string) =>
    request<ActiveDatesResponse>(`stats/active-dates?from=${from}&to=${to}`),
};
