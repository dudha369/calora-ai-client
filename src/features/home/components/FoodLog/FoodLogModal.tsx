import { useState, useRef, useCallback } from 'react';
import { Clock, UtensilsCrossed, Copy, Scale, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getIntlLocale } from '@/shared/lib/locale';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { NutritionGrid } from '../NutritionStats/NutritionGrid';
import { Label } from '@/shared/ui/Label';
import { FoodItemRow } from './FoodItemRow';
import { CopyMealSheetContent, type CopyMealResult } from './CopyMealSheet';
import { EditMealSheetContent, type EditableItem } from './EditMealSheet';
import { useTheme } from '@/shared/context/ThemeContext';
import type { FoodLog } from '@/shared/types/api/food';
import { useTelegram } from '@/shared/hooks/useTelegram';
import { cn } from '@/shared/lib/cn';

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

  // Раньше edit/copy были отдельными <BottomSheet> — переключение между
  // ними гоняло полную анимацию закрытия+открытия и выглядело дёргано.
  // Теперь один смонтированный BottomSheet, контент внутри подменяется
  // мгновенно, без анимации.
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

  const isProcessing = isDeleting || isEditing || isRepeating;

  const handleCopyText = async () => {
    await navigator.clipboard.writeText(displayName);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Back-кнопка / backdrop / drag внутри edit/copy — просто мгновенный
  // возврат в 'view', без анимации закрытия всего модала.
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
              {log.photo_url ? (
                <div className="@container w-full">
                  <img
                    src={log.photo_url}
                    alt={displayName}
                    className="h-auto max-h-[100cqw] w-full rounded-2xl object-cover"
                  />
                </div>
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
                    onClick={() => setMode('edit')}
                    disabled={isProcessing}
                    aria-label={t('edit_meal')}
                    className="rounded-full p-1 transition-opacity hover:opacity-80 active:opacity-60 disabled:opacity-40"
                    style={{
                      color: theme.hint_color,
                    }}
                  >
                    <Pencil size={16} />
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
