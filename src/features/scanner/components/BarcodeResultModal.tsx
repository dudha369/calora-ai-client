import { useState, useCallback } from 'react';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import {
  NutritionEditGrid,
  type NutritionValues,
} from '@/shared/ui/NutritionEditGrid';
import type { ProductData } from '../types/productData';
import { useTheme } from '@/shared/context/ThemeContext';

interface BarcodeResultModalProps {
  product: ProductData;
  onConfirm: (product: ProductData, portionG: number) => Promise<void>;
  onClose: () => void;
}

const DEFAULT_PORTION_G = 100;

function buildNutritionValues(
  p: ProductData['per100g'],
  portionG: number,
  waterFractionPer100g: number | null,
): NutritionValues {
  const factor = portionG / 100;
  return {
    portion_g: portionG,
    calories: Math.round((p.calories ?? 0) * factor),
    protein_g: Math.round((p.protein ?? 0) * factor * 10) / 10,
    fat_g: Math.round((p.fat ?? 0) * factor * 10) / 10,
    carbs_g: Math.round((p.carbs ?? 0) * factor * 10) / 10,
    fiber_g: Math.round((p.fiber ?? 0) * factor * 10) / 10,
    sugar_g: Math.round((p.sugars ?? 0) * factor * 10) / 10,
    water_ml:
      waterFractionPer100g != null
        ? Math.round(portionG * waterFractionPer100g)
        : 0,
  };
}

export const BarcodeResultModal = ({
  product,
  onConfirm,
  onClose,
}: BarcodeResultModalProps) => {
  const theme = useTheme();
  const startPortion = product.servingSizeG ?? DEFAULT_PORTION_G;
  const [isConfirming, setIsConfirming] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(true);

  const [values, setValues] = useState<NutritionValues>(() =>
    buildNutritionValues(
      product.per100g,
      startPortion,
      product.waterFractionPer100g,
    ),
  );
  const [baseValues] = useState<NutritionValues>(() =>
    buildNutritionValues(
      product.per100g,
      startPortion,
      product.waterFractionPer100g,
    ),
  );

  const handleChange = useCallback((v: NutritionValues) => setValues(v), []);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm(product, values.portion_g);
    } finally {
      setIsConfirming(false);
    }
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
      <div className="flex flex-col gap-3">
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="mx-auto h-24 w-24 rounded-xl object-contain"
          />
        )}
        {/* Product name / brand */}
        <div className="flex flex-col items-center gap-0.5 px-2 pt-1">
          <p
            className="text-center text-sm font-medium"
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
        </div>

        {/* Serving size quick-pick */}
        {product.servingSizeG != null &&
          values.portion_g !== product.servingSizeG && (
            <div className="flex justify-center">
              <button
                onClick={() =>
                  setValues(
                    buildNutritionValues(
                      product.per100g,
                      product.servingSizeG!,
                      product.waterFractionPer100g,
                    ),
                  )
                }
                className="rounded-xl px-3 py-1.5 text-xs font-medium transition-opacity active:opacity-60"
                style={{
                  backgroundColor: `${theme.button_color}20`,
                  color: theme.button_color,
                }}
              >
                {product.servingSizeStr ?? `${product.servingSizeG} г`}
              </button>
            </div>
          )}

        {/* Editable nutrition grid (with portion) */}
        <NutritionEditGrid
          values={values}
          baseValues={baseValues}
          syncEnabled={syncEnabled}
          onSyncToggle={() => setSyncEnabled((s) => !s)}
          onChange={handleChange}
        />
      </div>
    </BottomSheet>
  );
};
