import { createContext } from 'react';

type TelegramState = {
  ready: boolean;
  safeTop: number;
  safeBottom: number;
};

export const TelegramContext = createContext<TelegramState | null>(null);
