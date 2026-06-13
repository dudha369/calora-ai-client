import { Sprout } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { FoodLogCard } from "./FoodLogCard";
import type { FoodLog } from "../../interfaces/api/food";

interface Props {
  logs: FoodLog[] | undefined;
  isLoading: boolean;
  /** id записи, которая сейчас удаляется (или null) */
  deletingId: number | null;
  onDelete: (logId: number) => void;
}

const CardSkeleton = () => {
  const theme = useTheme();
  return (
    <div
      className="rounded-2xl h-24 animate-pulse"
      style={{ backgroundColor: theme.secondary_bg_color }}
    />
  );
};

export const FoodLogList = ({ logs, isLoading, deletingId, onDelete }: Props) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div
        className="rounded-2xl p-6 flex flex-col items-center gap-2 text-center"
        style={{ backgroundColor: theme.section_bg_color, color: theme.hint_color }}
      >
        <Sprout size={28} />
        <p className="text-sm">Пока нет записей за этот день</p>
        <p className="text-xs">Добавь фото еды через сканер 📸</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {logs.map((log) => (
        <FoodLogCard
          key={log.id}
          log={log}
          isDeleting={deletingId === log.id}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
