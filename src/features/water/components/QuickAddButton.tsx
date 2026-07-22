import { type ElementType, useMemo } from 'react';
import { useTheme } from '@/shared/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { water } from '@/shared/api/water';
import { toApiDate } from '@/shared/lib/date';
import { getMarkerBackground } from '@/features/home/lib/getMarkerBackground';

interface QuickAddButtonProps {
  icon: ElementType;
  volume: number;
  title: string;
}

export const QuickAddButton = ({
  icon: Icon,
  volume,
  title,
}: QuickAddButtonProps) => {
  const theme = useTheme();
  const waterColor = getMarkerBackground(false, true, false, '', '');
  const { t: tc } = useTranslation('common');
  const qc = useQueryClient();

  const today = useMemo(() => toApiDate(new Date()), []);
  const { mutate: addWater } = useMutation({
    mutationFn: (ml: number) => water.add({ log_date: today, amount_ml: ml }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['water', today] });
      qc.invalidateQueries({ queryKey: ['stats', 'daily', today] });
    },
  });

  return (
    <button
      onClick={() => addWater(volume)}
      className="flex flex-col items-center justify-center gap-2 rounded-2xl px-1 py-2 transition-opacity hover:opacity-80"
      style={{ backgroundColor: theme.secondary_bg_color }}
    >
      <Icon size={32} strokeWidth={1.5} style={{ color: waterColor }} />
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
