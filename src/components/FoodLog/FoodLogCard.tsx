import { Clock, UtensilsCrossed } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { pluralizeDishes } from '../../utils/pluralize';
import type { FoodLog } from '../../interfaces/api/food';

interface FoodLogCardProps {
  log: FoodLog;
  isDeleting: boolean;
  onClickRef: (log: FoodLog) => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRemainingDishes(totalCount: number): string {
  const count = totalCount - 1;
  return `+ ещё ${count} ${pluralizeDishes(count)}`;
}

export const FoodLogCard = ({
  log,
  isDeleting,
  onClickRef,
}: FoodLogCardProps) => {
  const theme = useTheme();

  const onClick = () => {
    onClickRef(log);
  };

  return (
    <div
      className="flex h-20 w-full items-center gap-3 rounded-2xl p-3 transition-opacity"
      style={{
        backgroundColor: theme.section_bg_color,
        opacity: isDeleting ? 0.5 : 1,
      }}
      onClick={onClick}
    >
      <div
        className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl"
        style={{ backgroundColor: theme.secondary_bg_color }}
      >
        {log.photo_url ? (
          <img
            src={log.photo_url}
            alt={log.items[0]?.food_name ?? 'Еда'}
            className="h-full w-full object-cover"
          />
        ) : (
          <UtensilsCrossed size={22} style={{ color: theme.hint_color }} />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p
          className="truncate text-[16px] font-semibold"
          style={{ color: theme.text_color }}
        >
          {log.items[0]?.food_name ?? 'Еда'}
        </p>

        <div className="text-xs">
          {log.items.length > 1 ? (
            <span style={{ color: theme.button_color }}>
              {formatRemainingDishes(log.items.length)}
            </span>
          ) : (
            <div
              className="flex items-center gap-0.5"
              style={{ color: theme.hint_color }}
            >
              <Clock size={12} />
              <span>{formatTime(log.logged_at)}</span>

              <span> · </span>

              <span>{log.items[0]?.portion_g} г</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end">
        <span
          className="text-lg font-extrabold tabular-nums"
          style={{ color: theme.text_color }}
        >
          {log.total_calories} ккал
        </span>
        <span
          className="text-xs font-medium"
          style={{ color: theme.hint_color }}
        >
          Б {Math.round(log.total_protein_g)} · Ж {Math.round(log.total_fat_g)}{' '}
          · У {Math.round(log.total_carbs_g)}
        </span>
      </div>
    </div>
  );
};
