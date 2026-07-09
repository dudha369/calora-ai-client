import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { initData } from '@tma.js/sdk-react';
import i18n, { SUPPORTED_LANGUAGES, type AppLanguage } from '../i18n';
import { useTelegram } from '@/shared/hooks/useTelegram';
import { loadAppSettings, saveAppSettings } from '@/shared/lib/appSettingsStorage';
import { users } from '@/shared/api/users';
import LanguageContext from '@/shared/context/LanguageContext';

function isSupportedLanguage(value: string): value is AppLanguage {
  return SUPPORTED_LANGUAGES.includes(value);
}

/** language_code клиента Telegram → наш AppLanguage, напр. "ru-RU" → "ru". */
function fromTelegramLocale(code: string | undefined): AppLanguage {
  const short = code?.split('-')[0]?.toLowerCase() ?? '';
  return isSupportedLanguage(short) ? short : 'en';
}

/**
 * Fire-and-forget: держим users.language_code в Postgres примерно в
 * актуальном состоянии — исключительно для того, чтобы рассылки/будущие
 * уведомления можно было слать на нужном языке. Никогда не await'ится
 * вызывающей стороной — упавшая синхронизация не должна блокировать UI.
 */
function syncLanguageToBackend(lang: AppLanguage) {
  users.updateLanguage(lang).catch(() => {});
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { ready } = useTelegram();
  const [language, setLanguageState] = useState<AppLanguage>('en');

  // Порядок разрешения языка, выполняется один раз за сессию и только
  // после того как Telegram SDK подтвердил восстановление initData
  // (это устраняет ту самую гонку состояний, из-за которой раньше
  // приложение иногда стартовало на английском — см. useTelegramInit):
  //   1. CloudStorage — явный выбор пользователя, синхронизирован между устройствами.
  //   2. language_code клиента Telegram — разумный дефолт при первом запуске.
  // Тот, кто победил, записывается обратно в CloudStorage, чтобы шаг 2
  // для этого пользователя больше никогда не выполнялся.
  useEffect(() => {
    if (!ready) return;

    let cancelled = false;

    (async () => {
      const settings = await loadAppSettings();
      const resolved: AppLanguage =
        settings.language && isSupportedLanguage(settings.language)
          ? settings.language
          : fromTelegramLocale(initData?.user()?.language_code);

      if (cancelled) return;

      setLanguageState(resolved);
      await i18n.changeLanguage(resolved);

      if (!settings.language) {
        await saveAppSettings({ language: resolved });
      }
      syncLanguageToBackend(resolved);
    })();

    return () => {
      cancelled = true;
    };
  }, [ready]);

  const setLanguage = useCallback(async (lang: AppLanguage) => {
    setLanguageState(lang);
    await i18n.changeLanguage(lang);
    await saveAppSettings({ language: lang });
    syncLanguageToBackend(lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
