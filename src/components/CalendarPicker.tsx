import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useTheme } from "../context/ThemeContext";
import { isSameDay, startOfDay } from "../utils/date";

// ── Константы ────────────────────────────────────────────────────────────────

const DAY_HEADERS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;

const MONTH_NAMES = [
  "Январь", "Февраль", "Март",    "Апрель",
  "Май",    "Июнь",    "Июль",    "Август",
  "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
] as const;

// ── Утилиты ──────────────────────────────────────────────────────────────────

/**
 * Возвращает массив ячеек для сетки календаря.
 * null = пустая ячейка (до первого числа месяца).
 * Неделя начинается с понедельника.
 */
function buildCalendarCells(year: number, month: number): (Date | null)[] {
  const firstDay    = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // (getDay(): Sun=0 … Sat=6) → Mon=0 … Sun=6
  const startDow = (firstDay.getDay() + 6) % 7;

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return cells;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  /** Текущая выбранная дата (подсвечивается в сетке) */
  value: Date;
  /**
   * Минимальная доступная дата — обычно дата создания аккаунта.
   * Дни раньше этой даты недоступны.
   */
  minDate: Date;
  /** Максимальная дата — обычно сегодня. Будущие дни недоступны. */
  maxDate: Date;
  onSelect: (date: Date) => void;
  onClose:  () => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export const CalendarPicker = ({
                                 value,
                                 minDate,
                                 maxDate,
                                 onSelect,
                                 onClose,
                               }: Props) => {
  const theme = useTheme();
  const today = startOfDay(new Date());

  // Отображаемый месяц — начинаем с месяца выбранной даты
  const [dispYear,  setDispYear]  = useState(value.getFullYear());
  const [dispMonth, setDispMonth] = useState(value.getMonth());

  const cells    = buildCalendarCells(dispYear, dispMonth);
  const minNorm  = startOfDay(minDate);
  const maxNorm  = startOfDay(maxDate);

  // Можно ли листать месяцы
  const canGoPrev =
    dispYear > minNorm.getFullYear() ||
    (dispYear === minNorm.getFullYear() && dispMonth > minNorm.getMonth());

  const canGoNext =
    dispYear < maxNorm.getFullYear() ||
    (dispYear === maxNorm.getFullYear() && dispMonth < maxNorm.getMonth());

  const prevMonth = () => {
    if (!canGoPrev) return;
    if (dispMonth === 0) { setDispYear((y) => y - 1); setDispMonth(11); }
    else setDispMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (!canGoNext) return;
    if (dispMonth === 11) { setDispYear((y) => y + 1); setDispMonth(0); }
    else setDispMonth((m) => m + 1);
  };

  return (
    // Фиксированный оверлей поверх всего приложения
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">

      {/* Полупрозрачный фон — закрывает пикер по клику */}
      <div
        className="absolute inset-0 bg-black/40"
        style={{ backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Панель календаря */}
      <div
        className="relative z-10 w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl
                   px-4 pt-5 pb-6 mx-0 sm:mx-4"
        style={{ backgroundColor: theme.bg_color }}
      >
        {/* Заголовок — навигация по месяцам */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={prevMonth}
            disabled={!canGoPrev}
            className="p-2 rounded-xl transition-opacity"
            style={{
              backgroundColor: theme.section_bg_color,
              color:           canGoPrev ? theme.button_color : `${theme.hint_color}55`,
            }}
          >
            <ChevronLeft size={18} />
          </button>

          <span className="font-semibold text-base" style={{ color: theme.text_color }}>
            {MONTH_NAMES[dispMonth]} {dispYear}
          </span>

          <button
            onClick={nextMonth}
            disabled={!canGoNext}
            className="p-2 rounded-xl transition-opacity"
            style={{
              backgroundColor: theme.section_bg_color,
              color:           canGoNext ? theme.button_color : `${theme.hint_color}55`,
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Заголовки дней недели */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_HEADERS.map((h) => (
            <div
              key={h}
              className="text-center text-xs font-medium py-1"
              style={{ color: theme.hint_color }}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Сетка дней */}
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((date, i) => {
            if (!date) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }

            const d          = startOfDay(date);
            const isDisabled = d < minNorm || d > maxNorm;
            const isSelected = isSameDay(d, value);
            const isItToday  = isSameDay(d, today);

            let bg       = "transparent";
            let txtColor = theme.text_color;

            if (isSelected) {
              bg       = theme.button_color;
              txtColor = theme.button_text_color;
            } else if (isItToday) {
              bg       = `${theme.button_color}22`;
              txtColor = theme.button_color;
            } else if (isDisabled) {
              txtColor = `${theme.hint_color}44`;
            }

            return (
              <button
                key={d.toISOString()}
                onClick={() => !isDisabled && onSelect(d)}
                disabled={isDisabled}
                className="aspect-square flex items-center justify-center
                           rounded-xl text-sm font-medium transition-colors"
                style={{
                  backgroundColor: bg,
                  color:           txtColor,
                  cursor:          isDisabled ? "default" : "pointer",
                }}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="mt-5 w-full py-3 rounded-2xl text-sm font-semibold
                     transition-opacity active:opacity-60"
          style={{
            backgroundColor: theme.section_bg_color,
            color:           theme.hint_color,
          }}
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};
