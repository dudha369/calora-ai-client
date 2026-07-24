import { useTheme } from '@/shared/context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface QuickAddButtonProps {
  value: number;
  onClick: (ml: number) => void;
}

export const QuickAddButton = ({ value, onClick }: QuickAddButtonProps) => {
  const theme = useTheme();
  const { t: tc } = useTranslation('common');

  return (
    <button
      onClick={() => onClick(value)}
      className="flex w-full items-center justify-center rounded-lg p-1.5"
      style={{
        backgroundColor: theme.button_color,
      }}
    >
      <span
        className="text-sm leading-none"
        style={{ color: theme.button_text_color }}
      >
        {value} {tc('units.ml')}
      </span>
    </button>
  );
};
