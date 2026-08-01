import type { FoodItem } from '@/shared/types/api/food';
import type { EditableItem } from '@/features/home/types/EditableItem.ts';
import type { NutritionValues } from '@/shared/ui/NutritionEditGrid';

export function toEditable(item: FoodItem): EditableItem {
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

export function itemToNutrition(item: EditableItem): NutritionValues {
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

export function nutritionToItem(
  name: string,
  v: NutritionValues,
): EditableItem {
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
