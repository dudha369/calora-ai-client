import type { RGB } from '@tma.js/types';

export interface Theme {
  bg_color: RGB;
  text_color: RGB;
  hint_color: RGB;
  link_color: RGB;
  button_color: RGB;
  button_text_color: RGB;
  secondary_bg_color: RGB;
  header_bg_color: RGB;
  section_bg_color: RGB;
  section_header_text_color: RGB;
  subtitle_text_color: RGB;
  destructive_text_color: RGB;
  accent_text_color: RGB;
  section_separator_color: RGB;
}

export type ThemeMode = 'telegram' | 'auto' | 'light' | 'dark';
