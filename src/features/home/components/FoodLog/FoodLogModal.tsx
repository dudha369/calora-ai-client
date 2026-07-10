import { useState, useMemo, useCallback } from 'react';
import {
  Clock,
  UtensilsCrossed,
  Copy,
  Scale,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getIntlLocale } from '@/shared/lib/locale';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { NutritionGrid } from '../NutritionStats/NutritionGrid';
import { Label } from '@/shared/ui/Label';
import { FoodItemRow } from './FoodItemRow';
import { CopyMealSheet, type CopyMealResult } from './CopyMealSheet';
import {
  NutritionEditGrid,
  type NutritionValues,
} from '@/shared/ui/NutritionEditGrid';
import { useTheme } from '@/shared/context/ThemeContext';
import type { FoodLog, FoodItem } from '@/shared/types/api/food';
import { useTelegram } from '@/shared/hooks/useTelegram';
import { cn } from '@/shared/lib/cn';
import { round1 } from '@/features/home/lib/nutrition';

interface EditableItem {
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

function toEditable(item: FoodItem): EditableItem {
  return {
    food_name: item.food_name,
    portion_g: item.portion_g,
    calories: item.calories,
    protein_g: item.protein_g,
    fat_g: item.fat_g,
    carbs_g: item.carbs_g,
    fiber_g: item.fiber_g,
    sugar_g: item.sugar_g,
    water_ml: item.water_ml,
  };
}

function itemToNutrition(item: EditableItem): NutritionValues {
  return {
    portion_g: item.portion_g,
    calories: item.calories,
    protein_g: item.protein_g,
    fat_g: item.fat_g,
    carbs_g: item.carbs_g,
    fiber_g: item.fiber_g,
    sugar_g: item.sugar_g,
    water_ml: item.water_ml,
  };
}

function nutritionToItem(name: string, v: NutritionValues): EditableItem {
  return {
    food_name: name,
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

export interface FoodLogModalProps {
  log: FoodLog;
  isDeleting: boolean;
  isRepeating?: boolean;
  isEditing?: boolean;
  onClose: () => void;
  onDelete: (logId: number) => void;
  onCopy: (result: CopyMealResult) => void;
  onEdit: (logId: number, items: EditableItem[]) => void;
}

export const FoodLogModal = ({
  log,
  isDeleting,
  isRepeating = false,
  isEditing = false,
  onClose,
  onDelete,
  onCopy,
  onEdit,
}: FoodLogModalProps) => {
  const theme = useTheme();
  const { safeTop } = useTelegram();
  const { t, i18n } = useTranslation('home_page');
  const { t: tc } = useTranslation('common');

  const [editMode, setEditMode] = useState(false);
  const [copyMode, setCopyMode] = useState(false);

  const [editItems, setEditItems] = useState<EditableItem[]>([]);
  const [baseItems, setBaseItems] = useState<NutritionValues[]>([]);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const formattedTime = new Date(log.logged_at).toLocaleTimeString(
    getIntlLocale(i18n.language),
    { hour: '2-digit', minute: '2-digit' },
  );

  const portion_g = log.items.reduce((s, i) => s + i.portion_g, 0);
  const isSingleIngredient = log.items.length === 1;
  const displayName = log.meal_name ?? log.items[0]?.food_name ?? t('food');
  const cleanDish = displayName.trim();
  const lastSpaceIndex = cleanDish.lastIndexOf(' ');
  const textBeforeLastWord =
    lastSpaceIndex === -1 ? '' : cleanDish.substring(0, lastSpaceIndex);
  const lastWord =
    lastSpaceIndex === -1 ? cleanDish : cleanDish.substring(lastSpaceIndex + 1);

  const isProcessing = isDeleting || isEditing || isRepeating;

  const enterEditMode = () => {
    const items = log.items.map(toEditable);
    setEditItems(items);
    setBaseItems(items.map(itemToNutrition));
    setSyncEnabled(false);
    setEditMode(true);
  };

  const exitEditMode = () => {
    setEditMode(false);
  };

  const updateItemName = (index: number, name: string) =>
    setEditItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, food_name: name } : item,
      ),
    );

  const updateItemNutrition = useCallback(
    (index: number, values: NutritionValues) =>
      setEditItems((prev) =>
        prev.map((item, i) =>
          i === index ? nutritionToItem(item.food_name, values) : item,
        ),
      ),
    [],
  );

  const removeItem = (index: number) =>
    setEditItems((prev) => prev.filter((_, i) => i !== index));

  const editTotals = useMemo(
    () =>
      editItems.reduce(
        (acc, d) => ({
          total_calories: acc.total_calories + d.calories,
          total_protein_g: round1(acc.total_protein_g + d.protein_g),
          total_fat_g: round1(acc.total_fat_g + d.fat_g),
          total_carbs_g: round1(acc.total_carbs_g + d.carbs_g),
          total_fiber_g: round1(acc.total_fiber_g + d.fiber_g),
          total_sugar_g: round1(acc.total_sugar_g + d.sugar_g),
          total_water_ml: acc.total_water_ml + d.water_ml,
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
    [editItems],
  );

  const handleSaveEdit = () => {
    if (editItems.length === 0) return;
    onEdit(log.id, editItems);
  };

  const handleCopyText = async () => {
    await navigator.clipboard.writeText(displayName);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (copyMode) {
    return (
      <CopyMealSheet
        log={log}
        isProcessing={isRepeating}
        onConfirm={onCopy}
        onClose={() => setCopyMode(false)}
      />
    );
  }

  if (editMode) {
    return (
      <BottomSheet
        title={t('edit_meal', { defaultValue: 'Редактирование' })}
        onClose={exitEditMode}
        actionLabel={tc('buttons.save', { defaultValue: 'Сохранить' })}
        iconCustomEmojiId="5274008024585871702"
        onAction={handleSaveEdit}
        isProcessing={isEditing}
        actionDisabled={editItems.length === 0}
        secondaryAction={{
          text: tc('buttons.cancel', { defaultValue: 'Отменить' }),
          iconCustomEmojiId: '5260342697075416641',
          onClick: exitEditMode,
          position: 'left',
        }}
      >
        <div className="flex flex-col gap-2.5">
          {editItems.map((item, i) => (
            <div
              key={i}
              className="flex flex-col gap-2.5 rounded-2xl p-3"
              style={{ backgroundColor: theme.section_bg_color }}
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={item.food_name}
                  onChange={(e) => updateItemName(i, e.target.value)}
                  className="min-w-0 flex-1 rounded-xl px-3 py-2 text-sm font-semibold outline-none"
                  style={{
                    backgroundColor: theme.secondary_bg_color,
                    color: theme.text_color,
                  }}
                />
                {editItems.length > 1 && (
                  <button
                    onClick={() => removeItem(i)}
                    aria-label={tc('buttons.delete', {
                      defaultValue: 'Удалить',
                    })}
                    className="shrink-0 rounded-lg p-2 transition-opacity active:opacity-60"
                    style={{ color: theme.destructive_text_color }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <NutritionEditGrid
                values={itemToNutrition(item)}
                baseValues={baseItems[i] ?? itemToNutrition(item)}
                syncEnabled={syncEnabled}
                onSyncToggle={() => setSyncEnabled((prev) => !prev)}
                onChange={(v) => updateItemNutrition(i, v)}
              />
            </div>
          ))}

          <NutritionGrid data={editTotals} />
        </div>
      </BottomSheet>
    );
  }

  return (
    <>
      <BottomSheet
        onClose={onClose}
        actionLabel={tc('buttons.copy')}
        iconCustomEmojiId="5258477770735885832"
        onAction={() => setCopyMode(true)}
        isProcessing={isRepeating}
        secondaryAction={{
          text: tc('buttons.delete'),
          iconCustomEmojiId: '5258130763148172425',
          textColor: theme.destructive_text_color,
          onClick: () => onDelete(log.id),
          isProcessing: isDeleting,
          position: 'left',
        }}
      >
        <div className="flex flex-col gap-3 pb-1">
          <div
            className={cn(
              'flex flex-col',
              isSingleIngredient ? 'gap-1' : 'gap-2',
            )}
          >
            {log.photo_url ? (
              <img
                src={log.photo_url}
                alt={displayName}
                className="aspect-square w-full rounded-2xl object-cover"
              />
            ) : (
              <div
                className="flex aspect-2/1 w-full items-center justify-center rounded-2xl"
                style={{ backgroundColor: theme.section_bg_color }}
              >
                <UtensilsCrossed
                  size={36}
                  style={{ color: theme.hint_color }}
                />
              </div>
            )}

            <div className="flex flex-col gap-0.5 px-1">
              <p
                className="text-lg font-bold"
                style={{ color: theme.text_color }}
              >
                {textBeforeLastWord && `${textBeforeLastWord} `}
                <span className="whitespace-nowrap">
                  {lastWord}
                  <button
                    onClick={handleCopyText}
                    aria-label={tc('buttons.copy')}
                    className="ml-1 inline-flex items-center justify-center rounded-xl p-1 align-middle transition-opacity hover:opacity-75"
                  >
                    <Copy size={16} />
                  </button>
                </span>
              </p>

              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  <Label
                    icon={<Scale size={12} />}
                    text={`${portion_g} ${tc('units.g')}`}
                  />
                  <Label icon={<Clock size={12} />} text={formattedTime} />
                </div>

                <button
                  onClick={enterEditMode}
                  disabled={isProcessing}
                  aria-label={t('edit_meal', { defaultValue: 'Редактировать' })}
                  className="flex items-center gap-1 rounded-full px-1.25 py-1.5 text-xs font-medium transition-opacity active:opacity-60 disabled:opacity-40"
                  style={{
                    backgroundColor: `${theme.button_color}20`,
                    color: theme.button_color,
                  }}
                >
                  <Pencil size={14} />
                </button>
              </div>
            </div>
          </div>

          <NutritionGrid data={log} />

          {log.items.length > 1 && (
            <div className="flex flex-col gap-1">
              <div className="mx-1 flex items-end justify-between">
                <span
                  className="text-sm font-medium tracking-wider"
                  style={{ color: theme.text_color }}
                >
                  {t('compound')}
                </span>
                <span className="text-xs" style={{ color: theme.hint_color }}>
                  {t('products', { count: log.items.length })}
                </span>
              </div>
              <div
                className="flex flex-col rounded-2xl px-3"
                style={{ backgroundColor: theme.section_bg_color }}
              >
                {log.items.map((item, i) => (
                  <FoodItemRow
                    key={item.id}
                    item={item}
                    counter={i + 1}
                    isLast={i === log.items.length - 1}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </BottomSheet>

      <div
        className="pointer-events-none fixed inset-0 z-60 flex h-[20dvh] w-full justify-center px-4 pt-4"
        style={{ top: safeTop }}
      >
        <div
          className="h-12 w-full items-center rounded-2xl py-3 text-center text-base font-medium transition-opacity duration-300"
          style={{
            backgroundColor: theme.section_bg_color,
            opacity: isCopied ? 1 : 0,
            color: theme.text_color,
          }}
        >
          {tc('buttons.copied')}
        </div>
      </div>
    </>
  );
};
