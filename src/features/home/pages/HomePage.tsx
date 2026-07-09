import { useCallback, useMemo, useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Sprout, Flame, CalendarDays } from 'lucide-react';

import { useUser } from '@/shared/context/UserContext';
import { useTheme } from '@/shared/context/ThemeContext';
import { DateStrip } from '../components/DateStrip/DateStrip';
import { Calendar } from '../components/DateStrip/Calendar';
import { DayCarousel } from '../components/NutritionStats/DayCarousel';
import { useDateStrip } from '../hooks/useDateStrip';
import { food } from '@/shared/api/food';
import { startOfDay, toApiDate } from '@/shared/lib/date';
import { getFlameColor } from '../lib/getFlameColor';
import { useActiveDates } from '../hooks/useActiveDates.ts';
import { FoodLogModal } from '../components/FoodLog/FoodLogModal.tsx';
import type { FoodLog } from '@/shared/types/api/food';
import { StreakPopup } from '@/features/streak/components/StreakPopup';

export const HomePage = () => {
  const { user_data } = useUser();
  const createdAt = user_data?.user.created_at;
  const currentStreak = user_data?.user.current_streak ?? 0;
  const streakActiveToday = user_data?.user.streak_active_today ?? false;
  const flameColorProps = getFlameColor(currentStreak, streakActiveToday);

  const theme = useTheme();
  const queryClient = useQueryClient();

  const {
    dates,
    selectedDate,
    selectedDateStr,
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

  const [streakPopupOpen, setStreakPopupOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [foodLogModalOpen, setFoodLogModalOpen] = useState(false);
  const [currentFoodLog, setCurrentFoodLog] = useState<FoodLog | undefined>();
  const [foodLogDeleting, setFoodLogDeleting] = useState(false);
  const [foodLogRepeating, setFoodLogRepeating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const onClick = useCallback((log: FoodLog) => {
    setCurrentFoodLog(log);
    setFoodLogModalOpen(true);
  }, []);

  const { mutate: deleteLog } = useMutation({
    mutationFn: (logId: number) => food.remove(logId),
    onMutate: (logId: number) => {
      setDeletingId(logId);
      setFoodLogDeleting(true);
    },
    onSettled: () => {
      setDeletingId(null);
      setFoodLogDeleting(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food', selectedDateStr] });
      queryClient.invalidateQueries({
        queryKey: ['stats', 'daily', selectedDateStr],
      });
      queryClient.invalidateQueries({ queryKey: ['stats', 'active-dates'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setFoodLogModalOpen(false);
    },
  });

  const { mutate: repeatLog } = useMutation({
    mutationFn: (log: FoodLog) => food.repeat(log),
    onMutate: () => setFoodLogRepeating(true),
    onSettled: () => setFoodLogRepeating(false),
    onSuccess: () => {
      const todayStr = toApiDate(new Date());
      queryClient.invalidateQueries({ queryKey: ['food', todayStr] });
      queryClient.invalidateQueries({ queryKey: ['stats', 'daily', todayStr] });
      queryClient.invalidateQueries({ queryKey: ['stats', 'active-dates'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setFoodLogModalOpen(false);
    },
  });

  return (
    <div className="flex h-full flex-col gap-2">
      <header
        className="sticky top-0 z-10 flex flex-col gap-2 px-4 pt-1"
        style={{ backgroundColor: theme.bg_color }}
      >
        <section className="flex h-6 justify-between px-1">
          <div className="flex items-center gap-1">
            <span
              className="text-2xl leading-none font-semibold tracking-wide"
              style={{ color: theme.text_color }}
            >
              Calora AI
            </span>
            <Sprout className="text-[#90EE90]" size={20} />
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex cursor-pointer items-center gap-1 rounded-2xl pr-2.25 pl-1.5 transition-opacity active:opacity-70"
              style={{
                backgroundColor: theme.section_bg_color,
                color: theme.text_color,
              }}
              onClick={() => setStreakPopupOpen(true)}
            >
              <Flame {...flameColorProps} size={18} />
              <span className="text-lg">{currentStreak}</span>
            </div>

            <button
              onClick={() => setCalendarOpen(true)}
              className="flex items-center rounded-xl transition-opacity active:opacity-60"
              style={{ color: theme.hint_color }}
            >
              <CalendarDays size={24} />
            </button>
          </div>
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
          onFoodLogClick={onClick}
          deletingId={deletingId}
        />
      </div>

      {streakPopupOpen && (
        <StreakPopup
          currentStreak={currentStreak}
          onClose={() => setStreakPopupOpen(false)}
        />
      )}

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

      {foodLogModalOpen && currentFoodLog && (
        <FoodLogModal
          log={currentFoodLog}
          isDeleting={foodLogDeleting}
          isRepeating={foodLogRepeating}
          onClose={() =>
            !foodLogDeleting && !foodLogRepeating && setFoodLogModalOpen(false)
          }
          onDelete={deleteLog}
          onRepeat={repeatLog}
        />
      )}
    </div>
  );
};
