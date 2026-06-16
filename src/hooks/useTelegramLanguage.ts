import { useEffect } from 'react';
import { cloudStorage, initData } from '@tma.js/sdk-react';
import i18n, { SUPPORTED_LANGUAGES, type AppLanguage } from '../i18n';

function normalizeLanguage(lang: string | undefined): AppLanguage {
  if (!lang) return 'en';
  const code = lang.split('-')[0].toLowerCase() as AppLanguage;
  return SUPPORTED_LANGUAGES.includes(code) ? code : 'en';
}

export function useTelegramLanguage() {
  useEffect(() => {
    async function detectAndApplyLanguage() {
      try {
        // 1. Приоритет — сохранённый выбор пользователя
        const saved = await cloudStorage.getItem('app_language');
        if (saved) {
          await i18n.changeLanguage(normalizeLanguage(saved));
          return;
        }

        // 2. Язык из Telegram-профиля
        const tgLang = initData?.user()?.language_code;
        await i18n.changeLanguage(normalizeLanguage(tgLang));
      } catch {
        // CloudStorage недоступен — остаёмся на 'en'
      }
    }

    detectAndApplyLanguage();
  }, []); // Запускаем один раз после маунта
}
