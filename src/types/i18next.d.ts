import 'i18next';
import type enCommon from '../locales/en/common.json';
import type enOnboarding from '../locales/en/onboarding.json';
import type enMain from '../locales/en/main.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof enCommon;
      onboarding: typeof enOnboarding;
      main: typeof enMain;
    };
  }
}
