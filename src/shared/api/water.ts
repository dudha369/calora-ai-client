import { request } from './request';
import type { DeleteResponse } from '../types/api/common';
import type { WaterIn, WaterLog, WaterByDateResponse } from '../types/api/water';

export const water = {
  /** POST /api/water — добавить запись воды */
  add: (data: WaterIn) =>
    request<WaterLog>('water', 'POST', data),

  /** GET /api/water/{date} — вода за день + сумма */
  getByDate: (date: string) =>
    request<WaterByDateResponse>(`water/${date}`),

  /** DELETE /api/water/{log_id} */
  remove: (logId: number) =>
    request<DeleteResponse>(`water/${logId}`, 'DELETE'),
};
