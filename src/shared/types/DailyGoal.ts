/**
 * Дневная норма КБЖУ (DailyGoal), пересчитывается на бэкенде при изменении профиля.
 *
 * ВАЖНО: поле называется `fat_g` (как в DailyGoalSchema на бэкенде),
 * а не `fats_g` — раньше здесь была опечатка, из-за которой значение
 * жиров просто не доходило бы до UI при чтении этого поля.
 */
export interface DailyGoal {
  calories?: number;
  protein_g?: number;
  fat_g?: number;
  carbs_g?: number;
  water_ml: number;
  ai_tip?: string | null;
}
