import type { NutritionPer, NutritionForAmount } from '@/features/scanner/types/productData';

// ─── Nutrition calculations ───────────────────────────────────────────────────

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Вычисляет КБЖУ для произвольного кол-ва граммов продукта.
 * Основная функция для логирования приёма пищи:
 *
 * @example
 * const nutrition = calcNutritionForAmount(product.per100g, 150)
 * // nutrition.calories — ккал в 150г продукта
 */
export function calcNutritionForAmount(
  per100g: NutritionPer,
  amountG: number,
): NutritionForAmount {
  const factor = amountG / 100;
  return {
    amountG,
    calories:
      per100g.calories !== null ? round1(per100g.calories * factor) : null,
    protein: per100g.protein !== null ? round1(per100g.protein * factor) : null,
    fat: per100g.fat !== null ? round1(per100g.fat * factor) : null,
    carbs: per100g.carbs !== null ? round1(per100g.carbs * factor) : null,
    sugars: per100g.sugars !== null ? round1(per100g.sugars * factor) : null,
    fiber: per100g.fiber !== null ? round1(per100g.fiber * factor) : null,
  };
}

/**
 * Проверяет содержатся ли в продукте аллергены из списка пользователя.
 *
 * @example
 * const userAllergens = ['gluten', 'milk']
 * const result = checkProductAllergens(product.allergens, userAllergens)
 * if (result.confirmed.length > 0) showAllergenWarning(result.confirmed)
 */
export function checkProductAllergens(
  productAllergens: { confirmed: string[]; traces: string[] },
  userAllergens: string[],
): { confirmed: string[]; possible: string[] } {
  return {
    confirmed: productAllergens.confirmed.filter((a) =>
      userAllergens.includes(a),
    ),
    possible: productAllergens.traces.filter((a) => userAllergens.includes(a)),
  };
}

// ─── Allergen names ───────────────────────────────────────────────────────────
// Все 14 основных аллергенов по стандарту EU + расширенные.
// Ключи соответствуют значениям из OFF API после удаления языкового префикса.

/** Русские названия аллергенов */
export const ALLERGEN_NAMES_RU: Record<string, string> = {
  gluten: 'Глютен',
  milk: 'Молоко',
  dairy: 'Молочные продукты',
  eggs: 'Яйца',
  fish: 'Рыба',
  peanuts: 'Арахис',
  nuts: 'Орехи',
  'tree-nuts': 'Орехи',
  soybeans: 'Соя',
  celery: 'Сельдерей',
  mustard: 'Горчица',
  'sesame-seeds': 'Кунжут',
  sesame: 'Кунжут',
  lupin: 'Люпин',
  molluscs: 'Моллюски',
  crustaceans: 'Ракообразные',
  'sulphur-dioxide': 'Диоксид серы / Сульфиты',
  sulphites: 'Сульфиты',
  'sulfur-dioxide': 'Диоксид серы',
  sulfites: 'Сульфиты',
};

/** Английские названия аллергенов */
export const ALLERGEN_NAMES_EN: Record<string, string> = {
  gluten: 'Gluten',
  milk: 'Milk',
  dairy: 'Dairy',
  eggs: 'Eggs',
  fish: 'Fish',
  peanuts: 'Peanuts',
  nuts: 'Nuts',
  'tree-nuts': 'Tree Nuts',
  soybeans: 'Soybeans',
  celery: 'Celery',
  mustard: 'Mustard',
  'sesame-seeds': 'Sesame Seeds',
  sesame: 'Sesame',
  lupin: 'Lupin',
  molluscs: 'Molluscs',
  crustaceans: 'Crustaceans',
  'sulphur-dioxide': 'Sulphur Dioxide / Sulphites',
  sulphites: 'Sulphites',
  'sulfur-dioxide': 'Sulfur Dioxide',
  sulfites: 'Sulfites',
};

/** Возвращает локализованное название аллергена (RU/EN fallback) */
export function getAllergenName(
  key: string,
  locale: 'ru' | 'en' = 'ru',
): string {
  const map = locale === 'ru' ? ALLERGEN_NAMES_RU : ALLERGEN_NAMES_EN;
  return map[key] ?? key;
}

// ─── NOVA group descriptions ──────────────────────────────────────────────────

export const NOVA_DESCRIPTIONS_RU: Record<number, string> = {
  1: 'Необработанный продукт',
  2: 'Кулинарный ингредиент',
  3: 'Обработанный продукт',
  4: 'Ультраобработанный продукт',
};
