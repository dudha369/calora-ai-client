import { Clock, Trash2, UtensilsCrossed } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { FoodItemRow } from "./FoodItemRow";
import type { FoodLog } from "../../interfaces/api/food";

interface Props {
  log: FoodLog;
  onDelete: (logId: number) => void;
  /** true, если именно эта запись сейчас удаляется (для затемнения/disabled) */
  isDeleting: boolean;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const FoodLogCard = ({ log, onDelete, isDeleting }: Props) => {
  const theme = useTheme();

  return (
    <div
      className="rounded-2xl p-3 flex flex-col gap-2 transition-opacity"
      style={{
        backgroundColor: theme.section_bg_color,
        border: `1px solid ${theme.section_separator_color}`,
        opacity: isDeleting ? 0.5 : 1,
      }}
    >
      {/* Заголовок: фото + время + общий итог + удаление */}
      <div className="flex items-center gap-3">
        <div
          className="size-14 rounded-xl flex items-center justify-center overflow-hidden shrink-0"
          style={{ backgroundColor: theme.secondary_bg_color }}
        >
          {log.photo_url ? (
            <img
              src={log.photo_url}
              alt={log.items[0]?.food_name ?? "Еда"}
              className="w-full h-full object-cover"
            />
          ) : (
            <UtensilsCrossed size={22} style={{ color: theme.hint_color }} />
          )}
        </div>

        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <div className="flex items-center gap-1" style={{ color: theme.hint_color }}>
            <Clock size={12} />
            <span className="text-xs">{formatTime(log.logged_at)}</span>
          </div>
          <p className="text-base font-bold tabular-nums" style={{ color: theme.text_color }}>
            {log.total_calories} ккал
          </p>
          <p className="text-xs" style={{ color: theme.hint_color }}>
            Б {log.total_protein_g} · Ж {log.total_fat_g} · У {log.total_carbs_g}
          </p>
        </div>

        <button
          onClick={() => onDelete(log.id)}
          disabled={isDeleting}
          aria-label="Удалить запись"
          className="p-2 rounded-xl transition-opacity active:opacity-60 shrink-0 disabled:opacity-40"
          style={{ color: theme.destructive_text_color }}
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Блюда внутри записи */}
      {log.items.length > 0 && (
        <div className="flex flex-col px-1">
          {log.items.map((item, i) => (
            <FoodItemRow key={item.id} item={item} isLast={i === log.items.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
};
