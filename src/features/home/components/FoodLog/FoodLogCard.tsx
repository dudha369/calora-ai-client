import { Clock, UtensilsCrossed, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/context/ThemeContext';
import { getIntlLocale } from '@/shared/lib/locale';
import type { FoodLog } from '@/shared/types/api/food';

interface FoodLogCardProps {
  log: FoodLog;
  isDeleting: boolean;
  onClickRef: (log: FoodLog) => void;
}

export const FoodLogCard = ({
  log,
  isDeleting,
  onClickRef,
}: FoodLogCardProps) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation('home_page');
  const { t: tc } = useTranslation('common');

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

  const defaultFoodName = t('food');
  const displayName =
    log.meal_name ?? log.items[0]?.food_name ?? defaultFoodName;

  return (
    <div
      className="flex h-20 w-full cursor-pointer justify-between rounded-2xl p-3 pr-2 transition-opacity"
      style={{
        backgroundColor: theme.section_bg_color,
        opacity: isDeleting ? 0.5 : 1,
      }}
      onClick={onClick}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl">
          {log.photo_url ? (
            <img
              src={log.photo_url}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <UtensilsCrossed size={22} style={{ color: theme.hint_color }} />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span
            title={displayName}
            className="truncate text-[16px] font-semibold"
            style={{ color: theme.text_color }}
          >
            {displayName}
          </span>

          <div className="text-xs">
            {log.items.length > 1 ? (
              <span style={{ color: theme.accent_text_color }}>
                {t('more_dishes', { count: log.items.length - 1 })}
              </span>
            ) : (
              <div
                className="flex items-center gap-0.5"
                style={{ color: theme.hint_color }}
              >
                <Clock size={12} />
                <span className="whitespace-nowrap">{formattedTime}</span>

                <b> · </b>

                <span className="whitespace-nowrap">
                  {log.items[0]?.portion_g} {tc('units.g')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 pl-2">
        <div className="flex flex-col items-end">
          <span
            className="text-lg font-bold whitespace-nowrap tabular-nums"
            style={{ color: theme.text_color }}
          >
            {log.total_calories} {tc('units.kcal')}
          </span>
          <span
            className="text-xs font-medium whitespace-nowrap"
            style={{ color: theme.hint_color }}
          >
            {t('macros', {
              p: Math.round(log.total_protein_g),
              f: Math.round(log.total_fat_g),
              c: Math.round(log.total_carbs_g),
            })}
          </span>
        </div>

        <ChevronRight color={theme.hint_color} size={20} strokeWidth={2.5} />
      </div>
    </div>
  );
};
