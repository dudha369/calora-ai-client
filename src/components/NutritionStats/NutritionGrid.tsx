import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { NutritionGridCard } from './NutritionGridCard.tsx';
import type { FoodLogBase } from '../../interfaces/api/food.ts';
import { cn } from '../../utils/cn';
import { useUser } from '../../context/UserContext.ts';

export type NutritionGridStats = Pick<
  FoodLogBase,
  | 'total_calories'
  | 'total_protein_g'
  | 'total_fat_g'
  | 'total_carbs_g'
  | 'total_sugar_g'
  | 'total_fiber_g'
  | 'total_water_ml'
>;

interface NutritionGridProps {
  data: NutritionGridStats;
}

export const NutritionGrid = ({ data }: NutritionGridProps) => {
  const theme = useTheme();
  const { user_data } = useUser();
  const { t } = useTranslation('home_page');
  const { t: tc } = useTranslation('common');

  const hasExtra = !!(
    data.total_sugar_g ||
    data.total_fiber_g ||
    data.total_water_ml
  );

  return (
    <div
      className={cn(
        'grid w-full grid-cols-4 gap-1.5',
        hasExtra ? 'grid-rows-2' : 'grid-rows-1',
      )}
    >
      <div
        className={cn(
          'relative col-span-1 flex flex-col items-center justify-center gap-0.5 rounded-2xl',
          hasExtra ? 'row-span-2' : 'row-span-1',
        )}
        style={{ backgroundColor: theme.section_bg_color }}
      >
        <span className="text-3xl leading-none font-semibold tracking-wider">
          {data.total_calories}
        </span>
        <span
          className="text-base leading-none font-medium"
          style={{ color: theme.hint_color }}
        >
          {tc('units.kcal')}
        </span>
        {user_data?.goal?.calories && (
          <div className="absolute bottom-1 flex flex-col gap-px text-center">
            <span
              className="text-xs leading-none font-medium"
              style={{ color: theme.hint_color }}
            >
              {Math.round(
                (data.total_calories / user_data.goal.calories) * 100,
              )}
              %
            </span>
            <span
              className="text-[10px] leading-none"
              style={{ color: theme.hint_color }}
            >
              {t('from_target')}
            </span>
          </div>
        )}
      </div>

      <div className={cn('col-span-3', hasExtra ? 'row-span-2' : 'row-span-1')}>
        <NutritionGridCard
          row1={{
            first: {
              title: t('protein'),
              value: data.total_protein_g,
              unit: tc('units.g'),
            },
            second: {
              title: t('fat'),
              value: data.total_fat_g,
              unit: tc('units.g'),
            },
            third: {
              title: t('carbs'),
              value: data.total_carbs_g,
              unit: tc('units.g'),
            },
          }}
          row2={
            hasExtra
              ? {
                  first: {
                    title: t('sugars'),
                    value: data.total_sugar_g,
                    unit: tc('units.g'),
                  },
                  second: {
                    title: t('fiber'),
                    value: data.total_fiber_g,
                    unit: tc('units.g'),
                  },
                  third: {
                    title: t('water'),
                    value: data.total_water_ml,
                    unit: tc('units.ml'),
                  },
                }
              : undefined
          }
        />
      </div>
    </div>
  );
};
