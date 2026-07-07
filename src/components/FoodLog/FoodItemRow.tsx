import { useTheme } from '../../context/ThemeContext';
import type { FoodItem } from '../../interfaces/api/food';
import { useTranslation } from 'react-i18next';

interface Props {
  item: FoodItem;
  isLast: boolean;
}

export const FoodItemRow = ({ item, isLast }: Props) => {
  const theme = useTheme();
  const { t } = useTranslation('home_page');
  const { t: tc } = useTranslation('common');

  return (
    <div
      className="flex items-center justify-between gap-3 py-2.5"
      style={{
        borderBottom: isLast
          ? 'none'
          : `1px solid ${theme.section_separator_color}`,
      }}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <p
          className="truncate text-sm font-medium"
          style={{ color: theme.text_color }}
        >
          {item.food_name}
        </p>
        <p className="text-xs" style={{ color: theme.hint_color }}>
          {item.portion_g} {tc('units.g')}
          <b> · </b>
          {t('macros', {
            p: Math.round(item.protein_g),
            f: Math.round(item.fat_g),
            c: Math.round(item.carbs_g),
          })}
        </p>
      </div>

      <span
        className="shrink-0 text-base font-bold tabular-nums"
        style={{ color: theme.text_color }}
      >
        {item.calories} {tc('units.kcal')}
      </span>
    </div>
  );
};
