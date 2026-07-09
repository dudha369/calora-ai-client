import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Flame, Trophy, Shield, Check } from 'lucide-react';
import { Skeleton } from '../Skeleton';
import { BottomSheet } from '../BottomSheet';
import { useTheme } from '../../context/ThemeContext';
import { users } from '../../api/users';
import type { StreakInfo, TodayProgress } from '../../interfaces/api/streak';
import { useTranslation } from 'react-i18next';
import { capitalizeFirst, getIntlLocale } from '../../utils/locale.ts';

interface StreakPopupProps {
  currentStreak: number;
  onClose: () => void;
}

const MAX_RESTORES_PER_MONTH = 3;

const RestoreCharges = ({ available }: { available: number }) => {
  const theme = useTheme();
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: MAX_RESTORES_PER_MONTH }, (_, i) => (
        <Shield
          key={i}
          size={15}
          style={{
            color:
              i < available
                ? theme.button_text_color
                : theme.section_separator_color,
            fill: i < available ? theme.button_text_color : 'transparent',
          }}
        />
      ))}
    </div>
  );
};

export const StreakPopup = ({ currentStreak, onClose }: StreakPopupProps) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation('home_page');
  const locale = getIntlLocale(i18n.language);
  const queryClient = useQueryClient();
  const [restoreError, setRestoreError] = useState<string | null>(null);

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

  const streakExtended = data?.today_progress?.status === 'met';

  const { mutate: doRestore, isPending: isRestoring } = useMutation({
    mutationFn: () => users.restoreStreak(),
    onSuccess: ({ data: res }) => {
      // Обновляем кэш немедленно — эндпоинт уже вернул новые значения.
      queryClient.setQueryData<StreakInfo>(['streak'], (old) =>
        old
          ? {
              ...old,
              current_streak: res.restored_to,
              can_restore: false,
              streak_restores_available: res.restores_remaining,
              // streak_active_today остаётся false — restore не засчитывает
              // сегодня автоматически, нужно залогировать еду.
            }
          : old,
      );
      // Фоновый рефетч /me — обновит счётчик огонька в хедере.
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setRestoreError(null);
    },
    onError: () => {
      setRestoreError('Не удалось восстановить. Попробуй ещё раз.');
    },
  });

  // currentStreak из пропов — число видно мгновенно при открытии.
  // data?.current_streak подхватывается когда запрос завершится (~100ms).
  const streak = data?.current_streak ?? currentStreak;

  return (
    <BottomSheet
      title={t(streakExtended ? 'streak_extended' : 'streak_pending')}
      onClose={onClose}
      secondaryAction={{
        text: data?.can_restore ? t('cancel') : undefined,
      }}
      actionLabel={data?.can_restore ? t('restore_streak') : undefined}
      onAction={data?.can_restore ? () => doRestore() : undefined}
      isProcessing={isRestoring}
    >
      <div className="flex flex-col">
        <div></div>
        <div
          className="mx-auto h-0.5 w-[90%]"
          style={{ backgroundColor: theme.section_separator_color }}
        />
        <div>
          <div className="mb-1 grid grid-cols-7 gap-1.5">
            {dayHeaders.map((h) => (
              <span
                key={h}
                className="flex justify-center rounded-full py-1"
                style={{
                  color: theme.text_color,
                  backgroundColor: theme.button_color,
                }}
              >
                <Check size={14} />
              </span>
            ))}
          </div>
          <div className="mb-1 grid grid-cols-7 gap-1.5">
            {dayHeaders.map((h) => (
              <div
                key={h}
                className="py-1 text-center text-xs font-medium"
                style={{ color: theme.hint_color }}
              >
                {h}
              </div>
            ))}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};
