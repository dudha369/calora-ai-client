import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// EN
import enCommon from './locales/en/common.json';
import enOnboarding from './locales/en/onboarding.json';
import enMain from './locales/en/main.json';

// RU
import ruCommon from './locales/ru/common.json';
import ruOnboarding from './locales/ru/onboarding.json';
import ruMain from './locales/ru/main.json';

// UA
import uaCommon from './locales/ua/common.json';
import uaOnboarding from './locales/ua/onboarding.json';
import uaMain from './locales/ua/main.json';

export const SUPPORTED_LANGUAGES = ['en', 'ru', 'ua'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['common', 'onboarding', 'main'],
  defaultNS: 'common',
  resources: {
    en: { common: enCommon, onboarding: enOnboarding, main: enMain },
    ru: { common: ruCommon, onboarding: ruOnboarding, main: ruMain },
    ua: { common: uaCommon, onboarding: uaOnboarding, main: uaMain },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
