import { useTheme } from "../../context/ThemeContext";

const DAY_NAMES = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"] as const;

interface Props {
  date: Date;
  isSelected: boolean;
  isToday: boolean;
  isFuture: boolean;
  /** undefined — данных с сервера ещё нет; false — ничего не залогировано */
  hasData: boolean | undefined;
  onClick: () => void;
}

export const DateStripItem = ({
                                date,
                                isSelected,
                                isToday,
                                isFuture,
                                hasData,
                                onClick,
                              }: Props) => {
  const theme = useTheme();

  let bg        = theme.section_bg_color;
  let numColor  = theme.text_color;
  let nameColor = theme.hint_color;
  let dotColor  = "transparent";

  if (isSelected) {
    bg        = theme.button_color;
    numColor  = theme.button_text_color;
    nameColor = `${theme.button_text_color}99`;
    dotColor  = isToday ? `${theme.button_text_color}CC` : "transparent";
  } else if (isFuture) {
    bg        = theme.secondary_bg_color;
    numColor  = `${theme.hint_color}55`;
    nameColor = `${theme.hint_color}55`;
  } else if (hasData === false) {
    // Прошедший день без записей
    numColor  = theme.hint_color;
    nameColor = theme.hint_color;
    dotColor  = isToday ? theme.button_color : "transparent";
  } else {
    // Прошедший день с записями или статус неизвестен
    dotColor = isToday ? theme.button_color : "transparent";
  }

  return (
    <button
      onClick={onClick}
      disabled={isFuture}
      // flex-[0_0_14.285%] = ровно 1/7 ширины контейнера → 7 ячеек всегда
      className="flex-[0_0_14.285%] flex flex-col items-center gap-0.5 py-3 rounded-2xl transition-colors duration-150"
      style={{
        backgroundColor: bg,
        cursor: isFuture ? "default" : "pointer",
      }}
    >
      <span
        className="text-[11px] font-medium leading-tight"
        style={{ color: nameColor }}
      >
        {DAY_NAMES[date.getDay()]}
      </span>
      <span
        className="text-[18px] font-bold leading-tight tabular-nums"
        style={{ color: numColor }}
      >
        {date.getDate()}
      </span>
      <div
        className="w-1 h-1 rounded-full mt-0.5"
        style={{ backgroundColor: dotColor }}
      />
    </button>
  );
};
