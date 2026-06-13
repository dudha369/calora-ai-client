import { request } from './request';
import type { AiTip, TodayTipResponse } from '../interfaces/api/tips';

export const tips = {
  /**
   * GET /api/tips/today — совет за сегодня (генерируется лениво на бэкенде).
   * Если за сегодня ещё нет ни одной записи еды, вернётся { tip: null, message }.
   */
  getToday: () => request<TodayTipResponse>('tips/today'),

  /** GET /api/tips — последние 7 советов */
  getRecent: () => request<AiTip[]>('tips'),
};
