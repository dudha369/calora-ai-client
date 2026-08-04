import { request } from './request';
import type { WeightRecord, WeightLogIn } from '../types/api/weight';
import type { DeleteResponse } from '../types/api/common';

export const weight = {
  /** GET /api/weight — последние 90 записей взвешиваний для графика прогресса */
  getHistory: () => request<WeightRecord[]>('weight'),

  /** POST /api/weight — залогировать взвешивание, обновляет текущий вес и цели */
  log: (data: WeightLogIn) => request<WeightRecord>('weight', 'POST', data),

  /** DELETE /api/weight/{id} */
  remove: (logId: number) =>
    request<DeleteResponse>(`weight/${logId}`, 'DELETE'),
};
