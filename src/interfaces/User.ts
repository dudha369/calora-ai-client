export interface User {
  telegram_id: number;
  full_name: string;
  username: string | null;
  language_code: string;
  current_streak: number;
  max_streak: number;
  quests_completed: number;
  created_at: string;
  last_active_at: string | null;
  is_active: boolean;
}
