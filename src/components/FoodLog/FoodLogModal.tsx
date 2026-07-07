import { Clock, UtensilsCrossed, Copy, Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getIntlLocale } from '../../utils/locale.ts';
import { BottomSheet } from '../BottomSheet.tsx';
import { NutritionGrid } from '../NutritionStats/NutritionGrid';
import { Label } from '../Label';
import { FoodItemRow } from './FoodItemRow';
import { useTheme } from '../../context/ThemeContext';
import type { FoodLog } from '../../interfaces/api/food';
import { useState } from 'react';
import { useTelegram } from '../../hooks/useTelegram.ts';

interface FoodLogModalProps {
  log: FoodLog;
  isDeleting: boolean;
  isRepeating: boolean;
  onClose: () => void;
  onDelete: (logId: number) => void;
  onRepeat: (log: FoodLog) => void;
}

export const FoodLogModal = ({
  log,
  isDeleting,
  isRepeating,
  onClose,
  onDelete,
  onRepeat,
}: FoodLogModalProps) => {
  const theme = useTheme();
  const { safeTop } = useTelegram();
  const { t, i18n } = useTranslation('home_page');
  const { t: tc } = useTranslation('common');

  const formattedTime = new Date(log.logged_at).toLocaleTimeString(
    getIntlLocale(i18n.language),
    {
      hour: '2-digit',
      minute: '2-digit',
    },
  );

  const portion_g = log.items.reduce(
    (sum, current) => sum + current.portion_g,
    0,
  );

  const [isCopied, setIsCopied] = useState(false);

  const mainDish = log.items[0]?.food_name ?? t('food');

  const cleanDish = mainDish.trim();
  const lastSpaceIndex = cleanDish.lastIndexOf(' ');
  const textBeforeLastWord =
    lastSpaceIndex === -1 ? '' : cleanDish.substring(0, lastSpaceIndex);
  const lastWord =
    lastSpaceIndex === -1 ? cleanDish : cleanDish.substring(lastSpaceIndex + 1);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(mainDish);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <>
      <BottomSheet
        onClose={onClose}
        actionLabel={tc('buttons.copy')}
        iconCustomEmojiId="5258477770735885832"
        onAction={() => onRepeat(log)}
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
          {log.photo_url ? (
            <img
              src={log.photo_url}
              alt={mainDish}
              className="aspect-square w-full rounded-2xl object-cover"
            />
          ) : (
            <div
              className="flex aspect-2/1 w-full items-center justify-center rounded-2xl"
              style={{ backgroundColor: theme.section_bg_color }}
            >
              <UtensilsCrossed size={36} style={{ color: theme.hint_color }} />
            </div>
          )}

          <div className="flex flex-col gap-0.5 px-1">
            {log.items.length === 1 && (
              <p
                className="text-lg font-bold"
                style={{ color: theme.text_color }}
              >
                {textBeforeLastWord && `${textBeforeLastWord} `}
                <span className="whitespace-nowrap">
                  {lastWord}
                  <button
                    onClick={handleCopy}
                    aria-label={tc('buttons.copy')}
                    className="ml-1 inline-flex items-center justify-center rounded-xl p-1 align-middle transition-opacity hover:opacity-75"
                  >
                    <Copy size={16} />
                  </button>
                </span>
              </p>
            )}
            <div className="flex gap-1.5">
              <Label
                icon={<Scale size={12} />}
                text={`${portion_g} ${tc('units.g')}`}
              />
              <Label icon={<Clock size={12} />} text={formattedTime} />
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
