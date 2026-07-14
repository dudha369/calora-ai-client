import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ImageOff } from 'lucide-react';
import { NutritionGrid } from '../NutritionStats/NutritionGrid';
import {
  NutritionEditGrid,
  type NutritionValues,
} from '@/shared/ui/NutritionEditGrid';
import { useTheme } from '@/shared/context/ThemeContext';
import type { FoodLog, FoodItem } from '@/shared/types/api/food';
import { sumNutrition } from '@/features/home/lib/nutrition';

export interface EditableItem {
  food_name: string;
  portion_g: number;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  sugar_g: number;
  water_ml: number;
}

function toEditable(item: FoodItem): EditableItem {
  return {
    food_name: item.food_name,
    portion_g: item.portion_g,
    calories: item.calories,
    protein_g: item.protein_g,
    fat_g: item.fat_g,
    carbs_g: item.carbs_g,
    fiber_g: item.fiber_g,
    sugar_g: item.sugar_g,
    water_ml: item.water_ml,
  };
}

function itemToNutrition(item: EditableItem): NutritionValues {
  return {
    portion_g: item.portion_g,
    calories: item.calories,
    protein_g: item.protein_g,
    fat_g: item.fat_g,
    carbs_g: item.carbs_g,
    fiber_g: item.fiber_g,
    sugar_g: item.sugar_g,
    water_ml: item.water_ml,
  };
}

function nutritionToItem(name: string, v: NutritionValues): EditableItem {
  return {
    food_name: name,
    portion_g: v.portion_g,
    calories: v.calories,
    protein_g: v.protein_g,
    fat_g: v.fat_g,
    carbs_g: v.carbs_g,
    fiber_g: v.fiber_g,
    sugar_g: v.sugar_g,
    water_ml: v.water_ml,
  };
}

interface EditMealSheetContentProps {
  log: FoodLog;
  onDataChange: (items: EditableItem[], removePhoto: boolean) => void;
}

export const EditMealSheetContent = ({
  log,
  onDataChange,
}: EditMealSheetContentProps) => {
  const theme = useTheme();
  const { t } = useTranslation('home_page');

  const [editItems, setEditItems] = useState<EditableItem[]>(() =>
    log.items.map(toEditable),
  );
  const [baseItems] = useState<NutritionValues[]>(() =>
    log.items.map(toEditable).map(itemToNutrition),
  );
  const [photoRemoved, setPhotoRemoved] = useState(false);

  const manyItems = editItems.length > 1;

  const updateItemName = (index: number, name: string) =>
    setEditItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, food_name: name } : item,
      ),
    );

  const updateItemNutrition = useCallback(
    (index: number, values: NutritionValues) =>
      setEditItems((prev) =>
        prev.map((item, i) =>
          i === index ? nutritionToItem(item.food_name, values) : item,
        ),
      ),
    [],
  );

  const removeItem = (index: number) =>
    setEditItems((prev) => prev.filter((_, i) => i !== index));

  const editTotals = useMemo(() => sumNutrition(editItems), [editItems]);

  useEffect(() => {
    onDataChange(editItems, photoRemoved);
  }, [editItems, photoRemoved, onDataChange]);

  return (
    <div className="flex flex-col gap-2.5">
      {log.photo_url && (
        <div className="relative">
          {!photoRemoved ? (
            <>
              <div className="@container w-full">
                <img
                  src={log.photo_url}
                  alt={log.meal_name ?? editItems[0]?.food_name ?? ''}
                  className="h-auto max-h-[100cqw] w-full rounded-2xl object-cover"
                />
                <button
                  onClick={() => setPhotoRemoved(true)}
                  className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full backdrop-blur-sm transition-opacity active:opacity-60"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: '#fff',
                  }}
                  aria-label={t('remove_photo')}
                >
                  <X size={14} />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => setPhotoRemoved(false)}
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
        </div>
      )}

      {editItems.map((item, i) => (
        <div
          key={i}
          className="flex flex-col gap-2.5 rounded-2xl p-3"
          style={{ border: `2px solid ${theme.section_bg_color}` }}
        >
          <div className="flex items-center gap-2">
            {manyItems && (
              <span
                className="inline-flex size-7.5 shrink-0 items-center justify-center rounded-full text-base font-medium"
                style={{
                  border: `${theme.hint_color} 2px dashed`,
                  color: theme.text_color,
                }}
              >
                {i + 1}
              </span>
            )}

            <textarea
              value={item.food_name}
              onChange={(e) => updateItemName(i, e.target.value)}
              className="field-sizing-content max-h-[calc(2lh+1rem)] min-h-[calc(1lh+1rem)] w-full flex-1 rounded-xl px-3 py-2 text-sm font-semibold"
              style={{
                backgroundColor: theme.section_bg_color,
                color: theme.text_color,
              }}
            />
          </div>

          <NutritionEditGrid
            values={itemToNutrition(item)}
            baseValues={baseItems[i] ?? itemToNutrition(item)}
            onRemoveItem={manyItems ? () => removeItem(i) : undefined}
            onChange={(v) => updateItemNutrition(i, v)}
          />
        </div>
      ))}

      <div className="flex flex-col gap-px">
        <span
          className="text-base font-medium"
          style={{ color: theme.text_color }}
        ></span>
        <NutritionGrid data={editTotals} />
      </div>
    </div>
  );
};
