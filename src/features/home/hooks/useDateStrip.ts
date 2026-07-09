import { useState, useMemo, useCallback } from 'react';
import { toApiDate, startOfDay } from '@/shared/lib/date';

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

  /**
   * null   → нет ожидающего скролла
   * Date   → DateStrip выполнит emblaApi.scrollTo() с плавной анимацией
   *
   * Выставляется ВСЕГДА при выборе даты — и через карусель, и через CalendarPicker.
   * Embla достаточно умна: если цель == текущая позиция, анимация не запускается.
   */
  const [pendingScrollDate, setPendingScrollDate] = useState<Date | null>(null);

  const dates = useMemo(() => buildDates(selectedDate), [selectedDate]);

  /**
   * Единственная точка изменения выбранной даты.
   *
   * Работает для обоих источников выбора:
   *   • Тап по элементу карусели  → плавный центрирующий скролл к дате
   *   • Выбор через CalendarPicker → плавный скролл (возможно, со сменой месяца)
   *
   * Почему setPendingScrollDate всегда:
   *   При тапе по видимому элементу скролл центрирует его — это UX-улучшение,
   *   пользователь видит, что выбранная дата "встала" в центр.
   *   Embla не производит лишней анимации, если цель уже в центре.
   */
  const selectDate = useCallback((date: Date) => {
    const d = startOfDay(date);
    setSelectedDate(d);
    setPendingScrollDate(d);
  }, []);

  /** Вызывается DateStrip после scrollTo — сбрасывает флаг. */
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
    /**
     * Алиас для обратной совместимости — CalendarPicker в HomePage
     * вызывает selectDateExternal. Поведение идентично selectDate.
     */
    selectDateExternal: selectDate,
    pendingScrollDate,
    clearPendingScroll,
  };
}
