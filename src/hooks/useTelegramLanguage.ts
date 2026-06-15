import { useEffect } from 'react';
import { initData } from '@telegram-apps/sdk-react';
import i18n, { SUPPORTED_LANGUAGES, type AppLanguage } from '../i18n';

function normalizeLanguage(lang: string | undefined): AppLanguage {
  if (!lang) return 'en';
  const code = lang.split('-')[0].toLowerCase() as AppLanguage;
  return SUPPORTED_LANGUAGES.includes(code) ? code : 'en';
}

/**
 * Detects user language from Telegram profile on first load.
 * During onboarding, user picks language explicitly (Step0Language),
 * which calls i18n.changeLanguage() directly.
 */
export function useTelegramLanguage() {
  useEffect(() => {
    try {
      const tgLang = initData?.user()?.languageCode;
      i18n.changeLanguage(normalizeLanguage(tgLang));
    } catch {
      // initData not available — stay on 'en'
    }
  }, []);
}
