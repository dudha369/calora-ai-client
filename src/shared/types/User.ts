export interface User {
  telegram_id: number;
  full_name: string;
  username: string | null;
  language_code: string;
  max_streak: number;
  current_streak: number;
  streak_active_today: boolean;
  quests_completed: number;
  created_at: string;
  last_active_at: string | null;
  is_active: boolean;
}
