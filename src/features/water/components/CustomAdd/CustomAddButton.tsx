import { Plus } from 'lucide-react';
import { useTheme } from '@/shared/context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface CustomAddButtonProps {
  onClick: () => void;
}

export const CustomAddButton = ({ onClick }: CustomAddButtonProps) => {
  const theme = useTheme();
  const { t } = useTranslation('water_page');

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-1 py-2.5 transition-opacity hover:opacity-80"
      style={{
        borderColor: theme.secondary_bg_color,
        backgroundColor: 'transparent',
      }}
    >
      <div
        className="flex items-center justify-center rounded-full p-1.5"
        style={{ backgroundColor: theme.section_bg_color }}
      >
        <Plus
          size={24}
          strokeWidth={2}
          style={{
            color: theme.button_color,
          }}
        />
      </div>
      <span
        className="text-[10px] font-medium"
        style={{ color: theme.hint_color }}
      >
        {t('custom')}
      </span>
    </button>
  );
};
