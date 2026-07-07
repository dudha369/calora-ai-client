import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { getIntlLocale, capitalizeFirst } from '../../utils/locale';
import { withOpacity } from '../../utils/colors';
import { MARKER_FOOD_COLOR, MARKER_WATER_COLOR } from '../../constants/markers';
import { useMemo } from 'react';

interface Props {
  date: Date;
  isSelected: boolean;
  isToday: boolean;
  isFuture: boolean;
  isBeforeMin: boolean;
  hasFood: boolean;
  hasWater: boolean;
  onClick: () => void;
  itemWidth: number;
}

export const DateStripItem = ({
  date,
  isSelected,
  isToday,
  isFuture,
  isBeforeMin,
  hasFood,
  hasWater,
  onClick,
  itemWidth,
}: Props) => {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const locale = getIntlLocale(i18n.language);
  const isDisabled = isFuture || isBeforeMin;

  const dayName = useMemo(
    () =>
      capitalizeFirst(
        new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date),
      ),
    [date, locale],
  );

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
      onClick={isDisabled ? undefined : onClick}
      aria-disabled={isDisabled}
      tabIndex={isDisabled ? -1 : 0}
      className={`flex h-16 shrink-0 flex-col items-center justify-center gap-1 rounded-[18px] transition-[background-color,border-color,color] duration-150 ${isDisabled ? '' : 'active:scale-[0.97]'}`}
      style={{
        width: itemWidth,
        backgroundColor: bg,
        border,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
      }}
    >
      <span
        className="text-sm leading-none font-medium"
        style={{ color: nameColor }}
      >
        {dayName}
      </span>
      <span
        className="text-[27px] leading-none font-semibold tracking-[-0.03em]"
        style={{ color: numColor }}
      >
        {date.getDate()}
      </span>

      <span
        className="h-1 w-1/2 rounded-full"
        style={{
          background: bar_bg,
        }}
      />
    </button>
  );
};
