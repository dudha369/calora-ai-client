import { useTelegram } from '../../hooks/useTelegram';

interface Props {
  current: number; // 0-based index of active step
  total: number;
}

export const OnboardingProgress = ({ current, total }: Props) => {
  const { theme } = useTelegram();
  const pct = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <div className="px-4 pt-4 pb-1">
      <div
        className="w-full h-1 rounded-full overflow-hidden"
        style={{ backgroundColor: theme.secondary_bg_color }}
      >
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${pct}%`, backgroundColor: theme.button_color }}
        />
      </div>
      <p className="text-xs mt-1.5 text-right tabular-nums" style={{ color: theme.hint_color }}>
        {current + 1} / {total}
      </p>
    </div>
  );
};
