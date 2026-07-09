export type StreakDayStatus = 'below' | 'met' | 'over';

export interface TodayProgress {
  calories: number;
  calories_goal: number;
  calories_min: number;
  calories_max: number;
  calories_remaining: number;
  status: StreakDayStatus;
}

export interface StreakInfo {
  current_streak: number;
  max_streak: number;
  streak_active_today: boolean;
  streak_restores_available: number;
  can_restore: boolean;
  today_progress: TodayProgress | null;
}

export interface RestoreStreakResponse {
  ok: boolean;
  restored_to: number;
  restores_remaining: number;
}
