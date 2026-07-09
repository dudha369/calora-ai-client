import { useTheme } from '@/shared/context/ThemeContext';
import { FoodLogCard } from './FoodLogCard';
import type { FoodLog } from '@/shared/types/api/food';

interface FoodLogListProps {
  logs: FoodLog[];
  isLoading: boolean;
  deletingId: number | null;
  onFoodLogClick: (log: FoodLog) => void;
}

const CardSkeleton = () => {
  const theme = useTheme();

  return (
    <div
      className="h-24 animate-pulse rounded-2xl"
      style={{ backgroundColor: theme.secondary_bg_color }}
    />
  );
};

export const FoodLogList = ({
  logs,
  isLoading,
  deletingId,
  onFoodLogClick,
}: FoodLogListProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {logs.map((log) => (
        <FoodLogCard
          key={log.id}
          log={log}
          isDeleting={deletingId === log.id}
          onClickRef={onFoodLogClick}
        />
      ))}
    </div>
  );
};
