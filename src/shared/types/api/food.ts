/**
 * DTO-типы для /api/food/*
 */

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
  water_ml: number;
}

/** Суммарный КБЖУ + клетчатка/сахар — используется и в daily_total, и в анализе фото */
export interface NutritionTotals {
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  sugar_g: number;
  water_ml: number;
}

/** Итог анализа фото — те же показатели + суммарная гидратация */
export type FoodAnalysisTotals = NutritionTotals;

export interface FoodLogBase {
  id: number;
  user_id: number;
  log_date: string;
  logged_at: string;
  photo_url: string | null;
  total_calories: number;
  total_protein_g: number;
  total_fat_g: number;
  total_carbs_g: number;
  total_fiber_g: number;
  total_sugar_g: number;
  total_water_ml: number;
}

export interface FoodLog extends FoodLogBase {
  items: FoodItem[];
}

// ─── POST /api/food/analyze ──────────────────────────────────────────────────

/** Блюдо или напиток, распознанные Gemini на фото (ещё не сохранены, нет id) */
export interface AnalyzedDish {
  name: string;
  portion_g: number;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  sugar_g: number;
  /** Гидратация этого конкретного блюда/напитка, мл. 0 для сухой твёрдой еды. */
  water_ml: number;
  confidence: number;
}

export interface FoodAnalyzeResponse {
  dishes: AnalyzedDish[];
  total: FoodAnalysisTotals;
  portion_note: string;
  ask_user: boolean;
  photo_key: string | null;
}

// ─── POST /api/food/log ──────────────────────────────────────────────────────

export interface FoodItemIn {
  food_name: string;
  portion_g: number;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g?: number;
  sugar_g?: number;
  /** Гидратация этого конкретного пункта — ОБЯЗАТЕЛЬНО прокидывать при
   *  логировании/повторении, иначе FoodItem.water_ml в БД останется 0
   *  (см. ScannerPage.handleFoodConfirm и api/food.ts.repeat) */
  water_ml?: number;
}

export interface BarcodeLogIn {
  log_date: string;
  items: FoodItemIn[];
}

export interface FoodLogIn {
  log_date: string;
  items: FoodItemIn[];
  photo_key?: string | null;
  /** Суммарная гидратация из AnalyzedDish[] — авто-создаёт WaterLog на бэкенде */
  water_ml?: number;
  /** Копирование фото из существующего FoodLog (по id).
   *  Если указан и photo_key не задан — сервер берёт photo_key из
   *  указанного лога (только если он принадлежит тому же юзеру). */
  copy_photo_from_log_id?: number;
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
