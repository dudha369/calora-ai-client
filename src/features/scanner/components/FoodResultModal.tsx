import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { DishEditList, type DishEditListItem } from '@/shared/ui/DishEditList';
import { MealPhotoToggle } from '@/shared/ui/MealPhotoToggle';
import type { NutritionValues } from '@/shared/ui/NutritionEditGrid';
import type {
  AnalyzedDish,
  FoodAnalyzeResponse,
} from '@/shared/types/api/food';
import { useTheme } from '@/shared/context/ThemeContext';

interface FoodResultModalProps {
  result: FoodAnalyzeResponse;
  /** Превью снятого фото (data URL) — для показа и возможности открепить */
  photo: string | null;
  onConfirm: (
    dishes: AnalyzedDish[],
    mealName: string,
    includePhoto: boolean,
  ) => Promise<void>;
  onClose: () => void;
}

function dishToNutrition(d: AnalyzedDish): NutritionValues {
  return {
    portion_g: d.portion_g,
    calories: d.calories,
    protein_g: d.protein_g,
    fat_g: d.fat_g,
    carbs_g: d.carbs_g,
    fiber_g: d.fiber_g,
    sugar_g: d.sugar_g,
    water_ml: d.water_ml,
  };
}

function nutritionToDish(
  name: string,
  confidence: number,
  v: NutritionValues,
): AnalyzedDish {
  return {
    name,
    confidence,
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

export const FoodResultModal = ({
  result,
  photo,
  onConfirm,
  onClose,
}: FoodResultModalProps) => {
  const theme = useTheme();
  const { t } = useTranslation('scanner_page');
  const [dishes, setDishes] = useState<AnalyzedDish[]>(result.dishes);
  const [mealName, setMealName] = useState(result.meal_name ?? '');
  const [isConfirming, setIsConfirming] = useState(false);
  const [includePhoto, setIncludePhoto] = useState(!!photo);
  const isMultiDish = dishes.length > 1;

  const [baseValues] = useState<NutritionValues[]>(() =>
    result.dishes.map(dishToNutrition),
  );

  const dishItems: DishEditListItem[] = dishes.map((d) => ({
    name: d.name,
    values: dishToNutrition(d),
  }));

  const handleItemChange = useCallback(
    (index: number, item: DishEditListItem) => {
      setDishes((prev) =>
        prev.map((d, i) =>
          i === index
            ? nutritionToDish(item.name, d.confidence, item.values)
            : d,
        ),
      );
    },
    [],
  );

  // Когда после удаления остаётся ровно одно блюдо — meal_name должен стать
  // названием этого блюда, а не оставаться тем, что придумал ИИ для целого
  // (изначально многосоставного) приёма пищи.
  const handleRemoveItem = useCallback((index: number) => {
    setDishes((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 1) setMealName(next[0].name);
      return next;
    });
  }, []);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      const finalName = isMultiDish
        ? mealName.trim() || dishes[0]?.name || ''
        : dishes[0]?.name || '';
      await onConfirm(dishes, finalName, includePhoto);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <BottomSheet
      title={t('dish_rating')}
      onClose={onClose}
      actionLabel={t('add')}
      iconCustomEmojiId="5274008024585871702"
      onAction={handleConfirm}
      isProcessing={isConfirming}
      actionDisabled={dishes.length === 0}
      secondaryAction={{
        text: t('cancel'),
        iconCustomEmojiId: '5260342697075416641',
        position: 'left',
      }}
    >
      <div className="flex flex-col gap-3">
        <MealPhotoToggle
          photoUrl={photo}
          displayName={mealName || t('captured_photo')}
          included={includePhoto}
          onToggle={setIncludePhoto}
        />

        {isMultiDish && (
          <input
            type="text"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            placeholder={t('meal_name_placeholder')}
            className="w-full rounded-xl px-3 py-2.5 text-base font-bold"
            style={{
              backgroundColor: theme.secondary_bg_color,
              color: theme.text_color,
            }}
          />
        )}

        <DishEditList
          items={dishItems}
          baseValues={baseValues}
          onItemChange={handleItemChange}
          onRemoveItem={handleRemoveItem}
        />

        {result.ask_user && result.portion_note && (
          <p
            className="px-1 text-center text-xs leading-relaxed"
            style={{ color: theme.hint_color }}
          >
            ⚠️ {result.portion_note}
          </p>
        )}
      </div>
    </BottomSheet>
  );
};
