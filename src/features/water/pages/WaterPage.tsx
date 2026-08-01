import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarDays } from 'lucide-react';

import { useTheme } from '@/shared/context/ThemeContext';
import { useUser } from '@/shared/context/UserContext';
import { DateStrip } from '@/shared/ui/DateStrip/DateStrip';
import { Calendar } from '@/shared/ui/DateStrip/Calendar';
import { DayCarousel } from '@/shared/ui/DayCarousel';
import { useDateStrip } from '@/shared/hooks/useDateStrip';
import { useActiveDates } from '@/shared/hooks/useActiveDates';
import { startOfDay, toApiDate } from '@/shared/lib/date';
import { water } from '@/shared/api/water';
import type { WaterLog } from '@/shared/types/api/water';

import { WaterDayContent } from '../components/WaterDayContent';
import { WaterLogModal } from '../components/WaterLog/WaterLogModal';
import { CustomAddModal } from '../components/CustomAdd/CustomAddModal';

export const WaterPage = () => {
  const theme = useTheme();
  const { t: tc } = useTranslation('common');
  const { user_data } = useUser();
  const queryClient = useQueryClient();

  const createdAt = user_data?.user.created_at;

  const {
    dates,
    selectedDate,
    monthKey,
    today,
    selectDate,
    selectDateExternal,
    pendingScrollDate,
    clearPendingScroll,
  } = useDateStrip();

  const activeDates = useActiveDates(dates[0], dates[dates.length - 1]);

  const minDate = useMemo(
    () => (createdAt ? startOfDay(new Date(createdAt)) : today),
    [createdAt, today],
  );

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [waterLogModalOpen, setWaterLogModalOpen] = useState(false);
  const [currentWaterLog, setCurrentWaterLog] = useState<
    WaterLog | undefined
  >();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // CustomAddModal рендерится здесь, а не внутри WaterDayContent — тот
  // компонент живёт в слайде DayCarousel/embla, а слайды трансформируются
  // (translate3d) для листания. position:fixed внутри трансформированного
  // предка перестаёт быть привязан к вьюпорту, из-за чего модалка "плывёт"
  // и остаётся свайпаемой вместе со слайдом (см. память проекта).
  const [customAddOpen, setCustomAddOpen] = useState(false);

  const onClick = useCallback((log: WaterLog) => {
    setCurrentWaterLog(log);
    setWaterLogModalOpen(true);
  }, []);

  const invalidateAfterChange = useCallback(
    (dateStr: string) => {
      queryClient.invalidateQueries({ queryKey: ['water', dateStr] });
      queryClient.invalidateQueries({ queryKey: ['stats', 'daily', dateStr] });
      queryClient.invalidateQueries({ queryKey: ['stats', 'active-dates'] });
    },
    [queryClient],
  );

  const { mutate: deleteLog } = useMutation({
    mutationFn: (logId: number) => water.remove(logId),
    onMutate: (logId: number) => {
      setDeletingId(logId);
      setIsDeleting(true);
    },
    onSettled: () => {
      setDeletingId(null);
      setIsDeleting(false);
    },
    onSuccess: () => {
      invalidateAfterChange(currentWaterLog?.log_date ?? toApiDate(new Date()));
      setWaterLogModalOpen(false);
    },
  });

  const todayStr = toApiDate(new Date());

  const { mutate: addWaterCustom } = useMutation({
    mutationFn: (ml: number) =>
      water.add({ log_date: todayStr, amount_ml: ml }),
    onSuccess: () => invalidateAfterChange(todayStr),
  });

  return (
    <div className="flex h-full flex-col gap-2 pb-0!">
      <header
        className="sticky top-0 z-10 flex flex-col gap-2 px-4 pt-1"
        style={{ backgroundColor: theme.bg_color }}
      >
        <section className="relative flex items-center justify-center px-px">
          <button
            onClick={() => setCalendarOpen(true)}
            className="absolute left-0 flex items-center rounded-xl transition-opacity active:opacity-60"
            style={{ color: theme.hint_color }}
          >
            <CalendarDays size={26} />
          </button>

          <span
            className="text-xl leading-none font-semibold tracking-wide"
            style={{ color: theme.text_color }}
          >
            {tc('nav.water')}
          </span>
        </section>

        <section>
          <DateStrip
            key={monthKey}
            dates={dates}
            selectedDate={selectedDate}
            today={today}
            minDate={minDate}
            activeDates={activeDates}
            onSelect={selectDate}
            pendingScrollDate={pendingScrollDate}
            onScrollConsumed={clearPendingScroll}
          />
        </section>
      </header>

      <div className="min-h-0 flex-1">
        <DayCarousel
          selectedDate={selectedDate}
          dates={dates}
          minDate={minDate}
          maxDate={today}
          onDateChange={selectDate}
          renderDay={(date, isActive) => (
            <WaterDayContent
              date={date}
              isActive={isActive}
              onWaterLogClick={onClick}
              onOpenCustomAdd={() => setCustomAddOpen(true)}
              deletingId={deletingId}
            />
          )}
        />
      </div>

      {calendarOpen && (
        <Calendar
          selectedDate={selectedDate}
          minDate={minDate}
          maxDate={today}
          onSelect={(date) => {
            selectDateExternal(date);
            setCalendarOpen(false);
          }}
          onClose={() => setCalendarOpen(false)}
        />
      )}

      {waterLogModalOpen && currentWaterLog && (
        <WaterLogModal
          onClose={() => !isDeleting && setWaterLogModalOpen(false)}
          log={currentWaterLog}
          onDelete={deleteLog}
          isDeleting={isDeleting}
        />
      )}

      {customAddOpen && (
        <CustomAddModal
          onClose={() => setCustomAddOpen(false)}
          onConfirm={(ml) => {
            addWaterCustom(ml);
            setCustomAddOpen(false);
          }}
        />
      )}
    </div>
  );
};
