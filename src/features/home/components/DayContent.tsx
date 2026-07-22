import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useQuery,
  keepPreviousData,
  useQueryClient,
} from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/shared/context/ThemeContext';
import { Skeleton } from '@/shared/ui/Skeleton';
import { CaloriesArc } from './CaloriesArc';
import { NutritionCard } from './NutritionCard';
import { NoLogsBanner } from './NoLogsBanner';
import { FoodLogList } from './FoodLog/FoodLogList';
import { stats } from '@/shared/api/stats';
import { food } from '@/shared/api/food';
import { toApiDate, isSameDay } from '@/shared/lib/date';
import type { DailyStats } from '@/shared/types/api/stats';
import type { FoodByDateResponse, FoodLog } from '@/shared/types/api/food';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

const MIN_SPIN_MS = 600;
const REFRESH_COOLDOWN_MS = 2_500;

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
  const navigate = useNavigate();

  const theme = useTheme();
  const { t } = useTranslation('home_page');
  const queryClient = useQueryClient();

  const dateStr = toApiDate(date);
  const isToday = isSameDay(date, new Date());

  const [deferredFetchReady, setDeferredFetchReady] = useState(isActive);

  useEffect(() => {
    if (isActive || deferredFetchReady) return;
    const timer = setTimeout(() => setDeferredFetchReady(true), 150);
    return () => clearTimeout(timer);
  }, [isActive, deferredFetchReady]);

  const shouldFetch = isActive || deferredFetchReady;

  const {
    data: statsData,
    isLoading: statsLoading,
    isFetching: statsFetching,
  } = useQuery<DailyStats>({
    queryKey: ['stats', 'daily', dateStr],
    queryFn: async () => (await stats.getDaily(dateStr)).data,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: shouldFetch,
  });

  const {
    data: foodData,
    isLoading: foodLoading,
    isFetching: foodFetching,
  } = useQuery<FoodByDateResponse>({
    queryKey: ['food', dateStr],
    queryFn: async () => (await food.getByDate(dateStr)).data,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: shouldFetch,
  });

  const [isSpinning, setIsSpinning] = useState(false);
  const [inCooldown, setInCooldown] = useState(false);
  const spinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, []);

  const isNetworkFetching = statsFetching || foodFetching;

  const shouldSpin = isSpinning || isNetworkFetching;

  const handleRefresh = useCallback(() => {
    if (inCooldown) return;

    setIsSpinning(true);
    spinTimerRef.current = setTimeout(() => setIsSpinning(false), MIN_SPIN_MS);

    setInCooldown(true);
    cooldownTimerRef.current = setTimeout(
      () => setInCooldown(false),
      REFRESH_COOLDOWN_MS,
    );

    queryClient.invalidateQueries({ queryKey: ['food', dateStr] });
    queryClient.invalidateQueries({ queryKey: ['stats', 'daily', dateStr] });
    queryClient.invalidateQueries({ queryKey: ['stats', 'active-dates'] });
    queryClient.invalidateQueries({ queryKey: ['user'] });
  }, [inCooldown, dateStr, queryClient]);

  return (
    <section
      className="flex h-full flex-col gap-3 overflow-y-auto px-4 pb-4"
      style={isActive ? { viewTransitionName: 'day-content' } : undefined}
    >
      <section
        className="flex h-70 w-full shrink-0 cursor-pointer flex-col rounded-3xl"
        style={{ backgroundColor: theme.section_bg_color }}
        onClick={() => navigate(`/analytics/${dateStr}`)}
      >
        <div className="h-50">
          <CaloriesArc
            value={statsData?.calories}
            max={statsData?.calories_goal}
            radius={50}
            strokeWidth={5}
          />
        </div>
        <div className="flex items-center justify-center gap-6">
          <NutritionCard
            title={t('protein')}
            value={statsData?.protein_g}
            max={statsData?.protein_goal_g}
          />
          <NutritionCard
            title={t('fat')}
            value={statsData?.fat_g}
            max={statsData?.fat_goal_g}
          />
          <NutritionCard
            title={t('carbs')}
            value={statsData?.carbs_g}
            max={statsData?.carbs_goal_g}
          />
        </div>
      </section>

      <div className="flex flex-col gap-px">
        <div
          className="flex items-center gap-px"
          style={{ color: theme.subtitle_text_color }}
        >
          <span className="text-lg font-semibold tracking-wide">
            {t('daily_meals')}
          </span>

          <button
            onClick={handleRefresh}
            aria-label={t('update_data')}
            disabled={inCooldown}
            className={cn(
              'flex justify-center rounded-lg p-1 align-bottom transition-all duration-200',
              inCooldown ? 'cursor-default opacity-30' : 'active:scale-90',
            )}
            style={{ color: theme.hint_color }}
          >
            <RefreshCw size={15} className={shouldSpin ? 'animate-spin' : ''} />
          </button>
        </div>

        <div
          className="flex flex-col gap-3 transition-opacity duration-300"
          style={{ opacity: isNetworkFetching && !statsLoading ? 0.65 : 1 }}
        >
          {statsLoading || foodLoading ? (
            <Skeleton className="h-36" />
          ) : (
            <>
              {foodData?.logs && foodData.logs.length > 0 ? (
                <FoodLogList
                  logs={foodData.logs}
                  isLoading={foodLoading}
                  deletingId={deletingId}
                  onFoodLogCardClick={onFoodLogClick}
                />
              ) : (
                <NoLogsBanner isToday={isToday} />
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};
