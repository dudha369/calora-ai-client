import { useTheme } from '@/shared/context/ThemeContext.ts';

interface ProgressBarProps {
  current: number;
  goal: number;
}

export const ProgressBar = ({ current, goal }: ProgressBarProps) => {
  const theme = useTheme();
  const toFixed = (value: number) => (value >= 100 ? 100 : value);
  const barWidth = toFixed(Math.round((current * 100) / Math.max(goal, 1)));

  return (
    <div
      className="relative flex h-2.5 w-full items-center rounded-full"
      style={{ backgroundColor: theme.bg_color }}
    >
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{
          width: `${barWidth}%`,
          backgroundColor: theme.button_color,
        }}
      />
    </div>
  );
};
