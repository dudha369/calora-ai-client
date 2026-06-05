import { useMemo } from "react";
import { useQuery } from "react-query";

import { useUser }       from "../context/UserContext";
import { useTheme }      from "../context/ThemeContext";
import { DateStrip }     from "../components/DateStrip/DateStrip";
import { useDateStrip }  from "../hooks/useDateStrip";
import { stats }         from "../api/stats";
import { toApiDate }     from "../utils/date";

const Skeleton = ({ className }: { className?: string }) => {
  const theme = useTheme();
  return (
    <div
      className={`rounded-xl animate-pulse ${className ?? ""}`}
      style={{ backgroundColor: theme.secondary_bg_color }}
    />
  );
};

export const HomePage = () => {
  const { user_data } = useUser();
  const theme = useTheme();
  const firstName = user_data?.user.full_name ?? "аноним";

  const {
    dates,
    selectedDate,
    selectedDateStr,
    isToday,
    monthKey,
    today,
    selectDate,
  } = useDateStrip();

  const { isLoading: statsLoading } = useQuery({
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

  const dateLabel = isToday
    ? new Date().toLocaleDateString("ru-RU", {
      weekday: "long",
      day:     "numeric",
      month:   "long",
    })
    : selectedDate.toLocaleDateString("ru-RU", {
      weekday: "long",
      day:     "numeric",
      month:   "long",
    });

  return (
    <div className="flex flex-col gap-5 pt-5">
      <section className="px-4">
        <p className="text-sm capitalize" style={{ color: theme.hint_color }}>
          {dateLabel}
        </p>
        <h1 className="text-2xl font-bold mt-0.5" style={{ color: theme.text_color }}>
          Привет, {firstName} 👋
        </h1>
      </section>

      <section className="px-4">
        <DateStrip
          key={monthKey}
          dates={dates}
          selectedDate={selectedDate}
          today={today}
          datesWithData={datesWithData}
          onSelect={selectDate}
        />
      </section>

      <section className="px-4">
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
          // TODO: когда начнете выводить данные, используйте объект dailyStats (например: dailyStats?.calories)
          <div
            className="rounded-2xl p-4 text-center text-sm"
            style={{
              backgroundColor: theme.section_bg_color,
              color:           theme.hint_color,
            }}
          >
            {isToday
              ? "Данные за сегодня появятся здесь"
              : `${selectedDate.getDate()} ${selectedDate.toLocaleDateString("ru-RU", { month: "long" })}`}
          </div>
        )}
      </section>
    </div>
  );
};
