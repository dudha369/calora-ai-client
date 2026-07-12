import { useTheme } from '@/shared/context/ThemeContext.ts';
import { Check } from 'lucide-react';
import type { TodayProgress } from '@/shared/types/api/streak.ts';

export const ProgressBar = ({ p }: { p: TodayProgress }) => {
  const theme = useTheme();
  const toFixed = (value: number) => (value >= 100 ? 100 : value);
  const barWidth = toFixed(Math.round((p.calories * 100) / p.calories_min));

  return (
    <div
      className="relative h-2.5 w-full overflow-hidden rounded-full"
      style={{ backgroundColor: theme.section_separator_color }}
    >
      <div
        className="absolute top-0 left-0 h-full rounded-full"
        style={{
          width: `${barWidth}%`,
          backgroundColor: theme.button_color,
        }}
      />

      {p.status === 'met' && (
        <div
          className="absolute right-0 flex aspect-square items-center rounded-full p-px"
          style={{
            backgroundColor: theme.button_color,
            color: theme.secondary_bg_color,
            outline: `${theme.secondary_bg_color} solid 4px`,
          }}
        >
          <Check strokeWidth={2} size={12} />
        </div>
      )}
    </div>
  );
};
