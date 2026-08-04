export interface FavoriteMealItem {
  id: number;
  favorite_meal_id: number;
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

export interface FavoriteMeal {
  id: number;
  user_id: number;
  meal_name: string;
  source_log_id: number | null;
  created_at: string;
  items: FavoriteMealItem[];
}

export interface FavoriteItemIn {
  food_name: string;
  portion_g: number;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g?: number;
  sugar_g?: number;
  water_ml?: number;
}

export interface FavoriteMealIn {
  meal_name: string;
  items: FavoriteItemIn[];
  source_log_id?: number;
}
