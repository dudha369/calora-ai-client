import { useTheme } from '../../context/ThemeContext';
import { withOpacity } from '../../utils/colors';

const DAY_NAMES = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'] as const;

const ITEM_HEIGHT = 64; // px — синхронизировано с placeholder-высотой в DateStrip.tsx

interface DateStripItemProps {
  date: Date;
  isSelected: boolean;
  isToday: boolean;
  isFuture: boolean;
  isBeforeMin: boolean;
  hasEntries: boolean;
  onClick: () => void;
  itemWidth: number;
}

export const DateStripItem = ({
  date,
  isSelected,
  isToday,
  isFuture,
  isBeforeMin,
  hasEntries,
  onClick,
  itemWidth,
}: DateStripItemProps) => {
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

  // На синей выбранной плашке берём цвет текста плашки (контраст с bg),
  // во всех остальных состояниях — акцентный цвет темы.
  const dotColor = isSelected
    ? theme.button_text_color
    : theme.accent_text_color;

  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      aria-disabled={isDisabled}
      tabIndex={isDisabled ? -1 : 0}
      className={`flex shrink-0 flex-col items-center justify-center gap-1 rounded-[18px] transition-[background-color,border-color,color] duration-150 ${isDisabled ? '' : 'active:scale-[0.97]'}`}
      style={{
        width: itemWidth,
        height: ITEM_HEIGHT,
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
        className="text-[27px] leading-none font-semibold tracking-[-0.03em]"
        style={{ color: numColor }}
      >
        {day}
      </span>
      {/* Слот точки всегда занимает место в layout — иначе высота элементов
          с записями и без них отличалась бы, и ряд выглядел бы неровным. */}
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: hasEntries ? dotColor : 'transparent' }}
      />
    </button>
  );
};
