import type {ThemeParams} from "telegram-web-app";

export interface Theme {
  bg_color: string,
  text_color: string,
  accent_color: string,
  separator_color: string,
}

type Type = "telegram" | "auto" | "light" | "dark";

const DARK: Theme = {
  bg_color: 'black',
  text_color: 'white',
  accent_color: 'blue',
  separator_color: 'gray',
};

const LIGHT: Theme = {
  bg_color: 'white',
  text_color: 'black',
  accent_color: 'blue',
  separator_color: 'gray',
};

function isDarkTheme(bg_color: string) {
  const hex = bg_color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance < 0.5;
}

export const getValidTheme = (theme: ThemeParams, type: Type): Theme | ThemeParams => {
  if((['telegram', 'auto'].includes(type)) && theme == undefined) {
    type = 'dark';
  }

  if(type === 'auto') {
    if(isDarkTheme(theme.bg_color!)) type = 'dark';
    else type = 'light';
  }

  if(type == 'dark') return DARK;
  if(type == 'light') return LIGHT;
  return theme!;
};