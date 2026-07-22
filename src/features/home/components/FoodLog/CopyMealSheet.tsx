import { useState, useMemo, useEffect } from 'react';
import { ImageOff, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/context/ThemeContext';
import { round1 } from '@/features/home/lib/nutrition';
import {
  NutritionGrid,
  type NutritionGridStats,
} from '../NutritionGrid/NutritionGrid';
import type { FoodLog, FoodItemIn } from '@/shared/types/api/food';
import { MealImageOverlay } from '@/shared/ui/MealImageOverlay';

export interface CopyMealResult {
  items: FoodItemIn[];
  includePhoto: boolean;
}

interface CopyMealSheetContentProps {
  log: FoodLog;
  onDataChange: (result: CopyMealResult) => void;
}

export const CopyMealSheetContent = ({
  log,
  onDataChange,
}: CopyMealSheetContentProps) => {
  const theme = useTheme();
  const { t } = useTranslation('home_page');
  const { t: tc } = useTranslation('common');

  const [name, setName] = useState(
    log.meal_name ?? log.items[0]?.food_name ?? '',
  );
  const [includePhoto, setIncludePhoto] = useState(!!log.photo_url);

  const originalPortion = log.items.reduce((s, i) => s + i.portion_g, 0);
  const [portionG, setPortionG] = useState(originalPortion);

  const ratio = originalPortion > 0 ? portionG / originalPortion : 1;

  const scaledItems: FoodItemIn[] = useMemo(
    () =>
      log.items.map((item, i) => ({
        food_name: i === 0 ? name : item.food_name,
        portion_g: round1(item.portion_g * ratio),
        calories: Math.round(item.calories * ratio),
        protein_g: round1(item.protein_g * ratio),
        fat_g: round1(item.fat_g * ratio),
        carbs_g: round1(item.carbs_g * ratio),
        fiber_g: round1(item.fiber_g * ratio),
        sugar_g: round1(item.sugar_g * ratio),
        water_ml: Math.round(item.water_ml * ratio),
      })),
    [log.items, name, ratio],
  );

  const totals: NutritionGridStats = useMemo(
    () =>
      scaledItems.reduce(
        (acc, d) => ({
          total_calories: acc.total_calories + d.calories,
          total_protein_g: round1(acc.total_protein_g + d.protein_g),
          total_fat_g: round1(acc.total_fat_g + d.fat_g),
          total_carbs_g: round1(acc.total_carbs_g + d.carbs_g),
          total_fiber_g: round1(acc.total_fiber_g + (d.fiber_g ?? 0)),
          total_sugar_g: round1(acc.total_sugar_g + (d.sugar_g ?? 0)),
          total_water_ml: acc.total_water_ml + (d.water_ml ?? 0),
        }),
        {
          total_calories: 0,
          total_protein_g: 0,
          total_fat_g: 0,
          total_carbs_g: 0,
          total_fiber_g: 0,
          total_sugar_g: 0,
          total_water_ml: 0,
        },
      ),
    [scaledItems],
  );

  // Отдаём наверх (в FoodLogModal) актуальный результат при каждом
  // изменении — родитель хранит его в ref и читает при нажатии
  // на кнопку подтверждения (она теперь живёт в общем BottomSheet).
  useEffect(() => {
    onDataChange({ items: scaledItems, includePhoto });
  }, [scaledItems, includePhoto, onDataChange]);

  return (
    <div className="flex flex-col gap-3 pb-1">
      {log.photo_url && (
        <>
          {includePhoto ? (
            <MealImageOverlay
              photo_url={log.photo_url}
              displayName={name}
              button={{
                onClick: () => setIncludePhoto(false),
                icon: Trash2,
                iconColor: theme.destructive_text_color,
              }}
            />
          ) : (
            <button
              onClick={() => setIncludePhoto(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 transition-opacity active:opacity-60"
              style={{ backgroundColor: theme.secondary_bg_color }}
            >
              <ImageOff size={18} style={{ color: theme.hint_color }} />
              <span
                className="text-sm font-medium"
                style={{ color: theme.hint_color }}
              >
                {t('photo_removed')}
              </span>
            </button>
          )}
        </>
      )}

      <div className="flex flex-col gap-1.5">
        <span
          className="px-1 text-xs font-medium"
          style={{ color: theme.hint_color }}
        >
          {tc('nutrients.name')}
        </span>
        <textarea
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="field-sizing-content max-h-[calc(2lh+1rem)] min-h-[calc(1lh+1rem)] w-full rounded-xl px-3 py-2 text-sm font-semibold"
          style={{
            backgroundColor: theme.secondary_bg_color,
            color: theme.text_color,
          }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span
          className="px-1 text-xs font-medium"
          style={{ color: theme.hint_color }}
        >
          {tc('nutrients.portion')}
        </span>
        <div className="relative">
          <input
            type="number"
            inputMode="numeric"
            value={portionG}
            min={1}
            max={9999}
            onChange={(e) =>
              setPortionG(Math.max(1, Math.round(Number(e.target.value))))
            }
            className="w-full rounded-xl py-2.5 pr-8 pl-3 text-sm font-medium"
            style={{
              backgroundColor: theme.secondary_bg_color,
              color: theme.text_color,
            }}
          />
          <span
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs"
            style={{ color: theme.hint_color }}
          >
            {tc('units.g')}
          </span>
        </div>
      </div>

      <NutritionGrid data={totals} />
    </div>
  );
};
