import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Flame, Check, Target } from 'lucide-react';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { useTheme } from '@/shared/context/ThemeContext';
import { users } from '@/shared/api/users';
import type { StreakInfo } from '@/shared/types/api/streak';
import { useTranslation } from 'react-i18next';
import { capitalizeFirst, getIntlLocale } from '@/shared/lib/locale';
import { Section } from './Section';
import { ProgressBar } from './ProgressBar';
import { Skeleton } from '@/shared/ui/Skeleton.tsx';
import { getFlameColor } from '@/features/home/lib/getFlameColor.ts';

interface StreakPopupProps {
  currentStreak: number;
  onClose: () => void;
}

export const StreakPopup = ({ currentStreak, onClose }: StreakPopupProps) => {
  const theme = useTheme();
  const { t } = useTranslation('home_page');
  const { t: tc, i18n } = useTranslation('common');
  const locale = getIntlLocale(i18n.language);
  const queryClient = useQueryClient();
  const [restoreError, setRestoreError] = useState<string | null>(null);
  if (restoreError) console.log(restoreError);

  const dayHeaders = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        capitalizeFirst(
          new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
            new Date(2024, 0, 1 + i),
          ),
        ),
      ),
    [locale],
  );

  const { data, isLoading } = useQuery<StreakInfo>({
    queryKey: ['streak'],
    queryFn: async () => (await users.getStreak()).data,
    staleTime: 10_000,
  });

  const streak = data?.current_streak ?? currentStreak;
  const streakExtended = data?.today_progress?.status === 'met';
  const daily_goalProgress = data?.today_progress?.calories_goal
    ? Math.round(
        (data.today_progress.calories * 100) /
          data.today_progress.calories_goal,
      )
    : 0;
  const flameColorProps = getFlameColor(
    streak,
    streakExtended,
    theme.hint_color,
  );

  const { mutate: doRestore, isPending: isRestoring } = useMutation({
    mutationFn: () => users.restoreStreak(),
    onSuccess: ({ data: res }) => {
      queryClient.setQueryData<StreakInfo>(['streak'], (old) =>
        old
          ? {
              ...old,
              current_streak: res.restored_to,
              can_restore: false,
              streak_restores_available: res.restores_remaining,
            }
          : old,
      );
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setRestoreError(null);
    },
    onError: () => {
      setRestoreError('Не удалось восстановить. Попробуй ещё раз.');
    },
  });

  return (
    <BottomSheet
      title={t(streakExtended ? 'streak_extended' : 'streak_pending')}
      onClose={onClose}
      secondaryAction={{
        text: data?.can_restore ? t('cancel') : undefined,
      }}
      actionLabel={data?.can_restore ? t('restore_streak') : t('keep_it_up')}
      onAction={data?.can_restore ? () => doRestore() : () => onClose()}
      isProcessing={isRestoring}
    >
      <div className="flex flex-col gap-2.5">
        <Section>
          <div className="flex items-center gap-2">
            <Flame size={38} {...flameColorProps} />

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
            className="my-3.5 h-0.5 w-full rounded-full"
            style={{ backgroundColor: theme.section_separator_color }}
          />

          <div>
            <div className="mb-1 grid grid-cols-7 gap-6">
              {dayHeaders.map((h) => (
                <span
                  key={h}
                  className="flex aspect-square items-center justify-center rounded-full"
                  style={{
                    color: theme.button_text_color,
                    backgroundColor: theme.button_color,
                  }}
                >
                  <Check strokeWidth={2} size={14} />
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-6">
              {dayHeaders.map((h) => (
                <div
                  key={h}
                  className="text-center text-xs font-medium"
                  style={{ color: theme.hint_color }}
                >
                  {h}
                </div>
              ))}
            </div>
          </div>
        </Section>

        {isLoading ? (
          <Skeleton className="h-12 w-full" />
        ) : data?.today_progress ? (
          <Section className="gap-1.5">
            <div className="flex">
              <span
                className="flex w-1/3 items-center justify-center text-3xl font-medium"
                style={{ color: theme.text_color }}
              >
                {daily_goalProgress}%
              </span>

              <div className="flex w-2/3 flex-col gap-px">
                <span className="text-sm" style={{ color: theme.text_color }}>
                  {streakExtended
                    ? t('daily_goal_completed')
                    : t('daily_goal_not_completed')}
                </span>
                <span className="text-xs" style={{ color: theme.hint_color }}>
                  {data.today_progress.calories} {t('out_of')}{' '}
                  {data.today_progress.calories_max} {tc('units.kcal')}
                </span>
              </div>
            </div>

            <ProgressBar p={data.today_progress} />
          </Section>
        ) : null}

        <Section>
          <div className="flex items-center gap-3">
            <Target size={48} style={{ color: theme.hint_color }} />

            <div className="flex flex-col gap-px">
              <span
                className="text-sm font-medium"
                style={{ color: theme.text_color }}
              >
                {t('daily_goal')} набор массы
              </span>
              <span className="text-xs" style={{ color: theme.hint_color }}>
                Для продления серии набирайте от 90% дневной нормы калорий.
              </span>
            </div>
          </div>
        </Section>
      </div>
    </BottomSheet>
  );
};
