import { cloudStorage } from '@telegram-apps/sdk';
import i18n, { type AppLanguage } from '../i18n';

export async function changeAppLanguage(lang: AppLanguage) {
  await cloudStorage.setItem('app_language', lang);
  await i18n.changeLanguage(lang);
}
