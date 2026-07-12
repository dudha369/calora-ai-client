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
import { useActiveDates } from '../hooks/useActiveDates';
import { FoodLogModal } from '../components/FoodLog/FoodLogModal';
import type { CopyMealResult } from '../components/FoodLog/CopyMealSheet';
import type { FoodLog } from '@/shared/types/api/food';
import { StreakPopup } from '../../streak/components/StreakPopup';

export const HomePage = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const { user_data } = useUser();
  const createdAt = user_data?.user.created_at;
  const currentStreak = user_data?.user.current_streak ?? 0;
  const streakActiveToday = user_data?.user.streak_active_today ?? false;
  const flameColorProps = getFlameColor(currentStreak, streakActiveToday, theme.hint_color);

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
  const [foodLogEditing, setFoodLogEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const onClick = useCallback((log: FoodLog) => {
    setCurrentFoodLog(log);
    setFoodLogModalOpen(true);
  }, []);

  const invalidateAfterChange = (dateStr: string) => {
    queryClient.invalidateQueries({ queryKey: ['food', dateStr] });
    queryClient.invalidateQueries({ queryKey: ['stats', 'daily', dateStr] });
    queryClient.invalidateQueries({ queryKey: ['stats', 'active-dates'] });
    queryClient.invalidateQueries({ queryKey: ['user'] });
  };

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
      invalidateAfterChange(selectedDateStr);
      setFoodLogModalOpen(false);
    },
  });

  const { mutate: copyLog } = useMutation({
    mutationFn: (result: CopyMealResult) =>
      food.log({
        log_date: toApiDate(new Date()),
        items: result.items,
        ...(result.includePhoto && currentFoodLog
          ? { copy_photo_from_log_id: currentFoodLog.id }
          : {}),
      }),
    onMutate: () => setFoodLogRepeating(true),
    onSettled: () => setFoodLogRepeating(false),
    onSuccess: () => {
      const todayStr = toApiDate(new Date());
      invalidateAfterChange(todayStr);
      setFoodLogModalOpen(false);
    },
  });

  const { mutate: editLog } = useMutation({
    mutationFn: ({
      logId,
      items,
    }: {
      logId: number;
      items: {
        food_name: string;
        portion_g: number;
        calories: number;
        protein_g: number;
        fat_g: number;
        carbs_g: number;
        fiber_g: number;
        sugar_g: number;
        water_ml: number;
      }[];
    }) => food.update(logId, items),
    onMutate: () => setFoodLogEditing(true),
    onSettled: () => setFoodLogEditing(false),
    onSuccess: () => {
      invalidateAfterChange(selectedDateStr);
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
          isEditing={foodLogEditing}
          onClose={() =>
            !foodLogDeleting &&
            !foodLogRepeating &&
            !foodLogEditing &&
            setFoodLogModalOpen(false)
          }
          onDelete={deleteLog}
          onCopy={copyLog}
          onEdit={(logId, items) => editLog({ logId, items })}
        />
      )}
    </div>
  );
};
