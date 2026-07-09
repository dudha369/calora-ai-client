import { useTheme } from '@/shared/context/ThemeContext';
import type { FoodItem } from '@/shared/types/api/food';
import { useTranslation } from 'react-i18next';

interface FoodItemRowProps {
  item: FoodItem;
  counter: number;
  isLast: boolean;
}

export const FoodItemRow = ({ item, counter, isLast }: FoodItemRowProps) => {
  const theme = useTheme();
  const { t } = useTranslation('home_page');
  const { t: tc } = useTranslation('common');

  return (
    <div
      className="flex items-center justify-between py-2.5"
      style={{
        borderBottom: isLast
          ? 'none'
          : `1px solid ${theme.section_separator_color}`,
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className="inline-flex size-7.5 shrink-0 items-center justify-center rounded-full text-base font-medium"
          style={{
            border: `${theme.hint_color} 2px dashed`,
            color: theme.text_color,
          }}
        >
          {counter}
        </span>
        <div className="flex min-w-0 flex-col gap-px">
          <p
            className="truncate text-sm font-medium"
            title={item.food_name}
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
      </div>

      <span
        className="shrink-0 pl-3 text-lg font-semibold tabular-nums"
        style={{ color: theme.text_color }}
      >
        {item.calories} {tc('units.kcal')}
      </span>
    </div>
  );
};
