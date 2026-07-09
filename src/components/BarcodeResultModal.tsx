import { useState } from 'react';
import { BottomSheet } from './BottomSheet';
import {
  NutritionGrid,
  type NutritionGridStats,
} from './NutritionStats/NutritionGrid';
import type { ProductData } from '../types/productData';
import { useTheme } from '../context/ThemeContext';

interface BarcodeResultModalProps {
  /**
   * Всегда не-null: если штрихкод не нашёлся в Open Food Facts,
   * useFoodAnalysis сам проваливается в ИИ-анализ фото, и этот компонент
   * в таком случае вообще не монтируется (см. ScannerPage).
   */
  product: ProductData;
  onConfirm: (product: ProductData, portionG: number) => Promise<void>;
  onClose: () => void;
}

const DEFAULT_PORTION_G = 100;

const scale = (value: number | null, factor: number): number => {
  if (value == null) return 0;
  return value * factor;
};

export const BarcodeResultModal = ({
  product,
  onConfirm,
  onClose,
}: BarcodeResultModalProps) => {
  const theme = useTheme();
  const [portionG, setPortionG] = useState(
    product.servingSizeG ?? DEFAULT_PORTION_G,
  );
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm(product, portionG);
    } finally {
      setIsConfirming(false);
    }
  };

  const factor = portionG / 100;
  const p = product.per100g;

  const data: NutritionGridStats = {
    total_calories: Math.round((p.calories ?? 0) * factor),
    total_protein_g: scale(p.protein, factor),
    total_fat_g: scale(p.fat, factor),
    total_carbs_g: scale(p.carbs, factor),
    total_sugar_g: scale(p.sugars, factor),
    total_fiber_g: scale(p.fiber, factor),
    total_water_ml: 0,
  };

  return (
    <BottomSheet
      title="Продукт найден"
      onClose={onClose}
      actionLabel="Добавить"
      iconCustomEmojiId="5274008024585871702"
      onAction={handleConfirm}
      isProcessing={isConfirming}
      secondaryAction={{
        text: 'Отменить',
        iconCustomEmojiId: '5260342697075416641',
        position: 'left',
      }}
    >
      <div className="flex flex-col gap-2">
        <p
          className="mt-1 text-center text-sm font-medium"
          style={{ color: theme.text_color }}
        >
          {product.name}
        </p>
        {product.brand && (
          <p
            className="text-center text-xs"
            style={{ color: theme.hint_color }}
          >
            {product.brand}
          </p>
        )}

        <div className="mt-3 flex items-center gap-2">
          <span
            className="shrink-0 text-sm"
            style={{ color: theme.hint_color }}
          >
            Порция:
          </span>

          <div className="relative flex-1">
            <input
              type="number"
              inputMode="numeric"
              value={portionG}
              min={1}
              onChange={(e) =>
                setPortionG(Math.max(1, Math.round(Number(e.target.value))))
              }
              className="w-full rounded-xl py-2 pr-7 pl-3 text-sm outline-none"
              style={{
                backgroundColor: theme.secondary_bg_color,
                color: theme.text_color,
              }}
            />
            <span
              className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-xs"
              style={{ color: theme.hint_color }}
            >
              г
            </span>
          </div>

          {product.servingSizeG != null && (
            <button
              onClick={() => setPortionG(product.servingSizeG!)}
              className="shrink-0 rounded-xl px-2.5 py-1.5 text-xs font-medium"
              style={{
                backgroundColor: `${theme.button_color}20`,
                color: theme.button_color,
              }}
            >
              {product.servingSizeStr ?? `${product.servingSizeG} г`}
            </button>
          )}
        </div>

        <NutritionGrid data={data} />
      </div>
    </BottomSheet>
  );
};
