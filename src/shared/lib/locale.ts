/**
 * Centralised BCP-47 mapping so every Intl consumer stays in sync.
 * Adding a new language? Change here — everywhere else picks it up.
 */
export const APP_TO_INTL_LOCALE: Record<string, string> = {
  en: 'en-US',
  ru: 'ru-RU',
  ua: 'uk-UA',
};

export function getIntlLocale(appLang: string): string {
  return APP_TO_INTL_LOCALE[appLang] ?? 'en-US';
}

/** Capitalises first character — needed for Russian/Ukrainian Intl output */
export function capitalizeFirst(str: string): string {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}
