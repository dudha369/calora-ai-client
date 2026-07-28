import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { useTheme } from '@/shared/context/ThemeContext';
import { useAddToHomeScreen } from '@/shared/hooks/useAddToHomeScreen';

export const AddToHomeScreenCard = () => {
  const theme = useTheme();
  const { t } = useTranslation('settings_page');
  const { isEligible, addToHomeScreen } = useAddToHomeScreen();

  if (!isEligible) return null;

  return (
    <div
      className="flex flex-col gap-2 overflow-hidden rounded-2xl pb-1"
      style={{
        backgroundColor: theme.section_bg_color,
      }}
    >
      <button
        onClick={addToHomeScreen}
        className="flex w-full items-center justify-center gap-2 py-4 text-base font-semibold transition-opacity hover:opacity-90"
        style={{
          backgroundColor: theme.button_color,
          color: theme.button_text_color,
        }}
      >
        <Plus size={20} strokeWidth={2.5} />
        {t('add_to_home_screen')}
      </button>
      <p
        className="px-2 text-center text-xs leading-relaxed"
        style={{ color: theme.hint_color }}
      >
        {t('add_to_home_screen_hint')}
      </p>
    </div>
  );
};
