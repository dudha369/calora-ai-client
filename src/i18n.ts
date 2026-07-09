import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const localeModules = import.meta.glob<{ default: Record<string, unknown> }>(
  './locales/*/*.json',
  { eager: true },
);

const LOCALE_FILE_RE = /\.\/locales\/([a-z]{2})\/([\w-]+)\.json$/;

const resources: Record<string, Record<string, Record<string, unknown>>> = {};

for (const [path, mod] of Object.entries(localeModules)) {
  const match = LOCALE_FILE_RE.exec(path);
  if (!match) continue;
  const [, lang, namespace] = match;
  (resources[lang] ??= {})[namespace] = mod.default;
}

export const SUPPORTED_LANGUAGES = Object.keys(resources).sort();

export type AppLanguage = string;

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: Object.keys(resources.en ?? {}),
  defaultNS: 'common',
  resources,
  interpolation: { escapeValue: false },
});

export default i18n;
