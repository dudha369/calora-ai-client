import { useTheme } from "../../context/ThemeContext";
import { withOpacity } from "../../utils/colors";

const DAY_NAMES = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"] as const;

interface Props {
  date: Date;
  isSelected: boolean;
  isToday: boolean;
  isFuture: boolean;
  isBeforeMin: boolean;
  hasData: boolean | undefined;
  onClick: () => void;
  visibleCount: number;
}

export const DateStripItem = ({
                                date,
                                isSelected,
                                isToday,
                                isFuture,
                                isBeforeMin,
                                hasData,
                                onClick,
                                visibleCount,
                              }: Props) => {
  const theme = useTheme();
  const isDisabled = isFuture || isBeforeMin;

  const selectedBg = withOpacity(theme.button_color, 0.14);
  const selectedBorder = withOpacity(theme.button_color, 0.95);
  const dataLine = withOpacity(theme.button_color, 0.95);
  const todayDot = withOpacity(theme.button_color, 0.95);

  const weekday = DAY_NAMES[date.getDay()];
  const day = date.getDate();

  const showDataLine = Boolean(hasData) && !isSelected;
  const showTodayDot = isToday && !isSelected;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className="flex shrink-0 flex-col items-center justify-center gap-1 rounded-[18px] transition-all duration-150 active:scale-[0.98] active:opacity-80"
      style={{
        flex: `0 0 calc((100% - ${(visibleCount - 1) * 4}px) / ${visibleCount})`,
        minWidth: 52,
        maxWidth: 64,
        height: 72,
        cursor: isDisabled ? "default" : "pointer",
        backgroundColor: isSelected ? selectedBg : "transparent",
        border: isSelected ? `2px solid ${selectedBorder}` : "2px solid transparent",
        opacity: isDisabled ? 0.35 : 1,
      }}
    >
      <span
        className="text-[13px] leading-none font-medium"
        style={{
          color: isSelected ? theme.text_color : theme.hint_color,
        }}
      >
        {weekday}
      </span>

      <span
        className="text-[27px] leading-none font-semibold tracking-[-0.03em]"
        style={{
          color: theme.text_color,
        }}
      >
        {day}
      </span>

      <div className="h-1.5 flex items-start justify-center">
        {showDataLine ? (
          <div
            className="h-0.75 w-5.5 rounded-full"
            style={{ backgroundColor: dataLine }}
          />
        ) : showTodayDot ? (
          <div
            className="h-2.25 w-2.25 rounded-full"
            style={{ backgroundColor: todayDot }}
          />
        ) : null}
      </div>
    </button>
  );
};
