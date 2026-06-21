import { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Skeleton } from '../Skeleton';
import { CaloriesArc } from './CaloriesArc';
import { NutritionCard } from './NutritionCard';
import { NoLogsBanner } from './NoLogsBanner';
import { FoodLogList } from '../FoodLog/FoodLogList';
import { stats } from '../../api/stats';
import { food } from '../../api/food';
import { toApiDate, isSameDay } from '../../utils/date';
import type { DailyStats } from '../../interfaces/api/stats';
import type { FoodByDateResponse, FoodLog } from '../../interfaces/api/food';

interface DayContentProps {
  date: Date;
  isActive: boolean;
  onFoodLogClick: (log: FoodLog) => void;
  deletingId: number | null;
}

export const DayContent = ({
  date,
  isActive,
  onFoodLogClick,
  deletingId,
}: DayContentProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dateStr = toApiDate(date);
  const isToday = isSameDay(date, new Date());

  // Трюк для ускорения загрузки: даём сети фору в 150мс на загрузку активного дня,
  // прежде чем начинать фетчить соседние невидимые дни (вчера и завтра).
  const [deferredFetchReady, setDeferredFetchReady] = useState(isActive);

  useEffect(() => {
    if (isActive || deferredFetchReady) return;

    const timer = setTimeout(() => {
      setDeferredFetchReady(true);
    }, 150);

    return () => clearTimeout(timer);
  }, [isActive, deferredFetchReady]);

  const shouldFetch = isActive || deferredFetchReady;

  const { data, isLoading: statsLoading } = useQuery<DailyStats>({
    queryKey: ['stats', 'daily', dateStr],
    queryFn: async () => (await stats.getDaily(dateStr)).data,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: shouldFetch,
  });

  const { data: foodData, isLoading: foodLoading } =
    useQuery<FoodByDateResponse>({
      queryKey: ['food', dateStr],
      queryFn: async () => (await food.getByDate(dateStr)).data,
      staleTime: 60 * 1000,
      placeholderData: keepPreviousData,
      enabled: shouldFetch,
    });

  return (
    <main
      className="flex h-full flex-col gap-3 overflow-y-auto px-4 pb-4"
      style={isActive ? { viewTransitionName: 'day-content' } : undefined}
    >
      <section
        className="flex h-70 w-full shrink-0 flex-col rounded-3xl"
        style={{ backgroundColor: theme.section_bg_color }}
        onClick={() => navigate('/analytics')}
      >
        <div className="h-50">
          <CaloriesArc
            value={data?.calories}
            max={data?.calories_goal}
            radius={50}
            strokeWidth={5}
          />
        </div>
        <div className="flex items-center justify-center gap-6">
          <NutritionCard
            title="Protein"
            value={data?.protein_g}
            max={data?.protein_goal_g}
          />
          <NutritionCard
            title="Fat"
            value={data?.fat_g}
            max={data?.fat_goal_g}
          />
          <NutritionCard
            title="Carbs"
            value={data?.carbs_g}
            max={data?.carbs_goal_g}
          />
        </div>
      </section>

      <div className="flex flex-col gap-px">
        <span
          className="text-lg font-semibold tracking-wide"
          style={{ color: theme.subtitle_text_color }}
        >
          Daily Meals
        </span>

        <div className="flex flex-col gap-3">
          {statsLoading ? (
            <Skeleton className="h-36" />
          ) : (
            <div>
              {data?.has_data && foodData ? (
                <FoodLogList
                  logs={foodData.logs}
                  isLoading={foodLoading}
                  deletingId={deletingId}
                  onFoodLogClick={onFoodLogClick}
                />
              ) : (
                <NoLogsBanner isToday={isToday} />
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
