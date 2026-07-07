import axios from 'axios';
import type {
  ProductData,
  NutritionPer,
  AllergenInfo,
  NutriScore,
  NovaGroup,
} from '../types/productData';

const offAxios = axios.create({
  baseURL: 'https://world.openfoodfacts.org/api/v2',
  timeout: 10_000,
  headers: {
    'User-Agent': 'CaloraAI',
  },
});

const OFF_FIELDS = [
  // Основная информация
  'product_name',
  'brands',
  'image_front_url',
  'image_url',

  // Количество и порции
  'quantity', // строка с упаковки: "400 g", "1 l"
  'product_quantity', // числовое значение в г/мл (вычисляет сервер)
  'serving_size', // строка с упаковки: "30 g", "1 cup (240ml)"
  'serving_quantity', // числовое значение в г (вычисляет сервер)

  // Нутриенты: поля _100g ВСЕГДА присутствуют (сервер нормализует),
  // поля _serving присутствуют только если serving_quantity был вычислен.
  'nutriments',

  // Аллергены
  'allergens_tags', // ["en:gluten", "en:milk"]
  'traces_tags', // ["en:nuts"] — "может содержать следы"

  // Бонусные данные
  'nutrition_grades', // nutri-score: "a"|"b"|"c"|"d"|"e"
  'nova_group', // 1|2|3|4 — степень промышленной обработки
  'ingredients_text', // состав текстом
  'labels_tags', // ["en:organic", "en:vegan"]
].join(',');

// ─── Типы сырого ответа OFF ───────────────────────────────────────────────────

interface OFFNutriments {
  // Калории
  'energy-kcal_100g'?: number;
  'energy-kcal_serving'?: number;
  // Белки
  proteins_100g?: number;
  proteins_serving?: number;
  // Жиры
  fat_100g?: number;
  fat_serving?: number;
  // Углеводы
  carbohydrates_100g?: number;
  carbohydrates_serving?: number;
  // Сахара
  sugars_100g?: number;
  sugars_serving?: number;
  // Клетчатка
  fiber_100g?: number;
  fiber_serving?: number;
}

interface OFFProduct {
  product_name?: string;
  brands?: string;
  image_front_url?: string;
  image_url?: string;
  quantity?: string;
  product_quantity?: number;
  serving_size?: string;
  serving_quantity?: number;
  nutriments?: OFFNutriments;
  allergens_tags?: string[];
  traces_tags?: string[];
  nutrition_grades?: string;
  nova_group?: number;
  ingredients_text?: string;
  labels_tags?: string[];
}

interface OFFResponse {
  status: 0 | 1;
  status_verbose: string;
  product?: OFFProduct;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function extractNutritionPer100g(n: OFFNutriments): NutritionPer {
  return {
    calories: n['energy-kcal_100g'] ?? null,
    protein: n['proteins_100g'] ?? null,
    fat: n['fat_100g'] ?? null,
    carbs: n['carbohydrates_100g'] ?? null,
    sugars: n['sugars_100g'] ?? null,
    fiber: n['fiber_100g'] ?? null,
  };
}

/**
 * Пытается взять _serving поля напрямую из ответа OFF.
 * Они присутствуют только если сервер вычислил serving_quantity.
 */
function extractNutritionPerServingFromAPI(
  n: OFFNutriments,
): NutritionPer | null {
  // Проверяем наличие хотя бы одного _serving значения
  if (
    n['energy-kcal_serving'] === undefined &&
    n['proteins_serving'] === undefined
  ) {
    return null;
  }
  return {
    calories: n['energy-kcal_serving'] ?? null,
    protein: n['proteins_serving'] ?? null,
    fat: n['fat_serving'] ?? null,
    carbs: n['carbohydrates_serving'] ?? null,
    sugars: n['sugars_serving'] ?? null,
    fiber: n['fiber_serving'] ?? null,
  };
}

/**
 * Масштабирует NutritionPer на произвольное кол-во граммов.
 * Используется для porServing и perPackage — оба вычисляются из per100g.
 */
function scaleNutrition(per100g: NutritionPer, amountG: number): NutritionPer {
  const factor = amountG / 100;
  return {
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
 * Теги OFF имеют формат "en:gluten", "fr:lait" и т.д.
 * Отрезаем языковой префикс.
 */
function parseAllergenTags(tags: string[] = []): string[] {
  return tags.map((tag) => tag.replace(/^[a-z]{2}:/, '')).filter(Boolean);
}

const VALID_NUTRI_SCORES = new Set(['a', 'b', 'c', 'd', 'e']);
const VALID_NOVA_GROUPS = new Set([1, 2, 3, 4]);

const ALLOWED_LABELS = new Set([
  'organic',
  'vegan',
  'vegetarian',
  'fair-trade',
  'no-additives',
  'no-artificial-flavors',
  'no-artificial-colors',
  'no-preservatives',
  'gluten-free',
  'lactose-free',
]);

function parseLabels(tags: string[] = []): string[] {
  return tags
    .map((tag) => tag.replace(/^[a-z]{2}:/, ''))
    .filter((label) => ALLOWED_LABELS.has(label));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

/**
 * Запрашивает данные о продукте по штрихкоду из Open Food Facts.
 * Возвращает null если продукт не найден в базе.
 *
 * Использует production endpoint: world.openfoodfacts.org
 * (не .net — это staging окружение)
 */
export async function fetchProductByBarcode(
  barcode: string,
): Promise<ProductData | null> {
  const { data } = await offAxios.get<OFFResponse>(`/product/${barcode}.json`, {
    params: { fields: OFF_FIELDS },
  });
  // console.log(data);

  if (
    data.status !== 1 ||
    !data.product ||
    data.status_verbose !== 'product found'
  )
    return null;

  const p = data.product;
  const n = p.nutriments ?? {};

  const per100g = extractNutritionPer100g(n);

  // Стратегия получения perServing:
  // 1. Берём _serving поля напрямую из ответа (если сервер их вычислил)
  // 2. Иначе масштабируем per100g на serving_quantity сами
  const perServingFromAPI = extractNutritionPerServingFromAPI(n);
  const perServing: NutritionPer | null =
    perServingFromAPI ??
    (p.serving_quantity != null && p.serving_quantity > 0
      ? scaleNutrition(per100g, p.serving_quantity)
      : null);

  // perPackage доступен только если есть числовое значение веса упаковки
  const perPackage: NutritionPer | null =
    p.product_quantity != null && p.product_quantity > 0
      ? scaleNutrition(per100g, p.product_quantity)
      : null;

  const allergens: AllergenInfo = {
    confirmed: parseAllergenTags(p.allergens_tags),
    traces: parseAllergenTags(p.traces_tags),
  };

  const nutriScore = (
    p.nutrition_grades && VALID_NUTRI_SCORES.has(p.nutrition_grades)
      ? p.nutrition_grades
      : null
  ) as NutriScore | null;

  const novaGroup = (
    p.nova_group !== undefined && VALID_NOVA_GROUPS.has(p.nova_group)
      ? p.nova_group
      : null
  ) as NovaGroup | null;

  return {
    barcode,
    name: p.product_name?.trim() || 'Неизвестный продукт',
    brand: p.brands?.split(',')[0]?.trim() ?? null,
    imageUrl: p.image_front_url ?? p.image_url ?? null,

    packageQuantityG: p.product_quantity ?? null,
    packageQuantityStr: p.quantity ?? null,
    servingSizeG: p.serving_quantity ?? null,
    servingSizeStr: p.serving_size ?? null,

    per100g,
    perServing,
    perPackage,

    allergens,
    nutriScore,
    novaGroup,
    ingredientsText: p.ingredients_text?.trim() ?? null,
    labels: parseLabels(p.labels_tags),
  };
}
