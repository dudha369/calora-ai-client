import { FoodLogCard } from './FoodLogCard';
import type { FoodLog } from '@/shared/types/api/food';
import { NoLogsBanner } from '@/features/home/components/NoLogsBanner';
import { isSameDay } from '@/shared/lib/date';
import { Skeleton } from '@/shared/ui/Skeleton';

interface FoodLogListProps {
  logs?: FoodLog[];
  date: Date;
  isLoading: boolean;
  deletingId: number | null;
  onFoodLogCardClick: (log: FoodLog) => void;
}

export const FoodLogList = ({
  logs,
  date,
  isLoading,
  deletingId,
  onFoodLogCardClick,
}: FoodLogListProps) => {
  const isToday = isSameDay(date, new Date());

  return (
    <div className="flex flex-col gap-2">
      {isLoading ? (
        <Skeleton className="h-36" />
      ) : logs && logs.length > 0 ? (
        logs.map((log) => (
          <FoodLogCard
            key={log.id}
            log={log}
            isDeleting={deletingId === log.id}
            onClickRef={onFoodLogCardClick}
          />
        ))
      ) : (
        <NoLogsBanner isToday={isToday} />
      )}
    </div>
  );
};
