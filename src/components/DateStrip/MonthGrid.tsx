import { useTheme } from '../../context/ThemeContext';
import { useActiveDates } from '../../hooks/useActiveDates';
import { isSameDay, startOfDay, toApiDate } from '../../utils/date';
import { buildCalendarCells } from '../../utils/calendarMonths';
import { MARKER_FOOD_COLOR, MARKER_WATER_COLOR } from '../../constants/markers';
import { withOpacity } from '../../utils/colors';

interface MonthGridProps {
  year: number;
  month: number; // 0-based
  selectedDate: Date;
  today: Date;
  minDate: Date;
  maxDate: Date;
  onSelect: (date: Date) => void;
}

/**
 * Сетка дней одного месяца + собственный useActiveDates под этот месяц.
 * Рендерится только для активного слайда и его ближайших соседей
 * (см. RENDER_RADIUS в Calendar.tsx) — иначе пришлось бы держать
 * по сетевому запросу на каждый месяц в окне карусели одновременно.
 */
export const MonthGrid = ({
  year,
  month,
  selectedDate,
  today,
  minDate,
  maxDate,
  onSelect,
}: MonthGridProps) => {
  const theme = useTheme();

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const activeDates = useActiveDates(monthStart, monthEnd);

  const cells = buildCalendarCells(year, month);
  const minNorm = startOfDay(minDate);
  const maxNorm = startOfDay(maxDate);

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {cells.map((date, i) => {
        if (!date) return <div key={`empty-${i}`} className="aspect-square" />;

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
            onClick={() => !isDisabled && onSelect(d)}
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
              style={{ background: bar_bg }}
            />
          </button>
        );
      })}
    </div>
  );
};
