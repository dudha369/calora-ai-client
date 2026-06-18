import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useTheme } from '../../context/ThemeContext';
import { isSameDay, startOfDay, toApiDate } from '../../utils/date';
import { useActiveDates } from '../../hooks/useActiveDates';
import { useBackButton } from '../../hooks/useBackButton.ts';
import { useSecondaryButton } from '../../hooks/useSecondaryButton.ts';
import { useModalAnimation } from '../../hooks/useModalAnimation.ts';

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

interface CalendarProps {
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
}: CalendarProps) => {
  const theme = useTheme();
  const today = startOfDay(new Date());

  // Отображаемый месяц — начинаем с месяца выбранной даты
  const [displayYear, setDisplayYear] = useState(value.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(value.getMonth());

  const monthStart = useMemo(
    () => new Date(displayYear, displayMonth, 1),
    [displayYear, displayMonth],
  );
  const monthEnd = useMemo(
    () => new Date(displayYear, displayMonth + 1, 0),
    [displayYear, displayMonth],
  );
  const activeDates = useActiveDates(monthStart, monthEnd);

  const { isVisible, isButtonsVisible, handleClose } =
    useModalAnimation(onClose);

  const handleSelect = (d: Date) => {
    onSelect(d);
    handleClose();
  };

  const cells = useMemo(
    () => buildCalendarCells(displayYear, displayMonth),
    [displayYear, displayMonth],
  );

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

  useBackButton(handleClose, true);
  useSecondaryButton({
    text: 'Закрыть',
    iconCustomEmojiId: '',
    isEnabled: true,
    isVisible: isButtonsVisible,
    onClick: handleClose,
  });

  return (
    // Фиксированный оверлей поверх всего приложения
    <div
      className={`fixed inset-0 z-20 flex items-end justify-center backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      {/* Панель календаря */}
      <div
        className={`relative z-10 w-full rounded-t-3xl px-4 py-5 transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ backgroundColor: theme.bg_color }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок — навигация по месяцам */}
        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={prevMonth}
            disabled={!canGoPrev}
            className="rounded-xl p-2 transition-opacity"
            style={{
              backgroundColor: theme.section_bg_color,
              color: canGoPrev ? theme.button_text_color : theme.hint_color,
              cursor: canGoPrev ? 'pointer' : 'not-allowed',
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
              color: canGoNext ? theme.button_text_color : theme.hint_color,
              cursor: canGoNext ? 'pointer' : 'not-allowed',
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
        <div className="grid grid-cols-7 gap-x-2 gap-y-2">
          {cells.map((date, i) => {
            if (!date) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }

            const d = startOfDay(date);
            const isDisabled = d < minNorm || d > maxNorm;
            const isSelected = isSameDay(d, value);
            const isItToday = isSameDay(d, today);

            let bg = 'transparent';
            let border = '2px solid transparent';
            let txtColor = theme.text_color;

            if (isSelected) {
              bg = theme.button_color;
              txtColor = theme.button_text_color;
            } else if (isItToday) {
              border = `2px dashed ${theme.text_color}`;
            } else if (isDisabled) {
              txtColor = `${theme.hint_color}40`;
            }

            const hasEntries = activeDates.has(toApiDate(d));

            return (
              <button
                key={d.toISOString()}
                onClick={() => !isDisabled && handleSelect(d)}
                disabled={isDisabled}
                className="relative flex aspect-square items-center justify-center rounded-2xl text-base font-medium transition-colors"
                style={{
                  backgroundColor: bg,
                  color: txtColor,
                  border,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                }}
              >
                {date.getDate()}
                {hasEntries && (
                  <span
                    className="absolute bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full"
                    style={{
                      backgroundColor: isSelected
                        ? theme.button_text_color
                        : theme.accent_text_color,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
