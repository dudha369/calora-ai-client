import { useTranslation } from 'react-i18next';
import { HousePlus } from 'lucide-react';
import { useTheme } from '@/shared/context/ThemeContext';
import { useAddToHomeScreen } from '@/shared/hooks/useAddToHomeScreen';

export const AddToHomeScreenCard = () => {
  const theme = useTheme();
  const { t } = useTranslation('settings_page');
  const { isEligible, addToHomeScreen } = useAddToHomeScreen();

  if (!isEligible) return null;

  return (
    <div
      className="flex flex-col gap-3 overflow-hidden rounded-2xl px-5 py-4"
      style={{
        backgroundColor: theme.section_bg_color,
      }}
    >
      <button
        onClick={addToHomeScreen}
        className="flex w-full items-center justify-center gap-1 rounded-xl py-2.5 text-base font-semibold transition-opacity hover:opacity-90"
        style={{
          backgroundColor: theme.button_color,
          color: theme.button_text_color,
        }}
      >
        <HousePlus size={20} strokeWidth={2} />
        {t('add_to_home_screen')}
      </button>
      <p
        className="px-2.5 text-center text-sm leading-4"
        style={{ color: theme.hint_color }}
      >
        {t('add_to_home_screen_hint')}
      </p>
    </div>
  );
};
