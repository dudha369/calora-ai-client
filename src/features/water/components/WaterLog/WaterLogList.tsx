import { useTheme } from '@/shared/context/ThemeContext';
import { WaterLogCard } from './WaterLogCard';
import type { WaterLog } from '@/shared/types/api/water';

interface WaterLogListProps {
  logs: WaterLog[];
  isLoading: boolean;
  deletingId: number | null;
  onWaterLogCardClick: (log: WaterLog) => void;
}

const CardSkeleton = () => {
  const theme = useTheme();

  return (
    <div
      className="h-12.5 animate-pulse rounded-2xl"
      style={{ backgroundColor: theme.secondary_bg_color }}
    />
  );
};

export const WaterLogList = ({
  logs,
  isLoading,
  deletingId,
  onWaterLogCardClick,
}: WaterLogListProps) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col divide-y divide-(--tg-section-separator-color) rounded-2xl"
      style={{
        backgroundColor: theme.section_bg_color,
      }}
    >
      {logs.map((log) => (
        <WaterLogCard
          key={log.id}
          log={log}
          isDeleting={deletingId === log.id}
          onClickRef={onWaterLogCardClick}
        />
      ))}
    </div>
  );
};
