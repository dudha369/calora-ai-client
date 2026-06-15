import i18n, { type AppLanguage } from '../i18n';

/**
 * Change application language. Called from settings or onboarding.
 * Language choice is saved server-side (onboarding draft / user profile).
 */
export async function changeAppLanguage(lang: AppLanguage) {
  await i18n.changeLanguage(lang);
}
