export type StreakDayStatus = 'below' | 'met' | 'over';

export interface TodayProgress {
  calories: number;
  calories_goal: number;
  calories_min: number;
  calories_max: number;
  calories_remaining: number;
  status: StreakDayStatus;
}

export type GoalType = 'lose' | 'maintain' | 'gain';

export type WeekDayStatus = 'met' | 'missed' | 'restored' | 'none';

export interface WeekHistoryDay {
  date: string;
  status: WeekDayStatus;
}

export interface StreakInfo {
  current_streak: number;
  max_streak: number;
  streak_active_today: boolean;
  streak_restores_available: number;
  /** true только если серия реально потеряна, есть щиты и 48ч-окно ещё открыто */
  can_restore: boolean;
  /** Значение серии на момент обрыва. null, если обрыва нет ИЛИ он уже закрыт (restore/decline/новая серия) */
  lost_streak_value: number | null;
  /** ISO-дата дедлайна восстановления (обрыв + 48ч). null, если восстанавливать нечего */
  restore_deadline: string | null;
  /** true, если серия была потеряна и 48-часовое окно восстановления уже прошло */
  restore_expired: boolean;
  today_progress: TodayProgress | null;
  goal_type: GoalType | null;
  week_history: WeekHistoryDay[];
}

export interface RestoreStreakResponse {
  ok: boolean;
  restored_to: number;
  restores_remaining: number;
}

export interface DeclineStreakRestoreResponse {
  ok: boolean;
}
