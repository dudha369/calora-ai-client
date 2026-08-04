import { food, todayApiDate } from '@/shared/api/food';
import type { FavoriteMeal } from '@/shared/types/api/favorites';

export function logFavoriteMeal(favorite: FavoriteMeal) {
  const totalWaterMl = favorite.items.reduce((sum, i) => sum + i.water_ml, 0);
  return food.log({
    log_date: todayApiDate(),
    items: favorite.items.map((i) => ({
      food_name: i.food_name,
      portion_g: i.portion_g,
      calories: i.calories,
      protein_g: i.protein_g,
      fat_g: i.fat_g,
      carbs_g: i.carbs_g,
      fiber_g: i.fiber_g,
      sugar_g: i.sugar_g,
      water_ml: i.water_ml,
    })),
    meal_name: favorite.meal_name,
    water_ml: totalWaterMl > 0 ? totalWaterMl : undefined,
  });
}
