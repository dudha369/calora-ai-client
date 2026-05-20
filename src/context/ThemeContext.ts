import { createContext, useContext } from "react";
import type { Theme } from "../interfaces/Theme";

// Light theme as safe default — prevents crash if used before provider mounts
const DEFAULT_THEME: Theme = {
  bg_color: "#ffffff",
  text_color: "#000000",
  hint_color: "#707579",
  link_color: "#3390ec",
  button_color: "#3390ec",
  button_text_color: "#ffffff",
  secondary_bg_color: "#f4f4f5",
  header_bg_color: "#ffffff",
  section_bg_color: "#ffffff",
  section_header_text_color: "#707579",
  subtitle_text_color: "#707579",
  destructive_text_color: "#ff3b30",
  accent_text_color: "#3390ec",
  section_separator_color: "#d9d9d9",
};

const ThemeContext = createContext<Theme>(DEFAULT_THEME);

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
