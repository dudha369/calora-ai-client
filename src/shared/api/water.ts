import { request } from './request';
import type { DeleteResponse } from '../types/api/common';
import type {
  WaterIn,
  WaterLog,
  WaterUpdateIn,
  WaterByDateResponse,
} from '../types/api/water';

export const water = {
  /** POST /api/water — добавить запись воды */
  add: (data: WaterIn) => request<WaterLog>('water', 'POST', data),

  /** GET /api/water/{date} — вода за день + сумма */
  getByDate: (date: string) => request<WaterByDateResponse>(`water/${date}`),

  /** PATCH /api/water/{id} — изменить заметку и/или привязку к еде */
  update: (logId: number, data: WaterUpdateIn) =>
    request<WaterLog>(`water/${logId}`, 'PATCH', data),

  /** DELETE /api/water/{id} */
  remove: (logId: number) =>
    request<DeleteResponse>(`water/${logId}`, 'DELETE'),
};
