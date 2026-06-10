import { request } from "./request";
import { toApiDate } from "../utils/date";

// ── Response types ────────────────────────────────────────────────────────────

export interface FoodDish {
  name: string;
  portion_g: number;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  confidence: number;
}

export interface FoodAnalysisTotal {
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
}

export interface FoodAnalysisResult {
  dishes: FoodDish[];
  total: FoodAnalysisTotal;
  portion_note: string;
  ask_user: boolean;
  photo_key: string | null;
}

// ── Request types ─────────────────────────────────────────────────────────────

export interface FoodItemPayload {
  food_name: string;
  portion_g: number;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
}

export interface CreateLogPayload {
  log_date: string;
  items: FoodItemPayload[];
  photo_key?: string | null;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const food = {
  /**
   * POST /api/food/analyze
   * Отправляет фото на бэкенд, получает КБЖУ через Gemini Vision.
   */
  analyze: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<FoodAnalysisResult>("food/analyze", "POST", form);
  },

  /** POST /api/food/log — сохраняет запись еды */
  // createLog: (payload: CreateLogPayload) =>
  //   request("food/log", "POST", payload),
  createLog: (_: CreateLogPayload) => _,

  /** GET /api/food/:date — все записи за дату */
  getByDate: (date: string) =>
    request(`food/${date}`),

  /** DELETE /api/food/:id — удалить запись */
  deleteLog: (logId: number) =>
    request(`food/${logId}`, "DELETE"),
};

/** Сегодняшняя дата в формате YYYY-MM-DD для поля log_date */
export const todayApiDate = (): string => toApiDate(new Date());
