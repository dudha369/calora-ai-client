import { useState, useMemo, useCallback } from "react";
import { isSameDay, toApiDate, startOfDay } from "../utils/date";

/** Все дни месяца anchor-даты (включая будущие — они будут disabled в UI) */
function buildDates(anchor: Date): Date[] {
  const year  = anchor.getFullYear();
  const month = anchor.getMonth();
  const days  = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
}

export function useDateStrip() {
  const today = useMemo(() => startOfDay(new Date()), []);

  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const dates = useMemo(() => buildDates(selectedDate), [selectedDate]);

  const selectDate = useCallback((date: Date) => {
    setSelectedDate(startOfDay(date));
  }, []);

  // При смене месяца DateStrip перемонтируется (key={monthKey} в родителе)
  const monthKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}`;

  return {
    dates,
    selectedDate,
    selectedDateStr: toApiDate(selectedDate),
    isToday:  isSameDay(selectedDate, today),
    monthKey,
    today,
    selectDate,
  };
}
