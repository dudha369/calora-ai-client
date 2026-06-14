import { useTheme } from '../../context/ThemeContext';
import { FoodLogCard } from './FoodLogCard';
import type { FoodLog } from '../../interfaces/api/food';

interface Props {
  logs: FoodLog[];
  isLoading: boolean;
  deletingId: number | null;
  onDelete: (logId: number) => void;
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
  onDelete,
}: Props) => {
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
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
