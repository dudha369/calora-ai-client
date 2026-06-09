// ─── Nutrition breakdown ──────────────────────────────────────────────────────

export interface NutritionPer {
  calories: number | null     // ккал
  protein: number | null      // г
  fat: number | null          // г
  saturatedFat: number | null // г (насыщенные жиры)
  carbs: number | null        // г
  sugars: number | null       // г (из них сахара)
  fiber: number | null        // г (клетчатка)
  salt: number | null         // г
  sodium: number | null       // г (натрий)
}

// КБЖУ для произвольного кол-ва граммов — используется при логировании приёма пищи
export interface NutritionForAmount extends NutritionPer {
  amountG: number
}

// ─── Allergen ─────────────────────────────────────────────────────────────────

export interface AllergenInfo {
  /** Подтверждённые аллергены ("en:gluten" → "gluten") */
  confirmed: string[]
  /** Возможные следы ("может содержать") */
  traces: string[]
}

// ─── Product ──────────────────────────────────────────────────────────────────

export type NutriScore = 'a' | 'b' | 'c' | 'd' | 'e'

/**
 * NOVA group: уровень промышленной обработки продукта
 * 1 = необработанные / минимально обработанные продукты
 * 2 = кулинарные ингредиенты (масло, соль, сахар)
 * 3 = обработанные продукты
 * 4 = ультраобработанные продукты (добавки, консерванты и т.д.)
 */
export type NovaGroup = 1 | 2 | 3 | 4

export interface ProductData {
  barcode: string

  name: string
  brand: string | null
  imageUrl: string | null

  /** Вес/объём упаковки в граммах или мл (например 400) */
  packageQuantityG: number | null
  /** Строка с упаковки: "400 g", "1 l", "2 x 250 g" */
  packageQuantityStr: string | null
  /** Размер одной порции в граммах (числовое значение, вычисленное сервером) */
  servingSizeG: number | null
  /** Строка с упаковки: "30 g", "1 стакан (240 мл)" */
  servingSizeStr: string | null

  /** На 100г/мл — всегда доступно (сервер OFF нормализует автоматически) */
  per100g: NutritionPer
  /** На одну порцию — доступно если servingSizeG задан */
  perServing: NutritionPer | null
  /** На всю упаковку — доступно если packageQuantityG задан */
  perPackage: NutritionPer | null

  allergens: AllergenInfo
  /** Nutri-Score: от A (лучший) до E (худший) */
  nutriScore: NutriScore | null
  /** NOVA group: 1-4, степень промышленной обработки */
  novaGroup: NovaGroup | null
  /** Состав — текст с упаковки */
  ingredientsText: string | null
  /**
   * Метки продукта: "organic", "vegan", "vegetarian", "fair-trade" и т.д.
   * Удобно для фильтрации и информирования пользователя.
   */
  labels: string[]
}
