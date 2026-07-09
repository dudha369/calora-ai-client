import { request } from './request';
import type { WeightRecord } from '../types/api/weight';

export const weight = {
  /** GET /api/weight — последние 90 записей взвешиваний для графика прогресса */
  getHistory: () => request<WeightRecord[]>('weight'),
};
