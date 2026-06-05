import { useEffect, useState } from "react";
import { themeParams } from "@telegram-apps/sdk-react";
import { getValidTheme } from "../utils/getValidTheme";
import type { Theme } from "../interfaces/Theme";

function readTheme(): Theme {
  try {
    return getValidTheme(themeParams.state(), "telegram");
  } catch {
    return getValidTheme(undefined, "telegram");
  }
}

function applyThemeToCss(theme: Theme) {
  const root = document.documentElement;
  root.style.setProperty("--tg-bg-color", theme.bg_color);
  root.style.setProperty("--tg-text-color", theme.text_color);
  root.style.setProperty("--tg-hint-color", theme.hint_color);
  root.style.setProperty("--tg-link-color", theme.link_color);
  root.style.setProperty("--tg-button-color", theme.button_color);
  root.style.setProperty("--tg-button-text-color", theme.button_text_color);
  root.style.setProperty("--tg-secondary-bg-color", theme.secondary_bg_color);
  root.style.setProperty("--tg-header-bg-color", theme.header_bg_color);
  root.style.setProperty("--tg-section-bg-color", theme.section_bg_color);
  root.style.setProperty("--tg-section-header-text-color", theme.section_header_text_color);
  root.style.setProperty("--tg-subtitle-text-color", theme.subtitle_text_color);
  root.style.setProperty("--tg-destructive-text-color", theme.destructive_text_color);
  root.style.setProperty("--tg-accent-text-color", theme.accent_text_color);
  root.style.setProperty("--tg-section-separator-color", theme.section_separator_color);
}

export function useTelegramTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    applyThemeToCss(theme);

    const unsub = themeParams.state.sub(() => {
      const next = readTheme();
      setTheme(next);
      applyThemeToCss(next);
    });

    return unsub;
  }, []);

  return theme;
}
