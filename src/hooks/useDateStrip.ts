import { useState, useMemo, useCallback } from 'react';
import { toApiDate, startOfDay } from '../utils/date';

/** Все дни месяца anchor-даты (включая будущие — они будут disabled в UI) */
function buildDates(anchor: Date): Date[] {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
}

export function useDateStrip() {
  const today = useMemo(() => startOfDay(new Date()), []);

  const [selectedDate, setSelectedDate] = useState<Date>(today);
  // null = скролл не нужен; задаётся только через selectDateExternal
  const [pendingScrollDate, setPendingScrollDate] = useState<Date | null>(null);

  const dates = useMemo(() => buildDates(selectedDate), [selectedDate]);

  /**
   * Тап по элементу карусели.
   * Пользователь итак видит элемент — автоскролл не нужен и создаёт дёрганье.
   */
  const selectDate = useCallback((date: Date) => {
    setSelectedDate(startOfDay(date));
  }, []);

  /**
   * Выбор через CalendarPicker или любой внешний источник.
   * Дата может быть за пределами видимой области → триггерим scrollTo в DateStrip.
   */
  const selectDateExternal = useCallback((date: Date) => {
    const d = startOfDay(date);
    setSelectedDate(d);
    setPendingScrollDate(d);
  }, []);

  /** Вызывается DateStrip после выполнения scrollTo */
  const clearPendingScroll = useCallback(() => {
    setPendingScrollDate(null);
  }, []);

  // При смене месяца DateStrip перемонтируется (key={monthKey} в родителе)
  const monthKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}`;

  return {
    dates,
    selectedDate,
    selectedDateStr: toApiDate(selectedDate),
    monthKey,
    today,
    selectDate,
    selectDateExternal,
    pendingScrollDate,
    clearPendingScroll,
  };
}
