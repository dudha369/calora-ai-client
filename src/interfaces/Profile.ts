// ─── Union-типы значений профиля ─────────────────────────────────────────────
// Вынесены сюда (а не дублируются в interfaces/api/profile.ts), чтобы у домена
// и у DTO запроса/ответа была одна и та же "истина" про допустимые значения.

export type Gender = 'male' | 'female';
export type GoalType = 'lose' | 'maintain' | 'gain';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'extreme';
export type WaterTrack = 'auto' | 'manual' | 'none';

/**
 * Профиль пользователя — 1:1 с User.
 * Создаётся при завершении онбординга, обновляется через PUT /api/profile.
 */
export interface Profile {
  gender: Gender;
  age: number;
  height_cm: number;
  weight_kg: number;
  goal_type: GoalType;
  /** null, если goal_type === 'maintain' */
  target_weight_kg: number | null;
  activity_level: ActivityLevel;
  water_track: WaterTrack;
  /** null при water_track !== 'manual' */
  water_goal_ml: number | null;
  dietary_restrictions: string[];
  allergy_note: string | null;
  medical_conditions: string[];
}
