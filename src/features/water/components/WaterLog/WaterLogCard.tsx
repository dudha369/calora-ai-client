import { Clock, ChevronRight, Droplets, Link, StickyNote } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/context/ThemeContext';
import { getIntlLocale } from '@/shared/lib/locale';
import type { WaterLog } from '@/shared/types/api/water';
import { MARKER_WATER_COLOR } from '@/shared/constants/markers';
import { useMemo } from 'react';

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

  const formattedTime = useMemo(() => {
    return new Date(log.logged_at).toLocaleTimeString(
      getIntlLocale(i18n.language),
      {
        hour: '2-digit',
        minute: '2-digit',
      },
    );
  }, [log.logged_at, i18n.language]);

  const defaultWaterName = tc('nav.water');
  const displayName =
    log.linked_food_log?.meal_name ??
    log.linked_food_log?.first_item_name ??
    defaultWaterName;

  return (
    <button
      type="button"
      key={log.id}
      onClick={() => onClickRef(log)}
      className="flex w-full cursor-pointer items-center justify-between px-2 py-3 text-left transition-opacity"
      style={{
        opacity: isDeleting ? 0.5 : 1,
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="size-10 shrink-0 rounded-full p-2">
          <Droplets size={24} style={{ color: MARKER_WATER_COLOR }} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <span
            className="truncate text-base font-medium"
            style={{ color: theme.text_color }}
          >
            {displayName}
          </span>

          <div className="flex h-4 items-center">
            <div
              className="flex items-center gap-1"
              style={{ color: theme.hint_color }}
            >
              <Clock size={12} />
              <span className="text-xs leading-none whitespace-nowrap">
                {formattedTime}
              </span>
            </div>

            {(log.linked_food_log || log.notes) && (
              <>
                <div
                  className="mx-2 h-3 shrink-0 opacity-40"
                  style={{
                    width: '1.5px',
                    backgroundColor: theme.hint_color,
                  }}
                />

                <div className="flex items-center gap-1.5">
                  {log.linked_food_log && (
                    <Link size={11} style={{ color: theme.link_color }} />
                  )}
                  {log.notes && (
                    <StickyNote
                      size={11}
                      style={{ color: theme.accent_text_color }}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 pl-3">
        <span
          className="text-lg font-medium whitespace-nowrap"
          style={{ color: theme.text_color }}
        >
          <b>{log.amount_ml}</b>{' '}
          <span className="text-sm font-normal">{tc('units.ml')}</span>
        </span>

        <ChevronRight color={theme.hint_color} size={20} strokeWidth={2.5} />
      </div>
    </button>
  );
};
