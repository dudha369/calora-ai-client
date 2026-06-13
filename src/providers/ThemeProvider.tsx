import { type ReactNode, useState, useCallback, useEffect } from 'react';
import { cloudStorage, themeParams } from '@telegram-apps/sdk-react';
import ThemeContext from '../context/ThemeContext';
import { getValidTheme } from '../utils/getValidTheme';
import { useTelegram } from '../hooks/useTelegram';
import type { Theme, ThemeMode } from '../interfaces/Theme';

// ─── CloudStorage: ключ и интерфейс настроек ─────────────────────────────────

const SETTINGS_KEY = 'calora_settings';

interface AppSettings {
  themeMode: ThemeMode;
  // Место для будущих настроек: language, notifications, units и т.д.
}

async function loadSettings(): Promise<Partial<AppSettings>> {
  try {
    const raw = await cloudStorage.getItem(SETTINGS_KEY);
    return raw ? (JSON.parse(raw) as Partial<AppSettings>) : {};
  } catch {
    return {};
  }
}

async function saveSettings(patch: Partial<AppSettings>): Promise<void> {
  try {
    const existing = await loadSettings();
    await cloudStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ ...existing, ...patch }),
    );
  } catch {
    // CloudStorage недоступен (dev-окружение / старый клиент) — молча игнорируем
  }
}

// ─── CSS-переменные ───────────────────────────────────────────────────────────

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

// ─── Хелперы чтения текущих Telegram params ───────────────────────────────────

function safeThemeParams() {
  try {
    return themeParams.state();
  } catch {
    return undefined;
  }
}

// ─── ThemeProvider ────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { ready } = useTelegram();

  const [mode, setModeState] = useState<ThemeMode>('telegram');
  const [theme, setTheme] = useState<Theme>(() => {
    const initial = getValidTheme(safeThemeParams(), 'telegram');
    applyThemeToCss(initial);
    return initial;
  });

  // ── Загружаем сохранённый режим из CloudStorage как только Telegram готов ──
  useEffect(() => {
    if (!ready) return;
    loadSettings().then((settings) => {
      if (settings.themeMode) setModeState(settings.themeMode);
    });
  }, [ready]);

  // ── Пересчитываем тему при смене режима; подписываемся на Telegram-тему ────
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

    // Реагируем на смену темы Telegram (пользователь переключил Dark Mode)
    const unsub = themeParams.state.sub(update);
    return unsub;
  }, [mode, ready]);

  // ── Публичный сеттер: обновляет состояние + пишет в CloudStorage ──────────
  const setMode = useCallback(async (newMode: ThemeMode) => {
    setModeState(newMode);
    await saveSettings({ themeMode: newMode });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
