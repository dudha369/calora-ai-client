import { useTelegram } from "../../hooks/useTelegram.ts";
import { WifiOff, RefreshCw, AlertTriangle } from "lucide-react";

interface ErrorScreenProps {
  onRetry: () => void;
  isNetworkError: boolean;
}

export const ErrorScreen = ({ onRetry, isNetworkError }: ErrorScreenProps) => {
  const { theme } = useTelegram();

  const Icon = isNetworkError ? WifiOff : AlertTriangle;
  const title = isNetworkError ? "Ошибка подключения" : "Непредвиденная ошибка";
  const subtitle = isNetworkError
    ? "Проверьте интернет-соединение"
    : "Что-то пошло не так. Попробуйте еще раз.";

  return (
    <div
      className="fixed inset-0 z-999 backdrop-blur-sm flex flex-col items-center justify-center gap-5"
      style={{ backgroundColor: `${theme.bg_color}D9` }}
    >
      <Icon
        className="animate-pulse"
        style={{ color: theme.destructive_text_color }}
        size={64}
      />

      <div>
        <p
          className="text-base font-medium tracking-widest uppercase text-center"
          style={{ color: theme.text_color }}
        >
          {title}
        </p>
        <p
          className="text-sm font-medium text-center"
          style={{ color: theme.hint_color }}
        >
          {subtitle}
        </p>
      </div>

      <button
        onClick={onRetry}
        className="flex items-center gap-2 mt-6 px-6 py-2.5 rounded-xl text-base leading-none font-medium transition-transform duration-300 active:scale-95"
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
