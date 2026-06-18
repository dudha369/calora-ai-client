import type { CSSProperties } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { withOpacity } from '../../utils/colors';
import { MARKER_FOOD_COLOR, MARKER_WATER_COLOR } from '../../constants/markers';

const DAY_NAMES = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'] as const;

const ITEM_HEIGHT = 60; // px

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

  const hasMarker = hasFood || hasWater;

  // Цвет/градиент точки не зависит от состояния выбора — зелёный должен
  // всегда читаться как "еда", синий как "вода". На выбранной (синей)
  // плашке добавляем тонкое кольцо цветом текста плашки, иначе синяя
  // "вода" сливалась бы с синим фоном выбора.
  const dotStyle: CSSProperties = {
    bottom: 6,
    ...(hasFood && hasWater
      ? {
          background: `linear-gradient(90deg, ${MARKER_FOOD_COLOR} 50%, ${MARKER_WATER_COLOR} 50%)`,
        }
      : { backgroundColor: hasFood ? MARKER_FOOD_COLOR : MARKER_WATER_COLOR }),
    ...(isSelected
      ? { boxShadow: `0 0 0 1px ${theme.button_text_color}` }
      : {}),
  };

  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      aria-disabled={isDisabled}
      tabIndex={isDisabled ? -1 : 0}
      className={`relative flex shrink-0 flex-col items-center justify-center gap-1 rounded-[18px] transition-[background-color,border-color,color] duration-150 ${isDisabled ? '' : 'active:scale-[0.97]'}`}
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

      {/* Абсолютный оверлей, НЕ часть flex-потока: weekday+число всегда
          центрируются как пара, независимо от наличия точки, а когда
          точки нет — не рендерится вообще ничего, без "мёртвой" зоны. */}
      {hasMarker && (
        <span
          className="absolute left-1/2 size-1.5 -translate-x-1/2 rounded-full"
          style={dotStyle}
        />
      )}
    </button>
  );
};
