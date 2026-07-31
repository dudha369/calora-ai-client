import { useState, useCallback, useEffect } from 'react';
import { DishEditList, type DishEditListItem } from '@/shared/ui/DishEditList';
import { MealPhotoToggle } from '@/shared/ui/MealPhotoToggle';
import type { NutritionValues } from '@/shared/ui/NutritionEditGrid';
import type { FoodLog, FoodItem } from '@/shared/types/api/food';

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
  const [editItems, setEditItems] = useState<EditableItem[]>(() =>
    log.items.map(toEditable),
  );
  const [baseValues] = useState<NutritionValues[]>(() =>
    log.items.map(toEditable).map(itemToNutrition),
  );
  const [photoIncluded, setPhotoIncluded] = useState(!!log.photo_url);

  const handleItemChange = useCallback(
    (index: number, item: DishEditListItem) => {
      setEditItems((prev) =>
        prev.map((it, i) =>
          i === index ? nutritionToItem(item.name, item.values) : it,
        ),
      );
    },
    [],
  );

  const handleRemoveItem = useCallback((index: number) => {
    setEditItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  useEffect(() => {
    onDataChange(editItems, !!log.photo_url && !photoIncluded);
  }, [editItems, photoIncluded, log.photo_url, onDataChange]);

  const dishItems: DishEditListItem[] = editItems.map((item) => ({
    name: item.food_name,
    values: itemToNutrition(item),
  }));

  return (
    <div className="flex flex-col gap-2.5 pb-1">
      <MealPhotoToggle
        photoUrl={log.photo_url}
        displayName={log.meal_name ?? editItems[0]?.food_name ?? ''}
        included={photoIncluded}
        onToggle={setPhotoIncluded}
      />

      <DishEditList
        items={dishItems}
        baseValues={baseValues}
        onItemChange={handleItemChange}
        onRemoveItem={handleRemoveItem}
      />
    </div>
  );
};
