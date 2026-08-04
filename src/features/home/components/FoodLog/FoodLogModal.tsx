import { useState, useRef, useCallback } from 'react';
import { Clock, Copy, Scale, Pencil, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getIntlLocale } from '@/shared/lib/locale';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { NutritionGrid } from '../NutritionGrid/NutritionGrid';
import { Label } from '@/shared/ui/Label';
import { FoodItemRow } from './FoodItemRow';
import { CopyMealSheetContent, type CopyMealResult } from './CopyMealSheet';
import { EditMealSheetContent } from './EditMealSheet';
import type { EditableItem } from '../../types/EditableItem';
import { useTheme } from '@/shared/context/ThemeContext';
import type { FoodLog } from '@/shared/types/api/food';
import { useTelegram } from '@/shared/hooks/useTelegram';
import { cn } from '@/shared/lib/cn';
import { MealImageOverlay } from '@/shared/ui/MealImageOverlay';
import { favorites } from '@/shared/api/favorites';
import { useQuery } from '@tanstack/react-query';

type Mode = 'view' | 'edit' | 'copy';

export interface FoodLogModalProps {
  log: FoodLog;
  isDeleting: boolean;
  isRepeating?: boolean;
  isEditing?: boolean;
  onClose: () => void;
  onDelete: (logId: number) => void;
  onCopy: (result: CopyMealResult) => void;
  onEdit: (logId: number, items: EditableItem[], removePhoto: boolean) => void;
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
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<Mode>('view');
  const [isCopied, setIsCopied] = useState(false);

  const editDataRef = useRef<{ items: EditableItem[]; removePhoto: boolean }>({
    items: log.items,
    removePhoto: false,
  });
  const copyDataRef = useRef<CopyMealResult>({
    items: log.items,
    includePhoto: !!log.photo_url,
  });

  const handleEditDataChange = useCallback(
    (items: EditableItem[], removePhoto: boolean) => {
      editDataRef.current = { items, removePhoto };
    },
    [],
  );

  const handleCopyDataChange = useCallback((result: CopyMealResult) => {
    copyDataRef.current = result;
  }, []);

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

  const handleCopyText = async () => {
    await navigator.clipboard.writeText(displayName);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const { data: existingFavorite } = useQuery({
    queryKey: ['favorites', 'by-log', log.id],
    queryFn: async () => (await favorites.getByLog(log.id)).data,
  });
  const isFavorited = !!existingFavorite;

  const { mutate: addFavorite, isPending: isAddingFavorite } = useMutation({
    mutationFn: () =>
      favorites.create({
        meal_name: displayName,
        source_log_id: log.id,
        items: log.items.map((i) => ({
          food_name: i.food_name,
          portion_g: i.portion_g,
          calories: i.calories,
          protein_g: i.protein_g,
          fat_g: i.fat_g,
          carbs_g: i.carbs_g,
          fiber_g: i.fiber_g,
          sugar_g: i.sugar_g,
          water_ml: i.water_ml,
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const { mutate: removeFavorite, isPending: isRemovingFavorite } = useMutation(
    {
      mutationFn: () => favorites.removeByLog(log.id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['favorites'] });
      },
    },
  );

  const isFavoritePending = isAddingFavorite || isRemovingFavorite;

  const handleDismissRequest = useCallback(() => {
    if (mode !== 'view') {
      setMode('view');
      return true;
    }
    return false;
  }, [mode]);

  const handleAction = () => {
    if (mode === 'view') {
      setMode('copy');
    } else if (mode === 'edit') {
      onEdit(
        log.id,
        editDataRef.current.items,
        editDataRef.current.removePhoto,
      );
    } else {
      onCopy(copyDataRef.current);
    }
  };

  const title =
    mode === 'edit'
      ? t('edit_meal')
      : mode === 'copy'
        ? t('copy_meal')
        : undefined;

  const actionLabel = mode === 'edit' ? tc('buttons.save') : tc('buttons.copy');

  const actionIconCustomEmojiId =
    mode === 'edit' ? '5258336354642697821' : '5258477770735885832';

  const actionIsProcessing = mode === 'edit' ? isEditing : isRepeating;

  const secondaryAction =
    mode === 'view'
      ? {
          text: tc('buttons.delete'),
          iconCustomEmojiId: '5258130763148172425',
          textColor: theme.destructive_text_color,
          onClick: () => onDelete(log.id),
          isProcessing: isDeleting,
          position: 'left' as const,
        }
      : {
          text: tc('buttons.cancel'),
          iconCustomEmojiId: '5260342697075416641',
          onClick: () => setMode('view'),
          position: 'left' as const,
        };

  return (
    <>
      <BottomSheet
        onClose={onClose}
        onDismissRequest={handleDismissRequest}
        title={title}
        dragToClose={mode === 'view'}
        actionLabel={actionLabel}
        iconCustomEmojiId={actionIconCustomEmojiId}
        onAction={handleAction}
        isProcessing={actionIsProcessing}
        secondaryAction={secondaryAction}
      >
        {mode === 'view' && (
          <div className="flex flex-col gap-3 pb-1">
            <div
              className={cn(
                'flex flex-col',
                isSingleIngredient ? 'gap-1' : 'gap-2',
              )}
            >
              <MealImageOverlay
                photo_url={log.photo_url}
                displayName={displayName}
                button={{ onClick: () => setMode('edit'), icon: Pencil }}
              />

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

                <div className="flex items-center gap-1.5">
                  <Label
                    icon={<Scale size={12} />}
                    text={`${portion_g} ${tc('units.g')}`}
                  />
                  <Label icon={<Clock size={12} />} text={formattedTime} />

                  <button
                    onClick={() =>
                      isFavorited ? removeFavorite() : addFavorite()
                    }
                    disabled={isFavoritePending}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-opacity active:opacity-70 disabled:opacity-70"
                    style={{
                      backgroundColor: theme.section_bg_color,
                      color: isFavorited ? theme.link_color : theme.text_color,
                    }}
                  >
                    <Star
                      size={12}
                      fill={isFavorited ? theme.link_color : 'none'}
                    />
                    <span>
                      {isFavorited
                        ? t('added_to_favorites')
                        : t('add_to_favorites')}
                    </span>
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
        )}

        {mode === 'edit' && (
          <EditMealSheetContent log={log} onDataChange={handleEditDataChange} />
        )}

        {mode === 'copy' && (
          <CopyMealSheetContent log={log} onDataChange={handleCopyDataChange} />
        )}
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
