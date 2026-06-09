import { useTheme } from "../../context/ThemeContext";

const DAY_NAMES = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"] as const;

interface Props {
  date: Date;
  isSelected: boolean;
  isToday: boolean;
  isFuture: boolean;
  isBeforeMin: boolean;
  hasData: boolean | undefined;
  onClick: () => void;
}

export const DateStripItem = ({
                                date, isSelected, isToday, isFuture, isBeforeMin, hasData, onClick,
                              }: Props) => {
  const theme = useTheme();
  const isDisabled = isFuture || isBeforeMin;

  let bg        = theme.section_bg_color;
  let numColor  = theme.text_color;
  let nameColor = theme.hint_color;
  let dotColor  = "transparent";

  if (isSelected) {
    bg        = theme.button_color;
    numColor  = theme.button_text_color;
    nameColor = `${theme.button_text_color}99`;
    dotColor  = isToday ? `${theme.button_text_color}CC` : "transparent";
  } else if (isDisabled) {
    bg        = theme.secondary_bg_color;
    numColor  = `${theme.hint_color}55`;
    nameColor = `${theme.hint_color}55`;
  } else if (hasData === false) {
    numColor  = theme.hint_color;
    nameColor = theme.hint_color;
    dotColor  = isToday ? theme.button_color : "transparent";
  } else {
    dotColor  = isToday ? theme.button_color : "transparent";
  }

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className="flex-shrink-0 flex flex-col items-center gap-1 py-4 rounded-2xl
                 transition-colors duration-150 active:opacity-80"
      style={{
        flex:            "0 0 calc((100% - 6px) / 7)",
        backgroundColor: bg,
        cursor:          isDisabled ? "default" : "pointer",
      }}
    >
      <span className="text-xs font-medium leading-none" style={{ color: nameColor }}>
        {DAY_NAMES[date.getDay()]}
      </span>
      <span className="text-xl font-bold leading-none tabular-nums" style={{ color: numColor }}>
        {date.getDate()}
      </span>
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
    </button>
  );
};
