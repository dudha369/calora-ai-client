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
  section_separator_color: "#d9d9d9",
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
  section_separator_color: "#2f2f2f",
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
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

function buildTelegramTheme(params?: ThemeParams): Theme {
  const dark = isDarkTheme(params?.bg_color ?? DARK.bg_color);
  const base = dark ? DARK : LIGHT;

  return {
    bg_color: normalizeHex(params?.bg_color, base.bg_color),
    text_color: normalizeHex(params?.text_color, base.text_color),
    hint_color: normalizeHex(params?.hint_color, base.hint_color),
    link_color: normalizeHex(params?.link_color, base.link_color),
    button_color: normalizeHex(params?.button_color, base.button_color),
    button_text_color: normalizeHex(params?.button_text_color, base.button_text_color),
    secondary_bg_color: normalizeHex(params?.secondary_bg_color, base.secondary_bg_color),
    header_bg_color: normalizeHex(params?.header_bg_color, base.header_bg_color),
    section_bg_color: normalizeHex(params?.section_bg_color, base.section_bg_color),
    section_header_text_color: normalizeHex(params?.section_header_text_color, base.section_header_text_color),
    subtitle_text_color: normalizeHex(params?.subtitle_text_color, base.subtitle_text_color),
    destructive_text_color: normalizeHex(params?.destructive_text_color, base.destructive_text_color),
    accent_text_color: normalizeHex(params?.accent_text_color, base.accent_text_color),
    section_separator_color: normalizeHex(params?.section_separator_color, base.section_separator_color),
  };
}

export const getValidTheme = (params: ThemeParams | undefined, mode: ThemeMode): Theme => {
  if (mode === "light") return LIGHT;
  if (mode === "dark") return DARK;
  // "telegram" | "auto" — both use Telegram theme params
  return buildTelegramTheme(params);
};
