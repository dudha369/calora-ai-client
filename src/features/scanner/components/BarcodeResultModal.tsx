import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import {
  NutritionEditGrid,
  type NutritionValues,
} from '@/shared/ui/NutritionEditGrid';
import { MealPhotoToggle } from '@/shared/ui/MealPhotoToggle';
import type { ProductData } from '../types/productData';
import { useTheme } from '@/shared/context/ThemeContext';
import { useUser } from '@/shared/context/UserContext';
import {
  calcNutritionForAmount,
  checkProductAllergens,
  getUserAllergenKeys,
} from '@/features/home/lib/nutrition';
import { asStringDict } from '@/shared/lib/i18nDict';

interface BarcodeResultModalProps {
  product: ProductData;
  onConfirm: (
    product: ProductData,
    portionG: number,
    includePhoto: boolean,
  ) => Promise<void>;
  onClose: () => void;
}

const DEFAULT_PORTION_G = 100;

function buildNutritionValues(
  product: ProductData,
  portionG: number,
): NutritionValues {
  const scaled = calcNutritionForAmount(product.per100g, portionG);
  const waterMl =
    product.waterFractionPer100g != null
      ? Math.round(portionG * product.waterFractionPer100g)
      : 0;

  return {
    portion_g: scaled.amountG,
    calories: Math.round(scaled.calories ?? 0),
    protein_g: scaled.protein ?? 0,
    fat_g: scaled.fat ?? 0,
    carbs_g: scaled.carbs ?? 0,
    fiber_g: scaled.fiber ?? 0,
    sugar_g: scaled.sugars ?? 0,
    water_ml: waterMl,
  };
}

export const BarcodeResultModal = ({
  product,
  onConfirm,
  onClose,
}: BarcodeResultModalProps) => {
  const theme = useTheme();
  const { t } = useTranslation('scanner_page');
  const { user_data } = useUser();
  const startPortion = product.servingSizeG ?? DEFAULT_PORTION_G;
  const [isConfirming, setIsConfirming] = useState(false);
  const [includePhoto, setIncludePhoto] = useState(!!product.imageUrl);

  const [values, setValues] = useState<NutritionValues>(() =>
    buildNutritionValues(product, startPortion),
  );
  const [baseValues] = useState<NutritionValues>(() =>
    buildNutritionValues(product, startPortion),
  );

  const allergenNames = asStringDict(t('allergens', { returnObjects: true }));
  const novaGroupNames = asStringDict(
    t('nova_groups', { returnObjects: true }),
  );

  const userAllergenKeys = useMemo(
    () =>
      getUserAllergenKeys(
        user_data?.profile?.dietary_restrictions,
        user_data?.profile?.allergens,
      ),
    [user_data?.profile?.dietary_restrictions, user_data?.profile?.allergens],
  );

  const allergenMatch = useMemo(
    () => checkProductAllergens(product.allergens, userAllergenKeys),
    [product.allergens, userAllergenKeys],
  );

  const allergyNote = user_data?.profile?.allergy_note;
  const hasAllergyWarning =
    allergenMatch.confirmed.length > 0 || allergenMatch.possible.length > 0;

  const handleChange = useCallback((v: NutritionValues) => setValues(v), []);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm(product, values.portion_g, includePhoto);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <BottomSheet
      title={t('product_found')}
      onClose={onClose}
      actionLabel={t('add')}
      iconCustomEmojiId="5274008024585871702"
      onAction={handleConfirm}
      isProcessing={isConfirming}
      secondaryAction={{
        text: t('cancel'),
        iconCustomEmojiId: '5260342697075416641',
        position: 'left',
      }}
    >
      <div className="flex flex-col gap-3">
        <MealPhotoToggle
          photoUrl={product.imageUrl}
          displayName={product.name}
          included={includePhoto}
          onToggle={setIncludePhoto}
        />

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

        {product.novaGroup != null && (
          <div className="flex justify-center">
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-medium"
              style={{
                backgroundColor: theme.section_bg_color,
                color: theme.hint_color,
              }}
            >
              NOVA {product.novaGroup} ·{' '}
              {novaGroupNames[String(product.novaGroup)] ?? product.novaGroup}
            </span>
          </div>
        )}

        {hasAllergyWarning && (
          <div
            className="flex items-start gap-2 rounded-2xl p-3"
            style={{
              backgroundColor:
                allergenMatch.confirmed.length > 0
                  ? `${theme.destructive_text_color}15`
                  : '#f59e0b15',
            }}
          >
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0"
              style={{
                color:
                  allergenMatch.confirmed.length > 0
                    ? theme.destructive_text_color
                    : '#f59e0b',
              }}
            />
            <div className="flex flex-col gap-0.5">
              {allergenMatch.confirmed.length > 0 && (
                <p
                  className="text-sm font-semibold"
                  style={{ color: theme.destructive_text_color }}
                >
                  {t('allergy_warning.confirmed')}:{' '}
                  {allergenMatch.confirmed
                    .map((key) => allergenNames[key] ?? key)
                    .join(', ')}
                </p>
              )}
              {allergenMatch.possible.length > 0 && (
                <p className="text-xs" style={{ color: theme.hint_color }}>
                  {t('allergy_warning.possible')}:{' '}
                  {allergenMatch.possible
                    .map((key) => allergenNames[key] ?? key)
                    .join(', ')}
                </p>
              )}
            </div>
          </div>
        )}

        {allergyNote && (
          <p
            className="px-1 text-center text-xs leading-relaxed"
            style={{ color: theme.hint_color }}
          >
            ⚠️ {t('allergy_warning.check_manually', { note: allergyNote })}
          </p>
        )}

        {product.servingSizeG != null &&
          values.portion_g !== product.servingSizeG && (
            <div className="flex justify-center">
              <button
                onClick={() =>
                  setValues(
                    buildNutritionValues(product, product.servingSizeG!),
                  )
                }
                className="rounded-xl px-3 py-1.5 text-xs font-medium transition-opacity active:opacity-60"
                style={{
                  backgroundColor: theme.button_color,
                  color: theme.button_text_color,
                }}
              >
                {product.servingSizeStr ?? `${product.servingSizeG} г`}
              </button>
            </div>
          )}

        <NutritionEditGrid
          values={values}
          baseValues={baseValues}
          onChange={handleChange}
        />
      </div>
    </BottomSheet>
  );
};
