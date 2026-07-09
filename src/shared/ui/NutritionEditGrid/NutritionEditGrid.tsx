import { useTranslation } from 'react-i18next';
import { Link2, Unlink } from 'lucide-react';
import { useTheme } from '@/shared/context/ThemeContext';
import { NutritionEditGridCell } from './NutritionEditGridCell';

export interface NutritionValues {
  portion_g: number;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  sugar_g: number;
  water_ml: number;
}

interface NutritionEditGridProps {
  values: NutritionValues;
  /** Snapshot of values when edit started — used as reference for sync */
  baseValues: NutritionValues;
  syncEnabled: boolean;
  onSyncToggle: () => void;
  onChange: (values: NutritionValues) => void;
  /** Hide portion row (e.g. barcode modal handles portion separately) */
  hidePortion?: boolean;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Proportionally scale all nutrient values when one changes.
 * ratio = newValue / baseValue → apply to all base values.
 */
function syncChange(
  key: keyof NutritionValues,
  newValue: number,
  base: NutritionValues,
): NutritionValues {
  const baseVal = base[key];
  if (baseVal === 0) return { ...base, [key]: newValue };

  const ratio = newValue / baseVal;
  return {
    portion_g: round1(base.portion_g * ratio),
    calories: Math.round(base.calories * ratio),
    protein_g: round1(base.protein_g * ratio),
    fat_g: round1(base.fat_g * ratio),
    carbs_g: round1(base.carbs_g * ratio),
    fiber_g: round1(base.fiber_g * ratio),
    sugar_g: round1(base.sugar_g * ratio),
    water_ml: Math.round(base.water_ml * ratio),
  };
}

export const NutritionEditGrid = ({
  values,
  baseValues,
  syncEnabled,
  onSyncToggle,
  onChange,
  hidePortion = false,
}: NutritionEditGridProps) => {
  const theme = useTheme();
  const { t } = useTranslation('home_page');
  const { t: tc } = useTranslation('common');

  const handleChange = (key: keyof NutritionValues, newValue: number) => {
    onChange(
      syncEnabled
        ? syncChange(key, newValue, baseValues)
        : { ...values, [key]: newValue },
    );
  };

  return (
    <div className="flex flex-col gap-1.5">
      {/* Sync toggle */}
      <div className="flex items-center justify-end px-0.5">
        <button
          onClick={onSyncToggle}
          className="flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-medium transition-opacity active:opacity-60"
          style={{
            backgroundColor: syncEnabled
              ? `${theme.button_color}20`
              : theme.secondary_bg_color,
            color: syncEnabled ? theme.button_color : theme.hint_color,
          }}
        >
          {syncEnabled ? <Link2 size={12} /> : <Unlink size={12} />}
          {syncEnabled
            ? tc('sync.linked', { defaultValue: 'Связано' })
            : tc('sync.independent', { defaultValue: 'Раздельно' })}
        </button>
      </div>

      {/* Grid: Calories left | 3×2 nutrients right */}
      <div className="grid w-full grid-cols-4 grid-rows-2 gap-1.5">
        {/* Calories — left, spans 2 rows */}
        <div
          className="col-span-1 row-span-2 flex flex-col items-center justify-center rounded-2xl"
          style={{ backgroundColor: theme.section_bg_color }}
        >
          <NutritionEditGridCell
            label={tc('units.kcal')}
            value={values.calories}
            unit={tc('units.kcal')}
            large
            onChange={(v) => handleChange('calories', v)}
          />
        </div>

        {/* Right 3×2 grid */}
        <div
          className="col-span-3 row-span-2 flex flex-col rounded-2xl"
          style={{ backgroundColor: theme.secondary_bg_color }}
        >
          <div className="flex flex-1">
            <NutritionEditGridCell
              label={t('protein')}
              value={values.protein_g}
              unit={tc('units.g')}
              step={0.1}
              onChange={(v) => handleChange('protein_g', v)}
            />
            <NutritionEditGridCell
              label={t('fat')}
              value={values.fat_g}
              unit={tc('units.g')}
              step={0.1}
              onChange={(v) => handleChange('fat_g', v)}
            />
            <NutritionEditGridCell
              label={t('carbs')}
              value={values.carbs_g}
              unit={tc('units.g')}
              step={0.1}
              onChange={(v) => handleChange('carbs_g', v)}
            />
          </div>
          <div
            className="mx-auto h-px w-[90%]"
            style={{ backgroundColor: theme.section_separator_color }}
          />
          <div className="flex flex-1">
            <NutritionEditGridCell
              label={t('sugars')}
              value={values.sugar_g}
              unit={tc('units.g')}
              step={0.1}
              onChange={(v) => handleChange('sugar_g', v)}
            />
            <NutritionEditGridCell
              label={t('fiber')}
              value={values.fiber_g}
              unit={tc('units.g')}
              step={0.1}
              onChange={(v) => handleChange('fiber_g', v)}
            />
            <NutritionEditGridCell
              label={t('water')}
              value={values.water_ml}
              unit={tc('units.ml')}
              onChange={(v) => handleChange('water_ml', v)}
            />
          </div>
        </div>
      </div>

      {/* Portion row */}
      {!hidePortion && (
        <div
          className="flex items-center justify-between rounded-2xl px-4 py-2"
          style={{ backgroundColor: theme.section_bg_color }}
        >
          <span
            className="text-sm font-medium"
            style={{ color: theme.hint_color }}
          >
            {tc('nutrients.portion', { defaultValue: 'Порция' })}
          </span>
          <NutritionEditGridCell
            label={tc('units.g')}
            value={values.portion_g}
            unit={tc('units.g')}
            onChange={(v) => handleChange('portion_g', v)}
          />
        </div>
      )}
    </div>
  );
};
