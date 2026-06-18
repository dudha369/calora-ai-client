import { useMemo, useState } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Sprout, Flame, CalendarDays } from 'lucide-react';

import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { DateStrip } from '../components/DateStrip/DateStrip';
import { Calendar } from '../components/DateStrip/Calendar';
import { FoodLogList } from '../components/FoodLog/FoodLogList';
import { Skeleton } from '../components/Skeleton';
import { CaloriesArc } from '../components/NutritionStats/CaloriesArc';
import { NutritionCard } from '../components/NutritionStats/NutritionCard';
import { AddLogBanner } from '../components/NutritionStats/AddLogBanner';
import { useDateStrip } from '../hooks/useDateStrip';
import { stats } from '../api/stats';
import { food } from '../api/food';
import type { DailyStats } from '../interfaces/api/stats';
import type { FoodByDateResponse } from '../interfaces/api/food';
import { startOfDay } from '../utils/date';
import { getFlameColor } from '../utils/getFlameColor';
import { useActiveDates } from '../hooks/useActiveDates.ts';

export const HomePage = () => {
  const { user_data } = useUser();
  const currentStreak = user_data?.user.current_streak ?? 0;
  const flameColorProps = getFlameColor(currentStreak);
  const createdAt = user_data?.user.created_at;

  const theme = useTheme();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    dates,
    selectedDate,
    selectedDateStr,
    monthKey,
    today,
    selectDate,
    selectDateExternal, // ← для CalendarPicker
    pendingScrollDate, // ← передаём в DateStrip
    clearPendingScroll, // ← передаём в DateStrip
  } = useDateStrip();
  const activeDates = useActiveDates(dates[0], dates[dates.length - 1]);

  const { data, isLoading: statsLoading } = useQuery<DailyStats>({
    queryKey: ['stats', 'daily', selectedDateStr],
    queryFn: async () => (await stats.getDaily(selectedDateStr)).data,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const minDate = useMemo(
    () => (createdAt ? startOfDay(new Date(createdAt)) : today),
    [createdAt, today],
  );

  const [calendarOpen, setCalendarOpen] = useState(false);

  const { data: foodData, isLoading: foodLoading } =
    useQuery<FoodByDateResponse>({
      queryKey: ['food', selectedDateStr],
      queryFn: async () => (await food.getByDate(selectedDateStr)).data,
      staleTime: 60 * 1000,
      placeholderData: keepPreviousData,
    });

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { mutate: deleteLog } = useMutation({
    mutationFn: (logId: number) => food.remove(logId),
    onMutate: (logId: number) => setDeletingId(logId),
    onSettled: () => setDeletingId(null),
    onSuccess: () => {
      // Инвалидируем список записей, дневную статистику и точки активности —
      // удаление могло убрать последнюю запись дня.
      queryClient.invalidateQueries({ queryKey: ['food', selectedDateStr] });
      queryClient.invalidateQueries({
        queryKey: ['stats', 'daily', selectedDateStr],
      });
      queryClient.invalidateQueries({ queryKey: ['stats', 'active-dates'] });
    },
  });

  return (
    <div className="flex flex-col gap-4 px-4">
      <header
        className="sticky top-0 z-10 flex flex-col gap-2 pt-1 pb-2"
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
              className="flex items-center gap-1 rounded-2xl pr-2.25 pl-1.5"
              style={{
                backgroundColor: theme.section_bg_color,
                color: theme.text_color,
              }}
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

        <section className="-mx-4">
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

      <main className="flex flex-col gap-3">
        <section
          className="flex h-70 w-full flex-col rounded-3xl"
          style={{
            backgroundColor: theme.section_bg_color,
          }}
          onClick={() => {
            navigate('/analytics');
          }}
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
            style={{
              color: theme.subtitle_text_color,
            }}
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
                    onDelete={deleteLog}
                  />
                ) : (
                  <AddLogBanner />
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {calendarOpen && (
        <Calendar
          value={selectedDate}
          minDate={minDate}
          maxDate={today}
          onSelect={(date) => {
            selectDateExternal(date);
            setCalendarOpen(false);
          }}
          onClose={() => setCalendarOpen(false)}
        />
      )}
    </div>
  );
};
