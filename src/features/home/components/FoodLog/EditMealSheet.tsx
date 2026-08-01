import { useState, useCallback, useEffect } from 'react';
import { DishEditList, type DishEditListItem } from '@/shared/ui/DishEditList';
import { MealPhotoToggle } from '@/shared/ui/MealPhotoToggle';
import type { NutritionValues } from '@/shared/ui/NutritionEditGrid';
import type { FoodLog } from '@/shared/types/api/food';
import type { EditableItem } from '../../types/EditableItem';
import {
  toEditable,
  itemToNutrition,
  nutritionToItem,
} from '../../lib/convert';

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
