import { createContext, useContext } from "react";
import type { Theme, ThemeMode } from "../interfaces/Theme";
import { getValidTheme } from "../utils/getValidTheme";

export interface ThemeContextValue {
  theme:   Theme;
  mode:    ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
}

const DEFAULT_VALUE: ThemeContextValue = {
  theme:   getValidTheme(undefined, "light"),
  mode:    "telegram",
  setMode: async () => {},
};

const ThemeContext = createContext<ThemeContextValue>(DEFAULT_VALUE);

/**
 * Хук для получения текущей темы.
 * Обратно совместим: по-прежнему возвращает Theme,
 * поэтому все существующие компоненты не нужно трогать.
 */
export const useTheme = (): Theme => useContext(ThemeContext).theme;

/**
 * Хук для чтения и изменения режима темы.
 * Используется на странице настроек.
 */
export const useThemeMode = () => {
  const { mode, setMode } = useContext(ThemeContext);
  return { mode, setMode };
};

export default ThemeContext;
