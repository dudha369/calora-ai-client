import type {
  NutritionPer,
  NutritionForAmount,
  AllergenInfo,
} from '@/features/scanner/types/productData';
import type { NutritionGridStats } from '@/features/home/components/NutritionStats/NutritionGrid';

// ─── Rounding ────────────────────────────────────────────────────────────────

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

// ─── Nutrition calculations ───────────────────────────────────────────────────

/**
 * Вычисляет КБЖУ для произвольного кол-ва граммов продукта.
 * Используется и при логировании приёма пищи, и при пересчёте порции
 * товара по штрихкоду (см. BarcodeResultModal).
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
 * Минимальный набор полей, из которого можно посчитать суммарные totals
 * (КБЖУ + клетчатка/сахар/вода) по списку блюд/items.
 */
interface NutritionSource {
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g?: number;
  sugar_g?: number;
  water_ml?: number;
}

const EMPTY_TOTALS: NutritionGridStats = {
  total_calories: 0,
  total_protein_g: 0,
  total_fat_g: 0,
  total_carbs_g: 0,
  total_fiber_g: 0,
  total_sugar_g: 0,
  total_water_ml: 0,
};

/**
 * Суммирует КБЖУ+клетчатка/сахар/вода по списку блюд/items.
 * Общая логика для FoodResultModal, EditMealSheet и CopyMealSheet —
 * раньше один и тот же .reduce() был скопирован в трёх местах.
 */
export function sumNutrition<T extends NutritionSource>(
  items: T[],
): NutritionGridStats {
  return items.reduce(
    (acc, d) => ({
      total_calories: acc.total_calories + d.calories,
      total_protein_g: round1(acc.total_protein_g + d.protein_g),
      total_fat_g: round1(acc.total_fat_g + d.fat_g),
      total_carbs_g: round1(acc.total_carbs_g + d.carbs_g),
      total_fiber_g: round1(acc.total_fiber_g + (d.fiber_g ?? 0)),
      total_sugar_g: round1(acc.total_sugar_g + (d.sugar_g ?? 0)),
      total_water_ml: acc.total_water_ml + (d.water_ml ?? 0),
    }),
    EMPTY_TOTALS,
  );
}

// ─── Allergens ────────────────────────────────────────────────────────────────

/**
 * Проверяет пересечение аллергенов продукта со списком аллергенов
 * пользователя. Названия для отображения теперь берутся через i18n
 * (namespace `scanner_page`, ключи `allergens.<key>`) — раньше здесь лежали
 * захардкоженные RU/EN словари без UA и в обход общей системы локализации.
 *
 * @example
 * const userAllergens = ['gluten', 'milk']
 * const result = checkProductAllergens(product.allergens, userAllergens)
 * if (result.confirmed.length > 0) showAllergenWarning(result.confirmed)
 */
export function checkProductAllergens(
  productAllergens: AllergenInfo,
  userAllergens: string[],
): { confirmed: string[]; possible: string[] } {
  return {
    confirmed: productAllergens.confirmed.filter((a) =>
      userAllergens.includes(a),
    ),
    possible: productAllergens.traces.filter((a) => userAllergens.includes(a)),
  };
}

/**
 * Онбординг хранит пищевые ограничения как список ключей
 * (см. Step8Restrictions), а не как структурированный список аллергенов
 * OpenFoodFacts. Сопоставляем то, что сопоставляется однозначно —
 * вегетарианство/веганство/халяль/кошер это не аллергия и намеренно
 * сюда не мэппятся.
 */
const RESTRICTION_ALLERGEN_MAP: Partial<Record<string, string[]>> = {
  gluten_free: ['gluten'],
  lactose_free: ['milk', 'dairy'],
};

export function getUserAllergenKeys(
  dietaryRestrictions: string[] = [],
): string[] {
  const keys = new Set<string>();
  for (const restriction of dietaryRestrictions) {
    for (const allergen of RESTRICTION_ALLERGEN_MAP[restriction] ?? []) {
      keys.add(allergen);
    }
  }
  return [...keys];
}
