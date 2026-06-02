import type { Theme } from "../interfaces/Theme";
import { createContext } from "react";

type TelegramState = {
  ready: boolean;
  safeTop: number;
  theme: Theme;
};

export const TelegramContext = createContext<TelegramState | null>(null);
