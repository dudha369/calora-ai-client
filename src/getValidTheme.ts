import type { ThemeParams } from "telegram-web-app";
import type { Theme, ThemeMode } from "./interfaces/Theme";

const LIGHT: Theme = {
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
  section_separator_color: "#d9d9d9"
};

const DARK: Theme = {
  bg_color: "#171717",
  text_color: "#ffffff",
  hint_color: "#98989d",
  link_color: "#6ab7ff",
  button_color: "#2481cc",
  button_text_color: "#ffffff",
  secondary_bg_color: "#232323",
  header_bg_color: "#171717",
  section_bg_color: "#171717",
  section_header_text_color: "#98989d",
  subtitle_text_color: "#98989d",
  destructive_text_color: "#ff453a",
  accent_text_color: "#6ab7ff",
  section_separator_color: "#2f2f2f"
};

function isHexColor(value: string | undefined): value is string {
  return typeof value === "string" && /^#?[0-9a-fA-F]{6}$/.test(value);
}

function normalizeHex(value: string | undefined, fallback: string): string {
  if (!isHexColor(value)) return fallback;
  return value.startsWith("#") ? value : `#${value}`;
}

function isDarkTheme(bgColor: string): boolean {
  const hex = normalizeHex(bgColor, DARK.bg_color).replace("#", "");
  const r = Number.parseInt(hex.substring(0, 2), 16);
  const g = Number.parseInt(hex.substring(2, 4), 16);
  const b = Number.parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

function buildTelegramTheme(theme?: ThemeParams): Theme {
  const dark = isDarkTheme(theme?.bg_color ?? DARK.bg_color);

  return {
    bg_color: normalizeHex(theme?.bg_color, dark ? DARK.bg_color : LIGHT.bg_color),
    text_color: normalizeHex(theme?.text_color, dark ? DARK.text_color : LIGHT.text_color),
    hint_color: normalizeHex(theme?.hint_color, dark ? DARK.hint_color : LIGHT.hint_color),
    link_color: normalizeHex(theme?.link_color, dark ? DARK.link_color : LIGHT.link_color),
    button_color: normalizeHex(theme?.button_color, dark ? DARK.button_color : LIGHT.button_color),
    button_text_color: normalizeHex(theme?.button_text_color, dark ? DARK.button_text_color : LIGHT.button_text_color),
    secondary_bg_color: normalizeHex(theme?.secondary_bg_color, dark ? DARK.secondary_bg_color : LIGHT.secondary_bg_color),
    header_bg_color: normalizeHex(theme?.header_bg_color, dark ? DARK.header_bg_color : LIGHT.header_bg_color),
    section_bg_color: normalizeHex(theme?.section_bg_color, dark ? DARK.section_bg_color : LIGHT.section_bg_color),
    section_header_text_color: normalizeHex(theme?.section_header_text_color, dark ? DARK.section_header_text_color : LIGHT.section_header_text_color),
    subtitle_text_color: normalizeHex(theme?.subtitle_text_color, dark ? DARK.subtitle_text_color : LIGHT.subtitle_text_color),
    destructive_text_color: normalizeHex(theme?.destructive_text_color, dark ? DARK.destructive_text_color : LIGHT.destructive_text_color),
    accent_text_color: normalizeHex(theme?.accent_text_color, dark ? DARK.accent_text_color : LIGHT.accent_text_color),
    section_separator_color: normalizeHex(theme?.section_separator_color, dark ? DARK.section_separator_color : LIGHT.section_separator_color)
  };
}

export const getValidTheme = (theme: ThemeParams | undefined, mode: ThemeMode): Theme => {
  if (mode === "light") return LIGHT;
  if (mode === "dark") return DARK;

  if (mode === "auto") {
    return buildTelegramTheme(theme);
  }

  return buildTelegramTheme(theme);
};