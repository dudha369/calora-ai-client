import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { NutritionGrid } from '../NutritionStats/NutritionGrid';
import {
  NutritionEditGrid,
  type NutritionValues,
} from '@/shared/ui/NutritionEditGrid';
import { useTheme } from '@/shared/context/ThemeContext';
import type { FoodLog, FoodItem } from '@/shared/types/api/food';
import { round1 } from '@/features/home/lib/nutrition';

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

interface EditMealSheetProps {
  log: FoodLog;
  isProcessing: boolean;
  onConfirm: (items: EditableItem[]) => void;
  onClose: () => void;
}

export const EditMealSheet = ({
  log,
  isProcessing,
  onConfirm,
  onClose,
}: EditMealSheetProps) => {
  const theme = useTheme();
  const { t } = useTranslation('home_page');
  const { t: tc } = useTranslation('common');

  const [editItems, setEditItems] = useState<EditableItem[]>(() =>
    log.items.map(toEditable),
  );
  const [baseItems] = useState<NutritionValues[]>(() =>
    log.items.map(toEditable).map(itemToNutrition),
  );

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

  const editTotals = useMemo(
    () =>
      editItems.reduce(
        (acc, d) => ({
          total_calories: acc.total_calories + d.calories,
          total_protein_g: round1(acc.total_protein_g + d.protein_g),
          total_fat_g: round1(acc.total_fat_g + d.fat_g),
          total_carbs_g: round1(acc.total_carbs_g + d.carbs_g),
          total_fiber_g: round1(acc.total_fiber_g + d.fiber_g),
          total_sugar_g: round1(acc.total_sugar_g + d.sugar_g),
          total_water_ml: acc.total_water_ml + d.water_ml,
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
    [editItems],
  );

  return (
    <BottomSheet
      title={t('edit_meal')}
      onClose={onClose}
      dragToClose={false}
      actionLabel={tc('buttons.save')}
      iconCustomEmojiId="5258336354642697821"
      onAction={() => onConfirm(editItems)}
      isProcessing={isProcessing}
      secondaryAction={{
        text: tc('buttons.cancel'),
        iconCustomEmojiId: '5260342697075416641',
        onClick: onClose,
        position: 'left',
      }}
    >
      <div className="flex flex-col gap-2.5">
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
    </BottomSheet>
  );
};
