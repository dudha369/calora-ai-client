import { useState, useMemo } from 'react';
import { X, ImageOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { useTheme } from '@/shared/context/ThemeContext';
import { round1 } from '@/features/home/lib/nutrition';
import {
  NutritionGrid,
  type NutritionGridStats,
} from '../NutritionStats/NutritionGrid';
import type { FoodLog, FoodItem, FoodItemIn } from '@/shared/types/api/food';

export interface CopyMealResult {
  items: FoodItemIn[];
  includePhoto: boolean;
}

interface CopyMealSheetProps {
  log: FoodLog;
  isProcessing: boolean;
  onConfirm: (result: CopyMealResult) => void;
  onClose: () => void;
}

export const CopyMealSheet = ({
  log,
  isProcessing,
  onConfirm,
  onClose,
}: CopyMealSheetProps) => {
  const theme = useTheme();
  const { t } = useTranslation('home_page');
  const { t: tc } = useTranslation('common');

  const [name, setName] = useState(log.items[0]?.food_name ?? '');
  const [includePhoto, setIncludePhoto] = useState(!!log.photo_url);

  const originalPortion = log.items.reduce((s, i) => s + i.portion_g, 0);
  const [portionG, setPortionG] = useState(originalPortion);

  const ratio = originalPortion > 0 ? portionG / originalPortion : 1;

  const scaledItems: FoodItemIn[] = useMemo(
    () =>
      log.items.map((item, i) => ({
        food_name: i === 0 ? name : item.food_name,
        portion_g: round1(item.portion_g * ratio),
        calories: Math.round(item.calories * ratio),
        protein_g: round1(item.protein_g * ratio),
        fat_g: round1(item.fat_g * ratio),
        carbs_g: round1(item.carbs_g * ratio),
        fiber_g: round1(item.fiber_g * ratio),
        sugar_g: round1(item.sugar_g * ratio),
        water_ml: Math.round(item.water_ml * ratio),
      })),
    [log.items, name, ratio],
  );

  const totals: NutritionGridStats = useMemo(
    () =>
      scaledItems.reduce(
        (acc, d) => ({
          total_calories: acc.total_calories + d.calories,
          total_protein_g: round1(acc.total_protein_g + d.protein_g),
          total_fat_g: round1(acc.total_fat_g + d.fat_g),
          total_carbs_g: round1(acc.total_carbs_g + d.carbs_g),
          total_fiber_g: round1(acc.total_fiber_g + (d.fiber_g ?? 0)),
          total_sugar_g: round1(acc.total_sugar_g + (d.sugar_g ?? 0)),
          total_water_ml: acc.total_water_ml + (d.water_ml ?? 0),
        }),
        {
          total_calories: 0,
          total_protein_g: 0,
          total_fat_g: 0,
          total_carbs_g: 0,
          total_fiber_g: 0,
          total_sugar_g: 0,
          total_water_ml: 0,
        },
      ),
    [scaledItems],
  );

  const handleConfirm = () => {
    onConfirm({ items: scaledItems, includePhoto });
  };

  return (
    <BottomSheet
      title={t('copy_meal', { defaultValue: 'Копирование' })}
      onClose={onClose}
      actionLabel={tc('buttons.copy', { defaultValue: 'Копировать' })}
      iconCustomEmojiId="5258477770735885832"
      onAction={handleConfirm}
      isProcessing={isProcessing}
      secondaryAction={{
        text: tc('buttons.cancel', { defaultValue: 'Отменить' }),
        iconCustomEmojiId: '5260342697075416641',
        onClick: onClose,
        position: 'left',
      }}
    >
      <div className="flex flex-col gap-3">
        {/* Photo with remove button */}
        {log.photo_url && (
          <div className="relative">
            {includePhoto ? (
              <>
                <img
                  src={log.photo_url}
                  alt={name}
                  className="aspect-video w-full rounded-2xl object-cover"
                />
                <button
                  onClick={() => setIncludePhoto(false)}
                  className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full backdrop-blur-sm transition-opacity active:opacity-60"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: '#fff',
                  }}
                  aria-label={t('remove_photo', {
                    defaultValue: 'Убрать фото',
                  })}
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
                  {t('photo_removed', {
                    defaultValue: 'Фото убрано — нажмите, чтобы вернуть',
                  })}
                </span>
              </button>
            )}
          </div>
        )}

        {/* Name input */}
        <div className="flex flex-col gap-1.5">
          <span
            className="px-1 text-xs font-medium"
            style={{ color: theme.hint_color }}
          >
            {tc('nutrients.name', { defaultValue: 'Название' })}
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold outline-none"
            style={{
              backgroundColor: theme.secondary_bg_color,
              color: theme.text_color,
            }}
          />
        </div>

        {/* Portion input */}
        <div className="flex flex-col gap-1.5">
          <span
            className="px-1 text-xs font-medium"
            style={{ color: theme.hint_color }}
          >
            {tc('nutrients.portion', { defaultValue: 'Порция' })}
          </span>
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              value={portionG}
              min={1}
              onChange={(e) =>
                setPortionG(Math.max(1, Math.round(Number(e.target.value))))
              }
              className="w-full rounded-xl py-2.5 pr-8 pl-3 text-sm font-medium outline-none"
              style={{
                backgroundColor: theme.secondary_bg_color,
                color: theme.text_color,
              }}
            />
            <span
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs"
              style={{ color: theme.hint_color }}
            >
              {tc('units.g')}
            </span>
          </div>
        </div>

        {/* Nutrition preview */}
        <NutritionGrid data={totals} />
      </div>
    </BottomSheet>
  );
};
