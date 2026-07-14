import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, X, ImageOff } from 'lucide-react';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import {
  NutritionEditGrid,
  type NutritionValues,
} from '@/shared/ui/NutritionEditGrid';
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
  const { t: th } = useTranslation('home_page');
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

  // ── Словари переводов для динамических ключей (аллергены, NOVA-группы) ───
  // Ключ здесь статический ('allergens' / 'nova_groups'), поэтому сам вызов
  // t() типобезопасен. returnObjects: true отдаёт вложенный объект целиком,
  // а не строку — форму этого объекта уточняем через asStringDict (см.
  // src/shared/lib/i18nDict.ts), общий для всех мест, где нужен такой словарь.
  const allergenNames = asStringDict(t('allergens', { returnObjects: true }));
  const novaGroupNames = asStringDict(
    t('nova_groups', { returnObjects: true }),
  );

  // ── Аллергены: сверяем ограничения из профиля с составом товара ──────────
  const userAllergenKeys = useMemo(
    () => getUserAllergenKeys(user_data?.profile?.dietary_restrictions),
    [user_data?.profile?.dietary_restrictions],
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
          <div className="@container relative w-full">
            {includePhoto ? (
              <>
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-auto max-h-[100cqw] w-full rounded-2xl object-cover"
                />
                <button
                  onClick={() => setIncludePhoto(false)}
                  className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full backdrop-blur-sm transition-opacity active:opacity-60"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: '#fff',
                  }}
                  aria-label={th('remove_photo')}
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIncludePhoto(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 transition-opacity active:opacity-60"
                style={{ backgroundColor: theme.secondary_bg_color }}
              >
                <ImageOff size={18} style={{ color: theme.hint_color }} />
                <span
                  className="text-sm font-medium"
                  style={{ color: theme.hint_color }}
                >
                  {th('photo_removed')}
                </span>
              </button>
            )}
          </div>
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

        {/* NOVA — степень промышленной обработки */}
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

        {/* Предупреждение об аллергенах */}
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

        {/* Аллергия указана свободным текстом — структурно сверить нельзя,
            только напоминаем проверить состав самостоятельно */}
        {allergyNote && (
          <p
            className="px-1 text-center text-xs leading-relaxed"
            style={{ color: theme.hint_color }}
          >
            ⚠️ {t('allergy_warning.check_manually', { note: allergyNote })}
          </p>
        )}

        {/* Serving size quick-pick */}
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
          onChange={handleChange}
        />
      </div>
    </BottomSheet>
  );
};
