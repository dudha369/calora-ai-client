import type { ElementType, ReactNode } from "react";
import { useTheme } from '../../context/ThemeContext';
import { WifiOff, RefreshCw, AlertTriangle, ShieldAlert, Lock } from "lucide-react";

/**
 * errorType values:
 *  - "network"       — no internet / chunk load failed
 *  - "general"       — unexpected runtime error
 *  - "no_telegram"   — opened outside Telegram (401 / no initData)
 *  - "access_denied" — user is not on the whitelist (403)
 */
export type ErrorType = "network" | "general" | "no_telegram" | "access_denied";

interface ErrorScreenProps {
  errorType: ErrorType;
  onRetry?: () => void;
}

const CONFIG: Record<
  ErrorType,
  { Icon: ElementType; title: string; subtitle: ReactNode; showRetry: boolean }
> = {
  network: {
    Icon: WifiOff,
    title: "Ошибка подключения",
    subtitle: "Проверьте интернет-соединение",
    showRetry: true,
  },
  general: {
    Icon: AlertTriangle,
    title: "Непредвиденная ошибка",
    subtitle: "Что-то пошло не так. Попробуйте еще раз.",
    showRetry: true,
  },
  no_telegram: {
    Icon: ShieldAlert,
    title: "Ошибка аутентификации",
    subtitle: (
      <>
        Откройте приложение через
        <a href="https://t.me/CaloraAIBot" style={{ textDecoration: "underline" }}> Telegram</a>
      </>
    ),
    showRetry: false,
  },
  access_denied: {
    Icon: Lock,
    title: "Нет доступа",
    subtitle: "У вас нет доступа к этому приложению",
    showRetry: false,
  },
};

export const ErrorScreen = ({ errorType, onRetry }: ErrorScreenProps) => {
  const theme = useTheme();
  const { Icon, title, subtitle, showRetry } = CONFIG[errorType];

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

      {showRetry && onRetry && (
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
      )}
    </div>
  );
};
