import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { GlassWater, Coffee, Milk, Icon, RefreshCw } from 'lucide-react';
import { bottlePlastic } from '@lucide/lab';

import { useTheme } from '@/shared/context/ThemeContext';
import { useUser } from '@/shared/context/UserContext';
import { toApiDate, isSameDay } from '@/shared/lib/date';
import { cn } from '@/shared/lib/cn';
import { MARKER_WATER_COLOR } from '@/shared/constants/markers';
import { water } from '@/shared/api/water';
import type { WaterByDateResponse, WaterLog } from '@/shared/types/api/water';

import { ProgressBar } from './ProgressBar';
import { QuickAddButton } from './QuickAddButton';
import { CustomAddButton } from './CustomAdd/CustomAddButton';
import { WaterJug } from './WaterJug';
import { WaterLogList } from './WaterLog/WaterLogList';

const MIN_SPIN_MS = 600;
const REFRESH_COOLDOWN_MS = 2_500;

interface WaterDayContentProps {
  date: Date;
  isActive: boolean;
  onWaterLogClick: (log: WaterLog) => void;
  /** Открывает CustomAddModal, смонтированный на уровне WaterPage —
   *  сам модал НЕ рендерится здесь, т.к. этот компонент живёт внутри
   *  трансформированного слайда DayCarousel/embla, где position:fixed
   *  перестаёт быть привязан к вьюпорту (см. память проекта про embla+fixed). */
  onOpenCustomAdd: () => void;
  deletingId: number | null;
}

export const WaterDayContent = ({
  date,
  isActive,
  onWaterLogClick,
  onOpenCustomAdd,
  deletingId,
}: WaterDayContentProps) => {
  const theme = useTheme();
  const { t } = useTranslation('water_page');
  const { t: tc } = useTranslation('common');
  const { user_data } = useUser();
  const queryClient = useQueryClient();

  const dateStr = toApiDate(date);
  const isToday = isSameDay(date, new Date());
  const goalMl = user_data?.goal?.water_ml ?? 0;

  const [deferredFetchReady, setDeferredFetchReady] = useState(isActive);
  useEffect(() => {
    if (isActive || deferredFetchReady) return;
    const timer = setTimeout(() => setDeferredFetchReady(true), 150);
    return () => clearTimeout(timer);
  }, [isActive, deferredFetchReady]);
  const shouldFetch = isActive || deferredFetchReady;

  const {
    data,
    isLoading: waterLoading,
    isFetching: waterFetching,
  } = useQuery<WaterByDateResponse>({
    queryKey: ['water', dateStr],
    queryFn: async () => (await water.getByDate(dateStr)).data,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    enabled: shouldFetch,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['water', dateStr] });
    queryClient.invalidateQueries({ queryKey: ['stats', 'daily', dateStr] });
    queryClient.invalidateQueries({ queryKey: ['stats', 'active-dates'] });
  }, [queryClient, dateStr]);

  const { mutate: addWaterHere } = useMutation({
    mutationFn: (ml: number) => water.add({ log_date: dateStr, amount_ml: ml }),
    onSuccess: invalidate,
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

  const shouldSpin = isSpinning || waterFetching;

  const handleRefresh = useCallback(() => {
    if (inCooldown) return;

    setIsSpinning(true);
    spinTimerRef.current = setTimeout(() => setIsSpinning(false), MIN_SPIN_MS);

    setInCooldown(true);
    cooldownTimerRef.current = setTimeout(
      () => setInCooldown(false),
      REFRESH_COOLDOWN_MS,
    );

    invalidate();
  }, [inCooldown, invalidate]);

  const logs = data?.logs ?? [];
  const totalMl = data?.total_ml ?? 0;
  const remainMl = Math.max(goalMl - totalMl, 0);
  const percent = goalMl > 0 ? Math.round((totalMl * 100) / goalMl) : 0;
  const displayPercent = percent > 100 ? 100 : percent;

  return (
    <section className="flex h-full flex-col gap-2.5 overflow-y-auto px-4 pb-4">
      <section
        className="flex items-stretch gap-2 rounded-3xl p-4"
        style={{ backgroundColor: theme.section_bg_color }}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span
              className="text-sm font-medium"
              style={{ color: theme.hint_color }}
            >
              {t('today_progress')}
            </span>

            <div className="flex items-baseline gap-2">
              <span
                className="text-5xl font-bold tracking-tight"
                style={{ color: MARKER_WATER_COLOR }}
              >
                {totalMl}
              </span>
              <span
                className="text-xl font-medium"
                style={{ color: MARKER_WATER_COLOR }}
              >
                {tc('units.ml')}
              </span>
            </div>

            <span
              className="text-sm font-medium"
              style={{ color: theme.text_color }}
            >
              {t('of')} {goalMl} {tc('units.ml')} {t('goal')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <ProgressBar current={totalMl} goal={goalMl} />
            </div>

            <span
              className="text-sm font-medium"
              style={{ color: theme.text_color }}
            >
              {displayPercent}%
            </span>
          </div>

          <span
            className="w-fit rounded-xl px-2 py-1 text-sm font-medium"
            style={{
              outline: `2px dashed ${MARKER_WATER_COLOR}`,
              color: theme.text_color,
            }}
          >
            {remainMl} {tc('units.ml')} {t('left')}
          </span>
        </div>

        <div className="flex w-28 shrink-0 items-center justify-center">
          <WaterJug
            valueMl={totalMl}
            goalMl={goalMl}
            waterColor={MARKER_WATER_COLOR}
            className="h-full w-full max-w-28"
          />
        </div>
      </section>

      {isToday && (
        <div className="flex flex-col gap-0.5">
          <span
            className="ml-1 text-base font-semibold"
            style={{ color: theme.subtitle_text_color }}
          >
            {t('quick_add')}
          </span>

          <section className="grid grid-cols-5 gap-2">
            <QuickAddButton
              onClick={addWaterHere}
              icon={GlassWater}
              volume={250}
              title={t('glass')}
            />
            <QuickAddButton
              onClick={addWaterHere}
              icon={Coffee}
              volume={350}
              title={t('cup')}
            />
            <QuickAddButton
              onClick={addWaterHere}
              icon={Milk}
              volume={500}
              title={t('bottle')}
            />
            <QuickAddButton
              onClick={addWaterHere}
              icon={(props) => <Icon iconNode={bottlePlastic} {...props} />}
              volume={750}
              title={t('bottle')}
            />

            <CustomAddButton onClick={onOpenCustomAdd} />
          </section>
        </div>
      )}

      <div className="flex flex-col gap-px">
        <div
          className="flex items-center gap-px"
          style={{ color: theme.subtitle_text_color }}
        >
          <span className="text-base font-semibold tracking-wide">
            {t('today_logs')}
          </span>

          <button
            onClick={handleRefresh}
            aria-label={t('today_logs')}
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
          className="transition-opacity duration-300"
          style={{ opacity: waterFetching && !waterLoading ? 0.7 : 1 }}
        >
          {logs.length > 0 ? (
            <WaterLogList
              logs={logs}
              isLoading={waterLoading}
              deletingId={deletingId}
              onWaterLogCardClick={onWaterLogClick}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
};
