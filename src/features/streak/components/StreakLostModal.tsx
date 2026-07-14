import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Flame, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { useTheme } from '@/shared/context/ThemeContext';
import { users } from '@/shared/api/users';
import type { StreakInfo } from '@/shared/types/api/streak';
import { useCountdown, formatCountdown } from '../hooks/useCountdown';
import { Section } from './Section';
import { getFlameColor } from '@/features/home/lib/getFlameColor.ts';

interface StreakLostModalProps {
  data: StreakInfo;
  onClose: () => void;
}

export const StreakLostModal = ({ data, onClose }: StreakLostModalProps) => {
  const theme = useTheme();
  const { t } = useTranslation('home_page');
  const queryClient = useQueryClient();

  const [confirmNewStreak, setConfirmNewStreak] = useState(false);

  const remainingMs = useCountdown(
    data.can_restore ? data.restore_deadline : null,
  );
  const { hours, minutes } = formatCountdown(remainingMs);

  const invalidateStreak = () => {
    queryClient.invalidateQueries({ queryKey: ['streak'] });
    queryClient.invalidateQueries({ queryKey: ['user'] });
  };

  const { mutate: doRestore, isPending: isRestoring } = useMutation({
    mutationFn: () => users.restoreStreak(),
    onSuccess: () => {
      invalidateStreak();
      onClose();
    },
  });

  const { mutate: doDecline, isPending: isDeclining } = useMutation({
    mutationFn: () => users.declineStreakRestore(),
    onSuccess: () => {
      invalidateStreak();
      onClose();
    },
  });

  const lostDays = data.lost_streak_value ?? 0;
  const flameColor = getFlameColor(lostDays, true, '');

  return (
    <>
      <BottomSheet
        title={t('streak_lost')}
        onClose={onClose}
        actionLabel={data.can_restore ? t('restore_streak') : t('understood')}
        iconCustomEmojiId={data.can_restore ? '5258420634785947640' : undefined}
        onAction={data.can_restore ? () => doRestore() : onClose}
        isProcessing={isRestoring}
        secondaryAction={{
          text: t('start_new_streak'),
          textColor: theme.destructive_text_color,
          iconCustomEmojiId: '5260221883940347555',
          onClick: () => setConfirmNewStreak(true),
          isVisible: !isRestoring,
          position: 'bottom',
        }}
      >
        <div className="flex flex-col gap-3 pb-1">
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="flex items-center gap-1">
              <Flame size={44} {...flameColor} className="opacity-80" />
              <span
                className="text-4xl font-bold"
                style={{ color: theme.text_color }}
              >
                {lostDays}
              </span>
            </div>

            <p
              className="text-center text-lg font-semibold"
              style={{ color: theme.text_color }}
            >
              {t('lost_streak_message', { count: lostDays })}
            </p>
          </div>

          {data.can_restore && data.restore_deadline && (
            <Section className="items-center gap-1.5 py-4">
              <div
                className="flex items-center gap-1.5"
                style={{ color: theme.hint_color }}
              >
                <Clock size={14} />
                <span className="text-sm font-medium">
                  {t('restore_window_hint')}
                </span>
              </div>
              <span
                className="text-2xl font-bold tabular-nums"
                style={{ color: theme.text_color }}
              >
                {t('countdown_format', {
                  hours,
                  minutes: String(minutes).padStart(2, '0'),
                })}
              </span>
            </Section>
          )}

          {!data.can_restore && (
            <Section>
              <p
                className="text-center text-sm"
                style={{ color: theme.hint_color }}
              >
                {data.restore_expired
                  ? t('restore_window_expired')
                  : t('no_restores_available')}
              </p>
            </Section>
          )}
        </div>
      </BottomSheet>

      {confirmNewStreak && (
        <BottomSheet
          title={t('start_new_streak_title')}
          onClose={() => !isDeclining && setConfirmNewStreak(false)}
          actionLabel={t('confirm')}
          onAction={() => doDecline()}
          isProcessing={isDeclining}
          secondaryAction={{
            text: t('cancel'),
            onClick: () => setConfirmNewStreak(false),
            position: 'left',
          }}
        >
          <p className="text-center" style={{ color: theme.text_color }}>
            {t('start_new_streak_description', { count: lostDays })}
          </p>
        </BottomSheet>
      )}
    </>
  );
};
