import { createContext, useContext } from "react";
import type { Theme } from "../interfaces/Theme";

const ThemeContext = createContext<Theme | null>(null);

export const useTheme = () => {
  const theme = useContext(ThemeContext);

  if (!theme) {
    throw new Error("useTheme must be used inside ThemeContext.Provider");
  }

  return theme;
};

export default ThemeContext;