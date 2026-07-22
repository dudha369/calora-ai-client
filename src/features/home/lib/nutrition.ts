import type {
  NutritionPer,
  NutritionForAmount,
  AllergenInfo,
} from '@/features/scanner/types/productData';
import type { NutritionGridStats } from '../components/NutritionGrid/NutritionGrid';

// ─── Rounding ────────────────────────────────────────────────────────────────

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

// ─── Nutrition calculations ───────────────────────────────────────────────────

/**
 * Вычисляет КБЖУ для произвольного кол-ва граммов продукта.
 * Используется и при логировании приёма пищи, и при пересчёте порции
 * товара по штрихкоду (см. BarcodeResultModal).
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
 * Общая логика для FoodResultModal, EditMealSheet и CopyMealSheet.
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
 * Канонический список аллергенов для UI-чеклиста в профиле — 14 основных
 * аллергенов, официально требуемых к декларированию в ЕС. Используется
 * страницей «Питание и здоровье» (NutritionPage) для выбора.
 */
export const ALLERGEN_KEYS = [
  'gluten',
  'milk',
  'eggs',
  'fish',
  'peanuts',
  'tree-nuts',
  'soybeans',
  'celery',
  'mustard',
  'sesame',
  'lupin',
  'molluscs',
  'crustaceans',
  'sulphites',
] as const;

/**
 * OpenFoodFacts использует несколько написаний для одного и того же
 * аллергена (nuts/tree-nuts, milk/dairy, sesame/sesame-seeds,
 * sulphites/sulfites/-dioxide...). Раскрываем выбор пользователя во все
 * синонимы перед сверкой с товаром — иначе, отметив «орехи», можно
 * пропустить продукт, помеченный конкретно как «tree-nuts», что для
 * функции безопасности недопустимо.
 */
const ALLERGEN_SYNONYMS: Partial<Record<string, string[]>> = {
  milk: ['dairy'],
  'tree-nuts': ['nuts'],
  sesame: ['sesame-seeds'],
  sulphites: ['sulfites', 'sulphur-dioxide', 'sulfur-dioxide'],
};

function expandAllergenSynonyms(keys: string[]): string[] {
  const expanded = new Set<string>(keys);
  for (const key of keys) {
    for (const synonym of ALLERGEN_SYNONYMS[key] ?? []) {
      expanded.add(synonym);
    }
  }
  return [...expanded];
}

/**
 * Проверяет пересечение аллергенов продукта со списком аллергенов
 * пользователя. Названия для отображения теперь берутся через i18n
 * (namespace `scanner_page`, ключи `allergens.<key>`).
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
 * Онбординг хранит грубые пищевые ограничения как список ключей
 * (см. Step8Restrictions: 'gluten_free', 'lactose_free', ...), а профиль
 * дополнительно хранит структурированный список конкретных аллергенов
 * (см. NutritionPage). Объединяем оба источника: явный список аллергенов —
 * основной сигнал, старая привязка через dietary_restrictions — для
 * пользователей, которые ещё не заходили на новую страницу настройки.
 */
const RESTRICTION_ALLERGEN_MAP: Partial<Record<string, string[]>> = {
  gluten_free: ['gluten'],
  lactose_free: ['milk', 'dairy'],
};

export function getUserAllergenKeys(
  dietaryRestrictions: string[] = [],
  explicitAllergens: string[] = [],
): string[] {
  const keys = new Set<string>(expandAllergenSynonyms(explicitAllergens));
  for (const restriction of dietaryRestrictions) {
    for (const allergen of RESTRICTION_ALLERGEN_MAP[restriction] ?? []) {
      keys.add(allergen);
    }
  }
  return [...keys];
}
