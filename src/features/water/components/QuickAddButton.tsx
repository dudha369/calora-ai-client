import { type ElementType } from 'react';
import { useTheme } from '@/shared/context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface QuickAddButtonProps {
  onClick: (ml: number) => void;
  icon: ElementType;
  volume: number;
  title: string;
}

export const QuickAddButton = ({
  onClick,
  icon: Icon,
  volume,
  title,
}: QuickAddButtonProps) => {
  const theme = useTheme();
  const { t: tc } = useTranslation('common');

  return (
    <button
      onClick={() => onClick(volume)}
      className="flex flex-col items-center justify-center gap-2 rounded-2xl px-1 py-2.5 transition-opacity hover:opacity-85"
      style={{ backgroundColor: theme.secondary_bg_color }}
    >
      <Icon size={32} strokeWidth={1.5} style={{ color: theme.button_color }} />
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-xs font-bold" style={{ color: theme.text_color }}>
          {volume} {tc('units.ml')}
        </span>
        <span
          className="text-[10px] font-medium"
          style={{ color: theme.hint_color }}
        >
          {title}
        </span>
      </div>
    </button>
  );
};
