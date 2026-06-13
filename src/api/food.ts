import { request } from './request';
import type { DeleteResponse } from '../interfaces/api/common';
import type {
  FoodAnalyzeResponse,
  FoodByDateResponse,
  FoodLogIn,
  BarcodeLogIn,
  CreateFoodLogResponse,
} from '../interfaces/api/food';
import { toApiDate } from '../utils/date.ts';

export const food = {
  analyze: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<FoodAnalyzeResponse>('food/analyze', 'POST', formData);
  },

  log: (data: FoodLogIn) =>
    request<CreateFoodLogResponse>('food/log', 'POST', data),

  logBarcode: (payload: BarcodeLogIn) =>
    request<CreateFoodLogResponse>('food/log-barcode', 'POST', payload),

  getByDate: (date: string) => request<FoodByDateResponse>(`food/${date}`),

  remove: (logId: number) => request<DeleteResponse>(`food/${logId}`, 'DELETE'),
};

export const todayApiDate = (): string => toApiDate(new Date());
