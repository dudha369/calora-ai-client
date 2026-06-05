import {useTelegram} from "../../hooks/useTelegram.ts";
import { WifiOff, RefreshCw } from "lucide-react";

interface ErrorScreenProps {
  onRetry: () => void;
}

export const ErrorScreen = ({ onRetry }: ErrorScreenProps) => {
  const { theme } = useTelegram();

  return (
    <div
      className="fixed inset-0 z-999 backdrop-blur-sm flex flex-col items-center justify-center gap-5"
      style={{ backgroundColor: `${theme.bg_color}D9` }}
    >
      <WifiOff
        className="animate-pulse"
        style={{ color: theme.destructive_text_color }}
        size={64}
      />

      <div>
        <p
          className="text-base font-medium tracking-widest uppercase text-center"
          style={{ color: theme.text_color }}
        >
          Ошибка подключения
        </p>
        <p
          className="text-sm font-medium text-center"
          style={{ color: theme.hint_color }}
        >
          Проверьте интернет-соединение
        </p>
      </div>

      <button
        onClick={onRetry}
        className="flex items-center gap-2 mt-4 px-6 py-2.5 rounded-xl text-sm font-medium transition-transform active:scale-95"
        style={{
          backgroundColor: theme.button_color,
          color: theme.button_text_color,
        }}
      >
        <RefreshCw size={16} />
        Повторить
      </button>
    </div>
  );
};
