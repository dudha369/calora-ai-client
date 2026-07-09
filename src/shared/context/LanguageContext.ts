import { createContext, useContext } from 'react';
import type { AppLanguage } from '@/app/i18n';

export interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: async () => {},
});

export const useLanguageMode = () => useContext(LanguageContext);
export default LanguageContext;
