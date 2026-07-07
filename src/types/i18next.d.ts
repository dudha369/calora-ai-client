import 'i18next';
import type enCommon from '../locales/en/common.json';
import type enOnboarding from '../locales/en/onboarding_page.json';
import type enHomePage from '../locales/en/home_page.json';
import type enScannerPage from '../locales/en/scanner_page.json';
import type enProfilePage from '../locales/en/profile_page.json';

// English locale is the source of truth for types —
// TypeScript will flag missing keys in other languages at dev time.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof enCommon;
      onboarding: typeof enOnboarding;
      home_page: typeof enHomePage;
      scanner_page: typeof enScannerPage;
      profile_page: typeof enProfilePage;
    };
  }
}
