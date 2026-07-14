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
  max_restores_per_month: number;
  can_restore: boolean;
  lost_streak_value: number | null;
  restore_deadline: string | null;
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
