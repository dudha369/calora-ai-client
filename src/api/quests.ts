import { request } from './request';
import type { Quest, GenerateQuestsResponse } from '../interfaces/api/quests';

export const quests = {
  /** GET /api/quests — активные (+ недавно выполненные) квесты пользователя */
  getActive: () => request<Quest[]>('quests'),

  /**
   * POST /api/quests/generate — сгенерировать 3 новых квеста через Gemini.
   * Вызывать раз в неделю или когда все квесты истекли.
   */
  generate: () => request<GenerateQuestsResponse>('quests/generate', 'POST'),
};
