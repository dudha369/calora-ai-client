import type { Profile, Gender, GoalType, ActivityLevel, WaterTrack } from '../Profile';
import type { Goal } from '../Goal';

/**
 * Тело запроса POST/PUT /api/profile.
 * Поля с дефолтами на бэкенде (ProfileIn в api/profile.py) сделаны опциональными.
 */
export interface ProfileIn {
  gender: Gender;
  age: number;
  height_cm: number;
  weight_kg: number;
  goal_type: GoalType;
  activity_level: ActivityLevel;
  height_unit?: 'cm' | 'ft';
  weight_unit?: 'kg' | 'lbs';
  target_weight_kg?: number | null;
  water_track?: WaterTrack;
  water_goal_ml?: number | null;
  dietary_restrictions?: string[];
  allergy_note?: string | null;
  medical_conditions?: string[];
}

/** Ответ POST/PUT /api/profile — профиль пересчитывается вместе с целями */
export interface ProfileResponse {
  profile: Profile;
  goal: Goal;
}
