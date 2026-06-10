import { useMemo, useState }           from "react";
import { useQuery }                    from "react-query";
import { Sprout, Flame, CalendarDays } from "lucide-react";

import { useUser }               from "../context/UserContext";
import { useTheme }              from "../context/ThemeContext";
import { DateStrip }             from "../components/DateStrip/DateStrip";
import { CalendarPicker }        from "../components/DateStrip/CalendarPicker";
import { Skeleton }              from "../components/Skeleton";
import { ProgressArc }           from "../components/ProgressArc";
import { useDateStrip }          from "../hooks/useDateStrip";
import { stats }                 from "../api/stats";
import { toApiDate, startOfDay } from "../utils/date";

export const HomePage = () => {
  const { user_data } = useUser();
  const theme = useTheme();

  const { dates, selectedDate, selectedDateStr, isToday, monthKey, today, selectDate } =
    useDateStrip();

  const { data, isLoading: statsLoading } = useQuery({
    queryKey:         ["stats", "daily", selectedDateStr],
    queryFn:          async () => (await stats.getDaily(selectedDateStr)).data,
    staleTime:        5 * 60 * 1000,
    keepPreviousData: true,
  });

  const rangeFrom = toApiDate(dates[0]);
  const rangeTo   = toApiDate(dates[dates.length - 1]);

  const { data: activeDatesData } = useQuery({
    queryKey:  ["stats", "active-dates", rangeFrom, rangeTo],
    queryFn:   async () => (await stats.getActiveDates(rangeFrom, rangeTo)).data,
    staleTime: 10 * 60 * 1000,
  });

  const datesWithData = useMemo(
    () => (activeDatesData ? new Set<string>(activeDatesData.dates) : undefined),
    [activeDatesData],
  );

  const createdAt = user_data?.user.created_at;
  const minDate   = useMemo(
    () => (createdAt ? startOfDay(new Date(createdAt)) : today),
    [createdAt, today],
  );

  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 px-4 pt-1">
      <header className="flex flex-col gap-2">
        <section className="flex px-1 justify-between text-xl">
          <div className="flex gap-1 items-center">
            <span
              className="leading-none font-semibold tracking-wide"
              style={{ color: theme.text_color }}
            >
              Calora AI
            </span>
            <Sprout className="text-[#90EE90]" size={20} />
          </div>

          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1 pl-1.5 pr-2.25 rounded-2xl"
              style={{ backgroundColor: theme.section_bg_color, color: theme.text_color }}
            >
              <Flame stroke="red" fill="orange" size={18} />
              <span className="text-lg">{user_data?.user.current_streak ?? 0}</span>
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
            datesWithData={datesWithData}
            onSelect={selectDate}
          />
        </section>
      </header>

      <div>
        {statsLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-32" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div
              className="flex flex-col w-full rounded-3xl"
              style={{
                backgroundColor: theme.section_bg_color,
              }}
            >
              <div className="h-50">
                <ProgressArc
                  value={data?.calories ?? 0}
                  max={data?.calories_goal ?? 3000}
                  radius={50}
                  strokeWidth={7}
                />
              </div>
              <>
                PFC
              </>
            </div>

            <div>
              {data?.has_data ? (
                <div>

                </div>
              ) : (
                isToday
                ? "Данные за сегодня появятся здесь"
                : `${selectedDate.getDate()} ${selectedDate.toLocaleDateString("ru-RU", { month: "long" })}`
              )}
            </div>
          </div>
        )}
      </div>

      {calendarOpen && (
        <CalendarPicker
          value={selectedDate}
          minDate={minDate}
          maxDate={today}
          onSelect={(date) => { selectDate(date); setCalendarOpen(false); }}
          onClose={() => setCalendarOpen(false)}
        />
      )}
    </div>
  );
};
