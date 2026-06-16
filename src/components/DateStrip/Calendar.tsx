import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useTheme } from '../../context/ThemeContext';
import { isSameDay, startOfDay } from '../../utils/date';

// ── Константы ────────────────────────────────────────────────────────────────

const DAY_HEADERS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;

const MONTH_NAMES = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
] as const;

// ── Утилиты ──────────────────────────────────────────────────────────────────

/**
 * Возвращает массив ячеек для сетки календаря.
 * null = пустая ячейка (до первого числа месяца).
 * Неделя начинается с понедельника.
 */
function buildCalendarCells(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
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
  onClose: () => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export const Calendar = ({
  value,
  minDate,
  maxDate,
  onSelect,
  onClose,
}: Props) => {
  const theme = useTheme();
  const today = startOfDay(new Date());

  // Отображаемый месяц — начинаем с месяца выбранной даты
  const [displayYear, setDisplayYear] = useState(value.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(value.getMonth());

  const cells = buildCalendarCells(displayYear, displayMonth);
  const minNorm = startOfDay(minDate);
  const maxNorm = startOfDay(maxDate);

  // Можно ли листать месяцы
  const canGoPrev =
    displayYear > minNorm.getFullYear() ||
    (displayYear === minNorm.getFullYear() &&
      displayMonth > minNorm.getMonth());

  const canGoNext =
    displayYear < maxNorm.getFullYear() ||
    (displayYear === maxNorm.getFullYear() &&
      displayMonth < maxNorm.getMonth());

  const prevMonth = () => {
    if (!canGoPrev) return;
    if (displayMonth === 0) {
      setDisplayYear((y) => y - 1);
      setDisplayMonth(11);
    } else setDisplayMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (!canGoNext) return;
    if (displayMonth === 11) {
      setDisplayYear((y) => y + 1);
      setDisplayMonth(0);
    } else setDisplayMonth((m) => m + 1);
  };

  return (
    // Фиксированный оверлей поверх всего приложения
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Полупрозрачный фон — закрывает пикер по клику */}
      <div
        className="absolute inset-0 bg-black/40"
        style={{ backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Панель календаря */}
      <div
        className="relative z-10 mx-0 w-full rounded-t-3xl px-4 pt-5 pb-6 sm:mx-4 sm:max-w-sm sm:rounded-3xl"
        style={{ backgroundColor: theme.bg_color }}
      >
        {/* Заголовок — навигация по месяцам */}
        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={prevMonth}
            disabled={!canGoPrev}
            className="rounded-xl p-2 transition-opacity"
            style={{
              backgroundColor: theme.section_bg_color,
              color: canGoPrev ? theme.button_color : `${theme.hint_color}55`,
            }}
          >
            <ChevronLeft size={18} />
          </button>

          <span
            className="text-base font-semibold"
            style={{ color: theme.text_color }}
          >
            {MONTH_NAMES[displayMonth]} {displayYear}
          </span>

          <button
            onClick={nextMonth}
            disabled={!canGoNext}
            className="rounded-xl p-2 transition-opacity"
            style={{
              backgroundColor: theme.section_bg_color,
              color: canGoNext ? theme.button_color : `${theme.hint_color}55`,
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Заголовки дней недели */}
        <div className="mb-1 grid grid-cols-7">
          {DAY_HEADERS.map((h) => (
            <div
              key={h}
              className="py-1 text-center text-xs font-medium"
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

            const d = startOfDay(date);
            const isDisabled = d < minNorm || d > maxNorm;
            const isSelected = isSameDay(d, value);
            const isItToday = isSameDay(d, today);

            let bg = 'transparent';
            let txtColor = theme.text_color;

            if (isSelected) {
              bg = theme.button_color;
              txtColor = theme.button_text_color;
            } else if (isItToday) {
              bg = `${theme.button_color}22`;
              txtColor = theme.button_color;
            } else if (isDisabled) {
              txtColor = `${theme.hint_color}44`;
            }

            return (
              <button
                key={d.toISOString()}
                onClick={() => !isDisabled && onSelect(d)}
                disabled={isDisabled}
                className="flex aspect-square items-center justify-center rounded-xl text-sm font-medium transition-colors"
                style={{
                  backgroundColor: bg,
                  color: txtColor,
                  cursor: isDisabled ? 'default' : 'pointer',
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
          className="mt-5 w-full rounded-2xl py-3 text-sm font-semibold transition-opacity active:opacity-60"
          style={{
            backgroundColor: theme.section_bg_color,
            color: theme.hint_color,
          }}
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};
