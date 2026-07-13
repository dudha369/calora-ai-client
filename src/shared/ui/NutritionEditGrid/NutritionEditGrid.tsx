import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { useTheme } from '@/shared/context/ThemeContext';
import { NutritionEditGridCell } from './NutritionEditGridCell';
import { useState } from 'react';

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
  baseValues: NutritionValues;
  onRemoveItem?: () => void;
  onChange: (values: NutritionValues) => void;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

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
  onRemoveItem,
  onChange,
}: NutritionEditGridProps) => {
  const theme = useTheme();
  const { t } = useTranslation('home_page');
  const { t: tc } = useTranslation('common');
  const [syncEnabled, setSyncEnabled] = useState(false);

  const handleChange = (key: keyof NutritionValues, newValue: number) => {
    onChange(
      syncEnabled
        ? syncChange(key, newValue, baseValues)
        : { ...values, [key]: newValue },
    );
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid w-full grid-cols-4 grid-rows-2 gap-2">
        <div
          className="col-span-1 row-span-2 flex flex-col items-center justify-center rounded-2xl"
          style={{ backgroundColor: theme.section_bg_color }}
        >
          <NutritionEditGridCell
            label={tc('units.kcal')}
            value={values.calories}
            unit={tc('units.kcal')}
            onChange={(v) => handleChange('calories', v)}
          />
        </div>

        <div
          className="col-span-3 row-span-2 flex flex-col rounded-2xl"
          style={{ backgroundColor: theme.section_bg_color }}
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
            className="mx-auto h-0.5 w-[90%] rounded-full"
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

      <div className="flex w-full items-center gap-2">
        <div
          className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-3 text-sm"
          style={{
            backgroundColor: theme.secondary_bg_color,
          }}
        >
          <span style={{ color: theme.hint_color }}>
            {tc('nutrients.portion')}
          </span>

          <input
            type="number"
            inputMode="numeric"
            value={values.portion_g}
            min={1}
            max={9999}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              handleChange('portion_g', Number.isNaN(value) ? 1 : value);
            }}
            className="h-[calc(1lh+1rem)] min-w-0 flex-1 text-center font-medium"
            style={{
              color: theme.text_color,
              backgroundColor: 'transparent',
            }}
          />

          <span style={{ color: theme.hint_color }}>{tc('units.g')}</span>
        </div>

        <div
          className="inline-flex gap-px rounded-xl p-1"
          style={{
            backgroundColor: theme.secondary_bg_color,
          }}
        >
          <button
            onClick={() => setSyncEnabled(true)}
            className="rounded-lg px-2 py-1 text-sm transition-all duration-200"
            style={{
              backgroundColor: syncEnabled ? theme.button_color : 'transparent',
              color: syncEnabled ? theme.button_text_color : theme.hint_color,
            }}
          >
            Авто
          </button>

          <button
            onClick={() => setSyncEnabled(false)}
            className="rounded-lg px-2 py-1 text-sm transition-all duration-200"
            style={{
              backgroundColor: !syncEnabled
                ? theme.button_color
                : 'transparent',
              color: !syncEnabled ? theme.button_text_color : theme.hint_color,
            }}
          >
            Вручную
          </button>
        </div>

        {onRemoveItem && (
          <button
            onClick={() => onRemoveItem()}
            aria-label={tc('buttons.delete')}
            className="flex items-center rounded-full px-1 transition-opacity hover:opacity-80 active:opacity-60"
            style={{ color: theme.destructive_text_color }}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
