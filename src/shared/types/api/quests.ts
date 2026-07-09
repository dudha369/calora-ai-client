/**
 * DTO-типы для /api/quests/*
 */

export type QuestStatus = 'active' | 'done' | 'failed';

export type QuestKey =
  | 'protein_goal'
  | 'streak'
  | 'photo_log'
  | 'hydration'
  | 'calorie_goal';

export interface Quest {
  id: number;
  user_id: number;
  quest_key: QuestKey;
  title: string;
  description: string;
  icon: string;
  target_value: number;
  current_value: number;
  status: QuestStatus;
  expires_at: string;       // ISO datetime
  completed_at: string | null;
}

/** Ответ POST /api/quests/generate */
export interface GenerateQuestsResponse {
  quests: Quest[];
}
