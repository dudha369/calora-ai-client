import { Clock, ChevronRight, Droplets } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/context/ThemeContext';
import { getIntlLocale } from '@/shared/lib/locale';
import type { WaterLog } from '@/shared/types/api/water';
import { MARKER_WATER_COLOR } from '@/shared/constants/markers';

interface WaterLogCardProps {
  log: WaterLog;
  isDeleting: boolean;
  onClickRef: (log: WaterLog) => void;
}

export const WaterLogCard = ({
  log,
  isDeleting,
  onClickRef,
}: WaterLogCardProps) => {
  const theme = useTheme();
  const { t: tc, i18n } = useTranslation('common');

  const formattedTime = new Date(log.logged_at).toLocaleTimeString(
    getIntlLocale(i18n.language),
    {
      hour: '2-digit',
      minute: '2-digit',
    },
  );

  const onClick = () => {
    onClickRef(log);
  };

  const defaultWaterName = tc('nav.water');
  const displayName = log.source_label ?? defaultWaterName;

  return (
    <div
      key={log.id}
      onClick={onClick}
      className="flex w-full cursor-pointer items-center justify-between px-2 py-3 transition-opacity"
      style={{
        opacity: isDeleting ? 0.5 : 1,
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="size-10 rounded-full p-2">
          <Droplets size={24} style={{ color: MARKER_WATER_COLOR }} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <span
            className="truncate text-base font-medium"
            style={{ color: theme.text_color }}
          >
            {displayName}
          </span>

          <div
            className="flex items-center gap-0.5"
            style={{ color: theme.hint_color }}
          >
            <Clock size={12} />
            <span className="text-xs whitespace-nowrap">{formattedTime}</span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 pl-3">
        <span
          className="text-lg font-medium whitespace-nowrap"
          style={{ color: theme.text_color }}
        >
          <b>{log.amount_ml}</b> {tc('units.ml')}
        </span>

        <ChevronRight color={theme.hint_color} size={20} strokeWidth={2.5} />
      </div>
    </div>
  );
};
