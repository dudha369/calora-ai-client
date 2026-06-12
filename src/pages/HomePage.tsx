import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { Sprout, Flame, CalendarDays } from 'lucide-react';

import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { DateStrip } from '../components/DateStrip/DateStrip';
import { CalendarPicker } from '../components/DateStrip/CalendarPicker';
import { Skeleton } from '../components/Skeleton';
import { CaloriesArc } from '../components/NutritionStats/CaloriesArc';
import { NutritionCard } from '../components/NutritionStats/NutritionCard';
import { AddLogBanner } from '../components/NutritionStats/AddLogBanner';
import { useDateStrip } from '../hooks/useDateStrip';
import { stats } from '../api/stats';
import { startOfDay } from '../utils/date';
import { getFlameColor } from '../utils/getFlameColor';

export const HomePage = () => {
  const { user_data } = useUser();
  const currentStreak = user_data?.user.current_streak ?? 0;
  const flameColorProps = getFlameColor(currentStreak);
  const createdAt = user_data?.user.created_at;

  const theme = useTheme();

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

  const { data, isLoading: statsLoading } = useQuery({
    queryKey: ['stats', 'daily', selectedDateStr],
    queryFn: async () => (await stats.getDaily(selectedDateStr)).data,
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });

  const minDate = useMemo(
    () => (createdAt ? startOfDay(new Date(createdAt)) : today),
    [createdAt, today],
  );

  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 px-4 pt-1">
      <header className="flex flex-col gap-2">
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

        <section>
          <DateStrip
            key={monthKey}
            dates={dates}
            selectedDate={selectedDate}
            today={today}
            minDate={minDate}
            onSelect={selectDate}
            pendingScrollDate={pendingScrollDate}
            onScrollConsumed={clearPendingScroll}
          />
        </section>
      </header>

      <div className="flex flex-col gap-4">
        <div
          className="flex h-70 w-full flex-col rounded-3xl"
          style={{
            backgroundColor: theme.section_bg_color,
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
        </div>

        <div className="flex flex-col gap-1">
          <span
            className="text-lg font-[750] tracking-wide"
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
              <div>{data?.has_data ? <div></div> : <AddLogBanner />}</div>
            )}
          </div>
        </div>
      </div>

      {calendarOpen && (
        <CalendarPicker
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
