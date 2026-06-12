import { request } from './request';
import { toApiDate } from '../utils/date';

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

export interface BarcodeLogPayload {
  log_date: string;
  items: FoodItemPayload[];
}

export const food = {
  analyze: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<FoodAnalysisResult>('food/analyze', 'POST', form);
  },

  /** POST /api/food/log — сохраняет запись еды (с фото или без) */
  createLog: (payload: CreateLogPayload) =>
    request('food/log', 'POST', payload),

  /** POST /api/food/log-barcode — запись по штрихкоду, всегда без фото (B2 не используется) */
  logBarcode: (payload: BarcodeLogPayload) =>
    request('food/log-barcode', 'POST', payload),

  /** GET /api/food/:date — все записи за дату */
  getByDate: (date: string) => request(`food/${date}`),

  /** DELETE /api/food/:id — удалить запись */
  deleteLog: (logId: number) => request(`food/${logId}`, 'DELETE'),
};

export const todayApiDate = (): string => toApiDate(new Date());
