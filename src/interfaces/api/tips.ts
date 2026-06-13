/**
 * DTO-типы для /api/tips/*
 */

export type TipType =
  | 'macro_balance'
  | 'hydration'
  | 'overeating'
  | 'undereating'
  | 'streak_praise'
  | 'food_quality'
  | 'general';

export interface AiTip {
  id: number;
  user_id: number;
  tip_text: string;
  tip_type: TipType;
  icon: string;
  based_on_date: string; // YYYY-MM-DD
}

/**
 * Ответ GET /api/tips/today.
 * Если за сегодня ещё нет ни одной записи еды — бэкенд вместо AiTip
 * возвращает заглушку { tip: null, message }.
 */
export type TodayTipResponse = AiTip | { tip: null; message: string };
