import type { ThemeParams } from 'telegram-web-app';
import type { Theme, ThemeMode } from '../types/Theme';
import { makeContrast } from './colors';
import type { RGB } from '@tma.js/types';

const LIGHT: Theme = {
  bg_color: '#f5f5f0',
  text_color: '#1a1b1e',
  hint_color: '#9ca3af',
  link_color: '#22c55e',
  button_color: '#22c55e',
  button_text_color: '#ffffff',
  secondary_bg_color: '#eaeae5',
  header_bg_color: '#f5f5f0',
  section_bg_color: '#ffffff',
  section_header_text_color: '#9ca3af',
  subtitle_text_color: '#9ca3af',
  destructive_text_color: '#ef4444',
  accent_text_color: '#16a34a',
  section_separator_color: '#e5e5e0',
};

const DARK: Theme = {
  bg_color: '#111113',
  text_color: '#ececed',
  hint_color: '#71717a',
  link_color: '#4ade80',
  button_color: '#22c55e',
  button_text_color: '#ffffff',
  secondary_bg_color: '#1a1a1d',
  header_bg_color: '#111113',
  section_bg_color: '#1a1a1d',
  section_header_text_color: '#71717a',
  subtitle_text_color: '#71717a',
  destructive_text_color: '#f87171',
  accent_text_color: '#4ade80',
  section_separator_color: '#27272a',
};

function isHexColor(value: string | undefined): value is string {
  return typeof value === 'string' && /^#?[0-9a-fA-F]{6}$/.test(value);
}

function normalizeHex(value: string | undefined, fallback: RGB): RGB {
  if (!isHexColor(value)) return fallback;
  return (value.startsWith('#') ? value : `#${value}`) as RGB;
}

function isDarkTheme(bgColor: string): boolean {
  const hex = normalizeHex(bgColor, DARK.bg_color).replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
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
    button_text_color: normalizeHex(
      params?.button_text_color,
      base.button_text_color,
    ),
    secondary_bg_color: normalizeHex(
      params?.secondary_bg_color,
      base.secondary_bg_color,
    ),
    header_bg_color: normalizeHex(
      params?.header_bg_color,
      base.header_bg_color,
    ),
    section_bg_color: normalizeHex(
      params?.section_bg_color,
      base.section_bg_color,
    ),
    section_header_text_color: normalizeHex(
      params?.section_header_text_color,
      base.section_header_text_color,
    ),
    subtitle_text_color: normalizeHex(
      params?.subtitle_text_color,
      base.subtitle_text_color,
    ),
    destructive_text_color: normalizeHex(
      params?.destructive_text_color,
      base.destructive_text_color,
    ),
    accent_text_color: normalizeHex(
      params?.accent_text_color,
      base.accent_text_color,
    ),
    section_separator_color: normalizeHex(
      params?.section_separator_color,
      base.section_separator_color,
    ),
  };
}

export function normalizeTheme(theme: Theme): Theme {
  let { section_bg_color, secondary_bg_color } = theme;
  const { bg_color } = theme;

  const sectionMatchesBg = section_bg_color === bg_color;
  const secondaryMatchesBg = secondary_bg_color === bg_color;

  if (sectionMatchesBg && secondaryMatchesBg) {
    const contrast = makeContrast(bg_color) as RGB;
    return {
      ...theme,
      section_bg_color: contrast,
      secondary_bg_color: contrast,
    };
  }

  if (sectionMatchesBg) {
    section_bg_color = secondary_bg_color;
  }

  if (secondaryMatchesBg) {
    secondary_bg_color = section_bg_color;
  }

  return { ...theme, section_bg_color, secondary_bg_color };
}

export const getValidTheme = (
  params: ThemeParams | undefined,
  mode: ThemeMode,
): Theme => {
  if (mode === 'light') return LIGHT;
  else if (mode === 'dark') return DARK;
  return normalizeTheme(buildTelegramTheme(params));
};
