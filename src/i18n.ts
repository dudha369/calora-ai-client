import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// EN
import enCommon from './locales/en/common.json';
import enOnboarding from './locales/en/onboarding_page.json';
import enHomePage from './locales/en/home_page.json';
import enScannerPage from './locales/en/scanner_page.json';
import enProfilePage from './locales/en/profile_page.json';

// RU
import ruCommon from './locales/ru/common.json';
import ruOnboarding from './locales/ru/onboarding_page.json';
import ruHomePage from './locales/ru/home_page.json';
import ruScannerPage from './locales/ru/scanner_page.json';
import ruProfilePage from './locales/ru/profile_page.json';

// UA
import uaCommon from './locales/ua/common.json';
import uaOnboarding from './locales/ua/onboarding_page.json';
import uaHomePage from './locales/ua/home_page.json';
import uaScannerPage from './locales/ua/scanner_page.json';
import uaProfilePage from './locales/ua/profile_page.json';

export const SUPPORTED_LANGUAGES = ['en', 'ru', 'ua'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['common', 'onboarding', 'home_page', 'scanner_page', 'profile_page'],
  defaultNS: 'common',
  resources: {
    en: {
      common: enCommon,
      onboarding: enOnboarding,
      home_page: enHomePage,
      scanner_page: enScannerPage,
      profile_page: enProfilePage,
    },
    ru: {
      common: ruCommon,
      onboarding: ruOnboarding,
      home_page: ruHomePage,
      scanner_page: ruScannerPage,
      profile_page: ruProfilePage,
    },
    ua: {
      common: uaCommon,
      onboarding: uaOnboarding,
      home_page: uaHomePage,
      scanner_page: uaScannerPage,
      profile_page: uaProfilePage,
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
