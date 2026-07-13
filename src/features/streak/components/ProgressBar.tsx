import { useTheme } from '@/shared/context/ThemeContext.ts';
import { Check, AlertTriangle } from 'lucide-react';
import type { TodayProgress, GoalType } from '@/shared/types/api/streak.ts';

interface ProgressBarProps {
  p: TodayProgress;
  goalType: GoalType;
}

export const ProgressBar = ({ p, goalType }: ProgressBarProps) => {
  const theme = useTheme();
  const toFixed = (value: number) => (value >= 100 ? 100 : value);
  const barWidth = toFixed(
    Math.round((p.calories * 100) / Math.max(p.calories_min, 1)),
  );

  const isMet = p.status === 'met';
  const isOverPenalized = p.status === 'over' && goalType !== 'gain';

  const barColor = isOverPenalized
    ? theme.destructive_text_color
    : theme.button_color;

  return (
    <div
      className="relative h-2.5 w-full overflow-hidden rounded-full"
      style={{ backgroundColor: theme.section_separator_color }}
    >
      <div
        className="absolute top-0 left-0 h-full rounded-full transition-[width,background-color] duration-300"
        style={{
          width: `${barWidth}%`,
          backgroundColor: barColor,
        }}
      />

      {(isMet || isOverPenalized) && (
        <div
          className="absolute right-0 flex aspect-square items-center justify-center rounded-full p-px"
          style={{
            backgroundColor: barColor,
            color: theme.secondary_bg_color,
            outline: `${theme.secondary_bg_color} solid 4px`,
          }}
        >
          {isOverPenalized ? (
            <AlertTriangle strokeWidth={2} size={12} />
          ) : (
            <Check strokeWidth={2} size={12} />
          )}
        </div>
      )}
    </div>
  );
};
