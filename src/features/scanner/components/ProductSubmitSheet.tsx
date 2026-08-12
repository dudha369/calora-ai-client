import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { useTheme } from '@/shared/context/ThemeContext';
import {
  NutritionEditGrid,
  type NutritionValues,
} from '@/shared/ui/NutritionEditGrid';
import { openFoodFactsApi } from '@/shared/api/openfoodfacts';

const EMPTY_VALUES: NutritionValues = {
  portion_g: 100,
  calories: 0,
  protein_g: 0,
  fat_g: 0,
  carbs_g: 0,
  fiber_g: 0,
  sugar_g: 0,
  water_ml: 0,
};

interface ProductSubmitSheetProps {
  barcode: string;
  mode: 'add' | 'edit';
  initialName?: string;
  initialBrand?: string;
  initialValues?: NutritionValues;
  onClose: () => void;
  onSubmitted: () => void;
}

export const ProductSubmitSheet = ({
  barcode,
  mode,
  initialName = '',
  initialBrand = '',
  initialValues,
  onClose,
  onSubmitted,
}: ProductSubmitSheetProps) => {
  const theme = useTheme();
  const { t } = useTranslation('quick_actions');
  const { t: tc } = useTranslation('common');

  const [name, setName] = useState(initialName);
  const [brand, setBrand] = useState(initialBrand);
  const [values, setValues] = useState<NutritionValues>(
    initialValues ?? EMPTY_VALUES,
  );
  const [baseValues] = useState<NutritionValues>(initialValues ?? EMPTY_VALUES);

  const { mutate, isPending, isError } = useMutation({
    mutationFn: () =>
      openFoodFactsApi.submit({
        barcode,
        product_name: name.trim(),
        brand: brand.trim() || undefined,
        portion_g: values.portion_g,
        calories: values.calories,
        protein_g: values.protein_g,
        fat_g: values.fat_g,
        carbs_g: values.carbs_g,
        fiber_g: values.fiber_g,
        sugar_g: values.sugar_g,
      }),
    onSuccess: onSubmitted,
  });

  const canSubmit = name.trim().length > 0 && values.calories > 0;

  return (
    <BottomSheet
      title={t(
        mode === 'add'
          ? 'barcode_manual.add_product'
          : 'barcode_manual.suggest_fix',
      )}
      onClose={onClose}
      actionLabel={tc('buttons.save')}
      onAction={() => canSubmit && mutate()}
      actionDisabled={!canSubmit}
      isProcessing={isPending}
    >
      <div className="flex flex-col gap-3 pb-1">
        <div className="flex flex-col gap-1.5">
          <span
            className="px-1 text-xs font-medium"
            style={{ color: theme.hint_color }}
          >
            {tc('nutrients.name')}
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('barcode_manual.product_name_placeholder')}
            className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold"
            style={{
              backgroundColor: theme.section_bg_color,
              color: theme.text_color,
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span
            className="px-1 text-xs font-medium"
            style={{ color: theme.hint_color }}
          >
            {t('barcode_manual.brand')}
          </span>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder={`*${tc('optional')}`}
            className="w-full rounded-xl px-3 py-2.5 text-sm"
            style={{
              backgroundColor: theme.section_bg_color,
              color: theme.text_color,
            }}
          />
        </div>

        <NutritionEditGrid
          values={values}
          baseValues={baseValues}
          onChange={setValues}
        />

        {isError && (
          <p
            className="text-center text-xs"
            style={{ color: theme.destructive_text_color }}
          >
            {t('barcode_manual.submit_failed')}
          </p>
        )}
      </div>
    </BottomSheet>
  );
};
