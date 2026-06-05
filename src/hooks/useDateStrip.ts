import { useState, useMemo, useCallback } from "react";
import { isSameDay, toApiDate, startOfDay } from "../utils/date";

const THRESHOLD_DAYS = 4; // если N дней назад — другой месяц, показываем его целиком

function buildDates(anchor: Date): Date[] {
  const year  = anchor.getFullYear();
  const month = anchor.getMonth();

  // Проверяем нужно ли добавлять предыдущий месяц
  const threshold = new Date(anchor);
  threshold.setDate(anchor.getDate() - THRESHOLD_DAYS);
  const showPrevMonth =
    threshold.getMonth() !== month || threshold.getFullYear() !== year;

  const result: Date[] = [];

  if (showPrevMonth) {
    const prevYear  = month === 0 ? year - 1 : year;
    const prevMonth = month === 0 ? 11        : month - 1;
    const daysInPrev = new Date(prevYear, prevMonth + 1, 0).getDate();
    for (let d = 1; d <= daysInPrev; d++) {
      result.push(new Date(prevYear, prevMonth, d));
    }
  }

  // Все дни месяца anchor-даты (включая будущие)
  const daysInCurrent = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInCurrent; d++) {
    result.push(new Date(year, month, d));
  }

  return result;
}

export function useDateStrip() {
  const today = useMemo(() => startOfDay(new Date()), []);

  const [selectedDate, setSelectedDate] = useState<Date>(today);

  // Даты перегенерируются когда меняется месяц selectedDate
  const dates = useMemo(() => buildDates(selectedDate), [selectedDate]);

  // -1 если сегодня не входит в отображаемый диапазон (выбран другой месяц)
  const todayIndex = useMemo(
    () => dates.findIndex((d) => isSameDay(d, today)),
    [dates, today],
  );

  const selectDate = useCallback((date: Date) => {
    setSelectedDate(startOfDay(date));
  }, []);

  // Ключ: при смене месяца DateStrip перемонтируется (Embla реинициализируется)
  const monthKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}`;

  return {
    dates,
    todayIndex,
    selectedDate,
    selectedDateStr: toApiDate(selectedDate),
    isToday: isSameDay(selectedDate, today),
    monthKey,
    today,
    selectDate,
  };
}
