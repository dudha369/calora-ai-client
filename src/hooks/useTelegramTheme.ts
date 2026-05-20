import { useEffect, useState } from "react";
import { WebApp } from "../api/telegram";
import { getValidTheme } from "../getValidTheme";
import type { Theme } from "../interfaces/Theme";

export function useTelegramTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(() =>
    getValidTheme(WebApp?.themeParams, "telegram")
  );

  useEffect(() => {
    const applyTheme = () => {
      const newTheme = getValidTheme(WebApp?.themeParams, "telegram");
      setTheme(newTheme);

      const root = document.documentElement;

      root.style.setProperty("--tg-bg-color", newTheme.bg_color);
      root.style.setProperty("--tg-text-color", newTheme.text_color);
      root.style.setProperty("--tg-hint-color", newTheme.hint_color);
      root.style.setProperty("--tg-link-color", newTheme.link_color);
      root.style.setProperty("--tg-button-color", newTheme.button_color);
      root.style.setProperty("--tg-button-text-color", newTheme.button_text_color);
      root.style.setProperty("--tg-secondary-bg-color", newTheme.secondary_bg_color);
      root.style.setProperty("--tg-header-bg-color", newTheme.header_bg_color);
      root.style.setProperty("--tg-section-bg-color", newTheme.section_bg_color);
      root.style.setProperty("--tg-section-header-text-color", newTheme.section_header_text_color);
      root.style.setProperty("--tg-subtitle-text-color", newTheme.subtitle_text_color);
      root.style.setProperty("--tg-destructive-text-color", newTheme.destructive_text_color);
      root.style.setProperty("--tg-accent-text-color", newTheme.accent_text_color);
      root.style.setProperty("--tg-section-separator-color", newTheme.section_separator_color);
    };

    applyTheme();

    WebApp?.onEvent("themeChanged", applyTheme);

    return () => {
      WebApp?.offEvent("themeChanged", applyTheme);
    };
  }, []);

  return theme;
}