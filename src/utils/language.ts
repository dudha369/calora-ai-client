import i18n, { SUPPORTED_LANGUAGES, type AppLanguage } from '../i18n';

export interface LanguageOption {
  code: AppLanguage;
  label: string;
  flag: string;
}

/**
 * Строит список языков для UI прямо из _meta каждого common.json,
 * а не из отдельно поддерживаемого массива. Новая папка языка
 * автоматически появляется во всех пикерах приложения (онбординг,
 * настройки, ...) — регистрировать её больше нигде не нужно.
 */
export function listLanguageOptions(): LanguageOption[] {
  return SUPPORTED_LANGUAGES.map((code) => {
    const meta = (
      i18n.getResourceBundle(code, 'common') as {
        _meta?: { label?: string; flag?: string };
      }
    )?._meta;

    return {
      code,
      label: meta?.label ?? code.toUpperCase(),
      flag: meta?.flag ?? '🏳️',
    };
  });
}
