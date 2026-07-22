import type { Profile } from '../types/Profile';
import type { ProfileIn } from '../types/api/profile';

/**
 * Profile → ProfileIn для PUT /api/profile.
 *
 * ВАЖНО: PUT заменяет профиль целиком — любое поле, отсутствующее в теле
 * запроса, откатится к дефолту бэкенда. Поэтому сюда нужно включать ВСЕ
 * поля профиля, а не только те, что редактирует конкретная страница —
 * иначе, например, включение отслеживания воды на WaterPage тихо стёрло бы
 * сохранённые аллергены, timezone или мед. состояния пользователя.
 */
export function profileToInput(p: Profile): ProfileIn {
  return {
    gender: p.gender,
    birth_date: p.birth_date,
    height_cm: p.height_cm,
    weight_kg: p.weight_kg,
    goal_type: p.goal_type,
    activity_level: p.activity_level,
    target_weight_kg: p.target_weight_kg,
    water_track: p.water_track,
    water_goal_ml: p.water_goal_ml,
    dietary_restrictions: p.dietary_restrictions,
    allergy_note: p.allergy_note,
    medical_conditions: p.medical_conditions,
    allergens: p.allergens,
    timezone: p.timezone,
    units_preference: p.units_preference,
  };
}
