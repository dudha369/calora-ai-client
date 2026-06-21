import { Clock, Trash2, UtensilsCrossed } from 'lucide-react';
import { ModalWindow } from '../ModalWindow.tsx';
import { NutritionTable, type NutritionRow } from '../NutritionTable';
import { FoodItemRow } from './FoodItemRow';
import { useTheme } from '../../context/ThemeContext';
import type { FoodLog } from '../../interfaces/api/food';

interface FoodLogModalProps {
  log?: FoodLog;
  isDeleting: boolean;
  isRepeating: boolean;
  onClose: () => void;
  onDelete: (logId: number) => void;
  onRepeat: (log: FoodLog) => void;
}

const fmt = (n: number) => n.toFixed(1).replace(/\.0$/, '');

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
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

  if (!log) return null;

  const mainDish = log.items[0]?.food_name ?? 'Еда';

  const totalRows: NutritionRow[] = [
    { label: 'Калории', value: `${log.total_calories} ккал`, primary: true },
    { label: 'Белки', value: `${fmt(log.total_protein_g)} г` },
    { label: 'Жиры', value: `${fmt(log.total_fat_g)} г` },
    { label: 'Углеводы', value: `${fmt(log.total_carbs_g)} г` },
    ...(log.total_fiber_g > 0
      ? [{ label: 'Клетчатка', value: `${fmt(log.total_fiber_g)} г` }]
      : []),
    ...(log.total_sugar_g > 0
      ? [{ label: 'Сахар', value: `${fmt(log.total_sugar_g)} г` }]
      : []),
  ];

  return (
    <ModalWindow
      onClose={onClose}
      cancelLabel="Закрыть"
      actionLabel={isRepeating ? 'Копирую…' : 'Скопировать'}
      iconCustomEmojiId="5258477770735885832"
      onAction={() => onRepeat(log)}
      isProcessing={isRepeating}
      actionDisabled={isDeleting}
    >
      <div className="flex flex-col gap-3">
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
          <p className="text-lg font-bold" style={{ color: theme.text_color }}>
            {log.items.length === 1 && mainDish}
          </p>
          <div
            className="flex items-center gap-1 text-xs"
            style={{ color: theme.hint_color }}
          >
            <Clock size={12} />
            <span>{formatTime(log.logged_at)}</span>
          </div>
        </div>

        <NutritionTable rows={totalRows} />

        {log.items.length > 1 && (
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
        )}

        <button
          onClick={() => onDelete(log.id)}
          disabled={isDeleting || isRepeating}
          className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-opacity active:opacity-70 disabled:opacity-50"
          style={{
            backgroundColor: `${theme.destructive_text_color}15`,
            color: theme.destructive_text_color,
          }}
        >
          <Trash2 size={16} />
          {isDeleting ? 'Удаляю…' : 'Удалить запись'}
        </button>
      </div>
    </ModalWindow>
  );
};
