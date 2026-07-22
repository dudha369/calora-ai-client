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
      className="relative flex h-2 w-full items-center rounded-full"
      style={{ backgroundColor: theme.section_separator_color }}
    >
      <div
        className="h-full rounded-full transition-[width,background-color] duration-300"
        style={{
          width: `${barWidth}%`,
          backgroundColor: barColor,
        }}
      />

      {(isMet || isOverPenalized) && (
        <div
          className="absolute top-1/2 right-0 flex size-5 -translate-y-1/2 items-center justify-center rounded-full"
          style={{
            backgroundColor: barColor,
            color: theme.text_color,
            outline: `${theme.secondary_bg_color} solid 4px`,
          }}
        >
          {isOverPenalized ? (
            <AlertTriangle strokeWidth={3} size={12} />
          ) : (
            <Check strokeWidth={3} size={12} />
          )}
        </div>
      )}
    </div>
  );
};
