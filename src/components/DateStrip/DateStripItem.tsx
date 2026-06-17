import { useTheme } from '../../context/ThemeContext';
import { withOpacity } from '../../utils/colors';

const DAY_NAMES = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'] as const;

interface Props {
  date: Date;
  isSelected: boolean;
  isToday: boolean;
  isFuture: boolean;
  isBeforeMin: boolean;
  onClick: () => void;
  itemWidth: number;
}

export const DateStripItem = ({
  date,
  isSelected,
  isToday,
  isFuture,
  isBeforeMin,
  onClick,
  itemWidth,
}: Props) => {
  const theme = useTheme();
  const isDisabled = isFuture || isBeforeMin;

  const weekday = DAY_NAMES[date.getDay()];
  const day = date.getDate();

  let bg: string;
  let border: string;
  let numColor: string;
  let nameColor: string;

  if (isSelected) {
    bg = theme.button_color;
    border = `2px solid ${theme.button_color}`;
    numColor = theme.button_text_color;
    nameColor = withOpacity(theme.button_text_color, 0.7);
  } else if (isDisabled) {
    bg = withOpacity(theme.text_color, 0.04);
    border = '2px solid transparent';
    numColor = withOpacity(theme.text_color, 0.25);
    nameColor = withOpacity(theme.text_color, 0.25);
  } else if (isToday) {
    bg = 'transparent';
    border = `2px dashed ${theme.text_color}`;
    numColor = theme.text_color;
    nameColor = theme.hint_color;
  } else {
    bg = 'transparent';
    border = '2px solid transparent';
    numColor = theme.text_color;
    nameColor = theme.hint_color;
  }

  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      aria-disabled={isDisabled}
      tabIndex={isDisabled ? -1 : 0}
      className={`flex shrink-0 flex-col items-center justify-center gap-1 rounded-[18px] transition-[background-color,border-color,color] duration-150 ${isDisabled ? '' : 'active:scale-[0.97]'}`}
      style={{
        width: itemWidth,
        height: 60,
        backgroundColor: bg,
        border,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
      }}
    >
      <span
        className="text-sm leading-none font-medium"
        style={{ color: nameColor }}
      >
        {weekday}
      </span>
      <span
        className="text-3xl leading-none font-semibold tracking-tight"
        style={{ color: numColor }}
      >
        {day}
      </span>
    </button>
  );
};
