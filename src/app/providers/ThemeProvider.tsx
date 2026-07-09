import { type ReactNode, useState, useCallback, useEffect } from 'react';
import { themeParams } from '@tma.js/sdk-react';
import ThemeContext from '@/shared/context/ThemeContext';
import { getValidTheme } from '@/shared/lib/getValidTheme';
import { useTelegram } from '@/shared/hooks/useTelegram';
import { loadAppSettings, saveAppSettings } from '@/shared/lib/appSettingsStorage';
import type { Theme, ThemeMode } from '@/shared/types/Theme';
import type { ThemeParams } from 'telegram-web-app';

function applyThemeToCss(theme: Theme): void {
  const root = document.documentElement;
  root.style.setProperty('--tg-bg-color', theme.bg_color);
  root.style.setProperty('--tg-text-color', theme.text_color);
  root.style.setProperty('--tg-hint-color', theme.hint_color);
  root.style.setProperty('--tg-link-color', theme.link_color);
  root.style.setProperty('--tg-button-color', theme.button_color);
  root.style.setProperty('--tg-button-text-color', theme.button_text_color);
  root.style.setProperty('--tg-secondary-bg-color', theme.secondary_bg_color);
  root.style.setProperty('--tg-header-bg-color', theme.header_bg_color);
  root.style.setProperty('--tg-section-bg-color', theme.section_bg_color);
  root.style.setProperty(
    '--tg-section-header-text-color',
    theme.section_header_text_color,
  );
  root.style.setProperty('--tg-subtitle-text-color', theme.subtitle_text_color);
  root.style.setProperty(
    '--tg-destructive-text-color',
    theme.destructive_text_color,
  );
  root.style.setProperty('--tg-accent-text-color', theme.accent_text_color);
  root.style.setProperty(
    '--tg-section-separator-color',
    theme.section_separator_color,
  );
}

function safeThemeParams() {
  try {
    const state = themeParams.state();
    if (state && state.bg_color) return state;
  } catch {}

  try {
    const w = window as unknown as Record<string, any>;
    const tp = w.Telegram?.WebApp?.themeParams;
    if (tp && tp.bg_color) return tp as ThemeParams;
  } catch {}

  return undefined;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { ready } = useTelegram();

  const [mode, setModeState] = useState<ThemeMode>('telegram');
  const [theme, setTheme] = useState<Theme>(() => {
    const initial = getValidTheme(safeThemeParams(), 'telegram');
    applyThemeToCss(initial);
    return initial;
  });

  useEffect(() => {
    if (!ready) return;
    loadAppSettings().then((settings) => {
      if (settings.themeMode) setModeState(settings.themeMode);
    });
  }, [ready]);

  useEffect(() => {
    function update() {
      const next = getValidTheme(
        mode === 'telegram' ? safeThemeParams() : undefined,
        mode,
      );
      setTheme(next);
      applyThemeToCss(next);
    }

    update();

    if (mode !== 'telegram') return;

    const unsub = themeParams.state.sub(update);
    return unsub;
  }, [mode, ready]);

  const setMode = useCallback(async (newMode: ThemeMode) => {
    setModeState(newMode);
    await saveAppSettings({ themeMode: newMode });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
