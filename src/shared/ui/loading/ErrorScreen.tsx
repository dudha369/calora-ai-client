import type { ElementType } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import {
  WifiOff,
  RefreshCw,
  AlertTriangle,
  ShieldAlert,
  Lock,
  Wrench,
} from 'lucide-react';

export type ErrorType =
  | 'network'
  | 'general'
  | 'no_telegram'
  | 'access_denied'
  | 'maintenance';

const CONFIG: Record<ErrorType, { Icon: ElementType; showRetry: boolean }> = {
  network: {
    Icon: WifiOff,
    showRetry: true,
  },
  general: {
    Icon: AlertTriangle,
    showRetry: true,
  },
  no_telegram: {
    Icon: ShieldAlert,
    showRetry: false,
  },
  access_denied: {
    Icon: Lock,
    showRetry: false,
  },
  maintenance: {
    Icon: Wrench,
    showRetry: true,
  },
};

interface ErrorScreenProps {
  errorType: ErrorType;
  onRetry?: () => void;
  customMessage?: string;
}

export const ErrorScreen = ({
  errorType,
  onRetry,
  customMessage,
}: ErrorScreenProps) => {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const { Icon, showRetry } = CONFIG[errorType];

  return (
    <div
      className="fixed inset-0 z-999 flex flex-col items-center justify-center gap-5 backdrop-blur-sm"
      style={{ backgroundColor: `${theme.bg_color}D9` }}
    >
      <Icon
        className="animate-pulse"
        style={{
          color:
            errorType === 'maintenance'
              ? '#f59e0b'
              : theme.destructive_text_color,
        }}
        size={64}
      />

      <div className="px-6">
        <p
          className="text-center text-base font-medium tracking-widest uppercase"
          style={{ color: theme.text_color }}
        >
          {t(`errors.${errorType}.title`)}
        </p>

        <p
          className="mt-1 text-center text-sm font-medium"
          style={{ color: theme.hint_color }}
        >
          {errorType === 'no_telegram' ? (
            <Trans
              i18nKey="errors.no_telegram.subtitle"
              components={{
                telegramLink: (
                  <a
                    href="https://t.me/CaloraAIBot"
                    style={{ textDecoration: 'underline' }}
                  />
                ),
              }}
            />
          ) : customMessage ? (
            customMessage
          ) : (
            t(`errors.${errorType}.subtitle`)
          )}
        </p>
      </div>

      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 flex items-center gap-2 rounded-xl px-6 py-2.5 text-base leading-none font-medium transition-transform duration-300 active:scale-95"
          style={{
            backgroundColor: theme.button_color,
            color: theme.button_text_color,
          }}
        >
          <RefreshCw size={16} />
          {t('buttons.retry')}
        </button>
      )}
    </div>
  );
};
