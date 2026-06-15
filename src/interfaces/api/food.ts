/**
 * DTO-типы для /api/food/*
 *
 * Decimal-поля Tortoise (portion_g, calories, *_g) FastAPI сериализует
 * через jsonable_encoder в обычный JSON number — поэтому здесь всё number,
 * без строк и без Decimal.
 */

// ─── Базовые сущности ────────────────────────────────────────────────────────

/** Одно блюдо/продукт внутри записи еды (FoodItem) */
export interface FoodItem {
  id: number;
  food_log_id: number;
  food_name: string;
  portion_g: number;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  sugar_g: number;
}

/** Суммарный КБЖУ — используется и в daily_total, и в total анализа фото */
export interface NutritionTotals {
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
}

/** Запись еды (FoodLog) без вложенных блюд — как возвращает FoodLogSchema */
export interface FoodLogBase {
  id: number;
  user_id: number;
  log_date: string; // YYYY-MM-DD
  logged_at: string; // ISO datetime (UTC)
  photo_url: string | null;
  total_calories: number;
  total_protein_g: number;
  total_fat_g: number;
  total_carbs_g: number;
  total_fiber_g: number;
  total_sugar_g: number;
}

/** Запись еды с блюдами — то, что отдают GET /api/food/{date} и POST /api/food/log */
export interface FoodLog extends FoodLogBase {
  items: FoodItem[];
}

// ─── POST /api/food/analyze ──────────────────────────────────────────────────

/** Блюдо, распознанное Gemini на фото (ещё не сохранено в БД, нет id) */
export interface AnalyzedDish {
  name: string;
  portion_g: number;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  sugar_g: number;
  confidence: number;
}

export interface FoodAnalyzeResponse {
  dishes: AnalyzedDish[];
  total: NutritionTotals;
  portion_note: string;
  /** true — модель не уверена в оценке, стоит спросить пользователя */
  ask_user: boolean;
  /** Ключ объекта в B2. Передать в food.log(), чтобы привязать фото к записи */
  photo_key: string | null;
}

// ─── POST /api/food/log ──────────────────────────────────────────────────────

/** Одно блюдо при сохранении записи (то, что подтвердил пользователь) */
export interface FoodItemIn {
  food_name: string;
  portion_g: number;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g?: number;
  sugar_g?: number;
}

export interface BarcodeLogIn {
  log_date: string; // YYYY-MM-DD
  items: FoodItemIn[];
}

export interface FoodLogIn {
  log_date: string; // YYYY-MM-DD
  items: FoodItemIn[];
  /** photo_key из ответа food.analyze(), если фото было */
  photo_key?: string | null;
}

export interface CreateFoodLogResponse {
  log: FoodLogBase;
  items: FoodItem[];
}

// ─── GET /api/food/{date} ────────────────────────────────────────────────────

export interface FoodByDateResponse {
  date: string;
  logs: FoodLog[];
  daily_total: NutritionTotals;
}
