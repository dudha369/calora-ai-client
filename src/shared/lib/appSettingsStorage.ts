import { cloudStorage } from '@tma.js/sdk-react';
import type { ThemeMode } from '../types/Theme';
import type { AppLanguage } from '@/app/i18n';

const SETTINGS_KEY = 'calora_settings';

/**
 * Все пользовательские настройки живут в ОДНОЙ записи CloudStorage.
 *
 * Почему один ключ, а не по одному на настройку: CloudStorage API
 * Telegram лимитирован по частоте вызовов на пользователя, а каждый
 * get/set — сетевой запрос. Один JSON-блоб на все настройки означает,
 * что при смене любой из них приложение делает максимум 1 чтение +
 * 1 запись — независимо от того, сколько настроек мы добавим позже.
 */
export interface AppSettings {
  themeMode?: ThemeMode;
  language?: AppLanguage;
}

export async function loadAppSettings(): Promise<Partial<AppSettings>> {
  try {
    const raw = await cloudStorage.getItem(SETTINGS_KEY);
    return raw ? (JSON.parse(raw) as Partial<AppSettings>) : {};
  } catch {
    // CloudStorage недоступен (dev-окружение / старый клиент) — стартуем с пустого.
    return {};
  }
}

export async function saveAppSettings(
  patch: Partial<AppSettings>,
): Promise<void> {
  try {
    const existing = await loadAppSettings();
    await cloudStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ ...existing, ...patch }),
    );
  } catch {
    // Best-effort персистентность — потеря записи не должна ронять приложение.
  }
}
