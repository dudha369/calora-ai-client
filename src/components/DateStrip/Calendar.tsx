import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getIntlLocale, capitalizeFirst } from '../../utils/locale';

import { useTheme } from '../../context/ThemeContext';
import { isSameDay, startOfDay, toApiDate } from '../../utils/date';
import { useActiveDates } from '../../hooks/useActiveDates';

import { MARKER_FOOD_COLOR, MARKER_WATER_COLOR } from '../../constants/markers';
import { withOpacity } from '../../utils/colors.ts';
import { BottomSheet } from '../BottomSheet.tsx';

function buildCalendarCells(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const startDow = (firstDay.getDay() + 6) % 7;

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return cells;
}

interface CalendarProps {
  selectedDate: Date;
  minDate: Date;
  maxDate: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

export const Calendar = ({
  selectedDate,
  minDate,
  maxDate,
  onSelect,
  onClose,
}: CalendarProps) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation('common');
  const locale = getIntlLocale(i18n.language);
  const today = startOfDay(new Date());

  // Отображаемый месяц — начинаем с месяца выбранной даты
  const [displayYear, setDisplayYear] = useState(selectedDate.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(selectedDate.getMonth());

  // Intl-based month header — capitalised for RU/UA where Intl returns lowercase
  const monthLabel = useMemo(
    () =>
      capitalizeFirst(
        new Intl.DateTimeFormat(locale, {
          month: 'long',
          year: 'numeric',
        }).format(new Date(displayYear, displayMonth)),
      ),
    [locale, displayYear, displayMonth],
  );

  // Monday-first short weekday headers
  const dayHeaders = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        capitalizeFirst(
          new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
            new Date(2024, 0, 1 + i),
          ),
        ),
      ),
    [locale],
  );

  const monthStart = useMemo(
    () => new Date(displayYear, displayMonth, 1),
    [displayYear, displayMonth],
  );
  const monthEnd = useMemo(
    () => new Date(displayYear, displayMonth + 1, 0),
    [displayYear, displayMonth],
  );
  const activeDates = useActiveDates(monthStart, monthEnd);

  const handleSelect = (d: Date) => {
    onSelect(d);
    onClose();
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

  return (
    <BottomSheet
      onClose={onClose}
      title={monthLabel}
      actionLabel={t('buttons.open_today')}
      onAction={() => handleSelect(today)}
      actionDisabled={selectedDate.getTime() === today.getTime()}
      titleClassName="justify-between mb-2 px-6"
      renderTitle={(defaultTitle) => (
        <>
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

          <div>{defaultTitle}</div>

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
        </>
      )}
    >
      <div className="mb-1 grid grid-cols-7 gap-1.5">
        {dayHeaders.map((h) => (
          <div
            key={h}
            className="py-1 text-center text-xs font-medium"
            style={{ color: theme.hint_color }}
          >
            {h}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const d = startOfDay(date);
          const isDisabled = d < minNorm || d > maxNorm;
          const isSelected = isSameDay(d, selectedDate);
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

          const apiDate = toApiDate(d);
          const hasFood = activeDates.foodDates.has(apiDate);
          const hasWater = activeDates.waterDates.has(apiDate);

          let bar_bg: string;

          if (hasFood && hasWater) {
            bar_bg = `linear-gradient(90deg, ${MARKER_FOOD_COLOR} 50%, ${MARKER_WATER_COLOR} 50%)`;
          } else if (hasFood) {
            bar_bg = MARKER_FOOD_COLOR;
          } else if (hasWater) {
            bar_bg = MARKER_WATER_COLOR;
          } else if (isDisabled) {
            bar_bg = withOpacity(theme.text_color, 0.25);
          } else {
            bar_bg = theme.hint_color;
          }

          return (
            <button
              key={d.toISOString()}
              onClick={() => !isDisabled && handleSelect(d)}
              disabled={isDisabled}
              className="relative flex aspect-square flex-col items-center justify-center gap-0.5 rounded-2xl text-[22px] font-medium transition-colors"
              style={{
                backgroundColor: bg,
                color: txtColor,
                border,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
              }}
            >
              {date.getDate()}
              <span
                className="absolute bottom-0.5 h-1 w-1/2 rounded-full"
                style={{
                  background: bar_bg,
                }}
              />
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
};
