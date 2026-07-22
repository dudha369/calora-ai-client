import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Flame, Check, Shield, X, Target } from 'lucide-react';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { useTheme } from '@/shared/context/ThemeContext';
import { users } from '@/shared/api/users';
import type { StreakInfo, GoalType } from '@/shared/types/api/streak';
import { useTranslation } from 'react-i18next';
import { capitalizeFirst, getIntlLocale } from '@/shared/lib/locale';
import { toApiDate } from '@/shared/lib/date';
import { Section } from './Section';
import { ProgressBar } from './ProgressBar';
import { Skeleton } from '@/shared/ui/Skeleton.tsx';
import { getFlameColor } from '@/features/home/lib/getFlameColor.ts';

interface StreakPopupProps {
  currentStreak: number;
  onClose: () => void;
}

const GOAL_TYPES: GoalType[] = ['lose', 'maintain', 'gain'];

function isGoalType(value: string | null | undefined): value is GoalType {
  return !!value && (GOAL_TYPES as string[]).includes(value);
}

export const StreakPopup = ({ currentStreak, onClose }: StreakPopupProps) => {
  const theme = useTheme();
  const { t } = useTranslation('home_page');
  const { t: tc, i18n } = useTranslation('common');
  const locale = getIntlLocale(i18n.language);

  const { data, isLoading } = useQuery<StreakInfo>({
    queryKey: ['streak'],
    queryFn: async () => (await users.getStreak()).data,
    staleTime: 10_000,
  });

  const streak = data?.current_streak ?? currentStreak;
  const streakExtended = data?.today_progress?.status === 'met';

  const rawGoalType = data?.goal_type ?? null;
  const goalType: GoalType = isGoalType(rawGoalType) ? rawGoalType : 'maintain';

  const streakGoalProgress = data?.today_progress?.calories_min
    ? Math.round(
        (data.today_progress.calories * 100) / data.today_progress.calories_min,
      )
    : 0;
  const flameColorProps = getFlameColor(
    streak,
    streakExtended,
    theme.hint_color,
  );

  const todayStr = useMemo(() => toApiDate(new Date()), []);
  const weekHistory = data?.week_history ?? [];

  return (
    <BottomSheet
      title={t(streakExtended ? 'streak_extended' : 'streak_pending')}
      onClose={onClose}
      actionLabel={streakExtended ? t('keep_it_up') : t('understood')}
      onAction={onClose}
    >
      <div className="flex flex-col gap-2.5">
        <Section>
          <div className="flex items-center gap-2">
            <Flame
              size={38}
              strokeWidth={2}
              color={flameColorProps.color}
              fill={flameColorProps.fill}
            />

            <div className="flex flex-col gap-1">
              <span
                className="text-sm leading-none"
                style={{ color: theme.hint_color }}
              >
                {t('current_streak')}
              </span>

              <span
                className="text-lg leading-none font-medium"
                style={{ color: theme.button_text_color }}
              >
                {streak} {t('days', { count: streak })}
              </span>
            </div>
          </div>

          <div
            className="my-4 h-0.5 w-full rounded-full"
            style={{ backgroundColor: theme.section_separator_color }}
          />

          {isLoading ? (
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Skeleton className="h-3 w-6" />
                  <Skeleton className="size-7.5 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {weekHistory.map((day) => {
                const isToday = day.date === todayStr;
                const isEffectiveStatus = day.status !== 'none';
                const isRestored = day.status === 'restored';

                let backgroundColor;
                let icon;
                if (day.status === 'met') {
                  backgroundColor = theme.button_color;
                  icon = (
                    <Check
                      strokeWidth={2.5}
                      size={18}
                      style={{ color: theme.button_text_color }}
                    />
                  );
                } else if (day.status === 'restored') {
                  backgroundColor = theme.button_color;
                  icon = (
                    <Shield
                      strokeWidth={2.5}
                      size={18}
                      style={{ color: theme.button_text_color }}
                    />
                  );
                } else if (day.status === 'missed') {
                  backgroundColor = theme.destructive_text_color;
                  icon = (
                    <X
                      strokeWidth={3}
                      size={18}
                      style={{ color: theme.button_text_color }}
                    />
                  );
                } else {
                  backgroundColor = 'transparent';
                }

                const label = capitalizeFirst(
                  new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
                    new Date(`${day.date}T12:00:00`),
                  ),
                );

                const tooltip = isRestored
                  ? t('streak.day_status.restored')
                  : day.status === 'met'
                    ? t('streak.day_status.met')
                    : undefined;

                return (
                  <div
                    key={day.date}
                    className="flex flex-col items-center gap-2"
                  >
                    <span
                      className="text-xs leading-none font-medium"
                      style={{
                        color: isToday ? theme.text_color : theme.hint_color,
                      }}
                    >
                      {label}
                    </span>

                    <div
                      title={tooltip}
                      className="flex size-7.5 shrink-0 items-center justify-center rounded-full"
                      style={{
                        backgroundColor,
                        outline:
                          isEffectiveStatus && isToday
                            ? 'none'
                            : `2px ${isToday ? 'dashed' : 'solid'} ${isEffectiveStatus || isToday ? theme.text_color : theme.hint_color}`,
                      }}
                    >
                      {isEffectiveStatus && icon}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {isLoading ? (
          <Skeleton className="h-19.25 w-full" />
        ) : data?.today_progress ? (
          <Section className="gap-1.5">
            <div className="flex">
              <span
                className="flex w-1/3 items-center justify-center text-3xl font-medium"
                style={{ color: theme.text_color }}
              >
                {streakGoalProgress}%
              </span>

              <div className="flex w-2/3 flex-col gap-px">
                <span className="text-sm" style={{ color: theme.text_color }}>
                  {streakExtended
                    ? t('daily_goal_completed')
                    : t('daily_goal_not_completed')}
                </span>
                <span className="text-xs" style={{ color: theme.hint_color }}>
                  {data.today_progress.calories} {t('out_of')}{' '}
                  {data.today_progress.calories_min} {tc('units.kcal')}
                </span>
              </div>
            </div>

            <ProgressBar p={data.today_progress} goalType={goalType} />
          </Section>
        ) : null}

        <Section>
          <div className="flex items-center gap-4">
            <Target
              size={40}
              className="shrink-0"
              style={{ color: theme.hint_color }}
            />

            <div className="flex flex-col gap-px">
              <span
                className="text-sm font-medium"
                style={{ color: theme.text_color }}
              >
                {t('daily_goal')} {t(`streak.goal_types.${goalType}`)}
              </span>
              <span className="text-xs" style={{ color: theme.hint_color }}>
                {t(`streak.goal_rules.${goalType}`)}
              </span>
            </div>
          </div>
        </Section>
      </div>
    </BottomSheet>
  );
};
