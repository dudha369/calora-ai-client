import { useMemo, useState, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import {
  NutritionEditGrid,
  type NutritionValues,
} from '@/shared/ui/NutritionEditGrid';
import { NutritionGrid } from '@/features/home/components/NutritionStats/NutritionGrid';
import { sumNutritionTotals } from '@/features/home/lib/nutrition';
import type {
  AnalyzedDish,
  FoodAnalyzeResponse,
} from '@/shared/types/api/food';
import { useTheme } from '@/shared/context/ThemeContext';

interface FoodResultModalProps {
  result: FoodAnalyzeResponse;
  onConfirm: (dishes: AnalyzedDish[]) => Promise<void>;
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
  onConfirm,
  onClose,
}: FoodResultModalProps) => {
  const theme = useTheme();
  const [dishes, setDishes] = useState<AnalyzedDish[]>(result.dishes);
  const [isConfirming, setIsConfirming] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(false);

  // Snapshot of original values per dish for proportional sync
  const [baseValues] = useState<NutritionValues[]>(() =>
    result.dishes.map(dishToNutrition),
  );

  const totals = useMemo(() => sumNutritionTotals(dishes), [dishes]);

  const updateDishName = (index: number, name: string) =>
    setDishes((prev) =>
      prev.map((d, i) => (i === index ? { ...d, name } : d)),
    );

  const updateDishNutrition = useCallback(
    (index: number, values: NutritionValues) =>
      setDishes((prev) =>
        prev.map((d, i) =>
          i === index ? nutritionToDish(d.name, d.confidence, values) : d,
        ),
      ),
    [],
  );

  const removeDish = (index: number) =>
    setDishes((prev) => prev.filter((_, i) => i !== index));

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm(dishes);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <BottomSheet
      title="Оценка блюда"
      onClose={onClose}
      actionLabel="Добавить"
      iconCustomEmojiId="5274008024585871702"
      onAction={handleConfirm}
      isProcessing={isConfirming}
      actionDisabled={dishes.length === 0}
      secondaryAction={{
        text: 'Отменить',
        iconCustomEmojiId: '5260342697075416641',
        position: 'left',
      }}
    >
      <div className="flex flex-col gap-3">
        {dishes.map((dish, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-2xl p-3"
            style={{ backgroundColor: theme.section_bg_color }}
          >
            {/* Name row */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={dish.name}
                onChange={(e) => updateDishName(i, e.target.value)}
                className="min-w-0 flex-1 rounded-xl px-3 py-2 text-sm font-semibold outline-none"
                style={{
                  backgroundColor: theme.secondary_bg_color,
                  color: theme.text_color,
                }}
              />
              {dishes.length > 1 && (
                <button
                  onClick={() => removeDish(i)}
                  aria-label="Удалить блюдо"
                  className="shrink-0 rounded-lg p-2 transition-opacity active:opacity-60"
                  style={{ color: theme.destructive_text_color }}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {/* Editable nutrition grid */}
            <NutritionEditGrid
              values={dishToNutrition(dish)}
              baseValues={baseValues[i] ?? dishToNutrition(dish)}
              syncEnabled={syncEnabled}
              onSyncToggle={() => setSyncEnabled((s) => !s)}
              onChange={(v) => updateDishNutrition(i, v)}
            />
          </div>
        ))}

        {/* Totals (read-only NutritionGrid) — shown only for multi-dish */}
        {dishes.length > 1 && <NutritionGrid data={totals} />}

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
