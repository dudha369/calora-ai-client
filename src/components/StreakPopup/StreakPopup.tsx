import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Flame, Trophy, Shield } from 'lucide-react';
import { Skeleton } from '../Skeleton';
import { BottomSheet } from '../BottomSheet';
import { useTheme } from '../../context/ThemeContext';
import { users } from '../../api/users';
import type { StreakInfo, TodayProgress } from '../../interfaces/api/streak';

interface Props {
  currentStreak: number;
  onClose: () => void;
}

const MAX_RESTORES_PER_MONTH = 3;

const CaloriesBar = ({ p }: { p: TodayProgress }) => {
  const theme = useTheme();
  const scale = p.calories_max * 1.2;
  const pct = (v: number) =>
    `${Math.min(Math.max((v / scale) * 100, 0), 100).toFixed(1)}%`;

  const barColor =
    p.status === 'met'
      ? '#34c759'
      : p.status === 'over'
        ? theme.destructive_text_color
        : theme.button_color;

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="relative h-2.5 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: theme.section_separator_color }}
      >
        <div
          className="absolute top-0 h-full rounded-full opacity-20"
          style={{
            left: pct(p.calories_min),
            width: `${((p.calories_max - p.calories_min) / scale) * 100}%`,
            backgroundColor: '#34c759',
          }}
        />
        <div
          className="absolute top-0 h-full rounded-full transition-[width] duration-500"
          style={{ width: pct(p.calories), backgroundColor: barColor }}
        />
        <div
          className="absolute top-0 h-full w-px opacity-40"
          style={{
            left: pct(p.calories_goal),
            backgroundColor: theme.text_color,
          }}
        />
      </div>
      <div
        className="flex justify-between text-xs"
        style={{ color: theme.hint_color }}
      >
        <span>0</span>
        <span>{p.calories_goal} ккал</span>
      </div>
    </div>
  );
};

const StatusLine = ({ p }: { p: TodayProgress }) => {
  const theme = useTheme();

  if (p.status === 'met') {
    return (
      <p className="text-sm font-medium" style={{ color: '#34c759' }}>
        ✅ Норма выполнена — серия продлена!
      </p>
    );
  }
  if (p.status === 'over') {
    return (
      <p className="text-sm" style={{ color: theme.hint_color }}>
        Превышение нормы. Серия была продлена ранее.
      </p>
    );
  }
  return (
    <p className="text-sm" style={{ color: theme.hint_color }}>
      Ещё{' '}
      <span className="font-semibold" style={{ color: theme.text_color }}>
        {p.calories_remaining} ккал
      </span>{' '}
      до допуска
    </p>
  );
};

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

// ─── Main component ───────────────────────────────────────────────────────────

export const StreakPopup = ({ currentStreak, onClose }: Props) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const { data, isLoading } = useQuery<StreakInfo>({
    queryKey: ['streak'],
    queryFn: async () => (await users.getStreak()).data,
    staleTime: 10_000,
  });

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

  // cancelLabel всегда передаём строкой — иначе useSecondaryButton внутри
  // BottomSheet вызывался бы условно (нарушение rules of hooks).
  // Когда onAction === undefined → isTgButtonsVisible = false →
  // оба Telegram-button скрыты (встроено в BottomSheet).
  return (
    <BottomSheet
      title="Серия"
      onClose={onClose}
      secondaryAction={{
        text: 'Закрыть',
      }}
      actionLabel={data?.can_restore ? 'Восстановить серию' : undefined}
      onAction={data?.can_restore ? () => doRestore() : undefined}
      isProcessing={isRestoring}
    >
      <div className="flex flex-col gap-4">
        {/* Счётчики */}
        <div className="flex gap-3">
          <div
            className="flex flex-1 flex-col items-center gap-1 rounded-2xl py-3"
            style={{ backgroundColor: theme.section_bg_color }}
          >
            <div className="flex items-center gap-1.5">
              <Flame size={18} className="text-orange-400" />
              <span
                className="text-3xl font-bold tabular-nums"
                style={{ color: theme.text_color }}
              >
                {streak}
              </span>
            </div>
            <span className="text-xs" style={{ color: theme.hint_color }}>
              текущая
            </span>
          </div>

          <div
            className="flex flex-1 flex-col items-center gap-1 rounded-2xl py-3"
            style={{ backgroundColor: theme.section_bg_color }}
          >
            <div className="flex items-center gap-1.5">
              <Trophy size={16} className="text-yellow-400" />
              <span
                className="text-3xl font-bold tabular-nums"
                style={{ color: theme.text_color }}
              >
                {data?.max_streak ?? '—'}
              </span>
            </div>
            <span className="text-xs" style={{ color: theme.hint_color }}>
              рекорд
            </span>
          </div>
        </div>

        {/* Прогресс за сегодня */}
        {isLoading ? (
          <Skeleton className="h-12 w-full" />
        ) : data?.today_progress ? (
          <div className="flex flex-col gap-2">
            <CaloriesBar p={data.today_progress} />
            <StatusLine p={data.today_progress} />
          </div>
        ) : null}

        {/* Щиты */}
        {isLoading ? (
          <Skeleton className="h-5 w-24" />
        ) : data ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: theme.hint_color }}>
                Щиты серии
              </span>
              <RestoreCharges available={data.streak_restores_available} />
            </div>
            {restoreError && (
              <p
                className="text-xs"
                style={{ color: theme.destructive_text_color }}
              >
                {restoreError}
              </p>
            )}
          </div>
        ) : null}

        {/* Правило */}
        <p
          className="text-xs leading-relaxed"
          style={{ color: theme.hint_color }}
        >
          Серия продлевается при соблюдении нормы калорий
          {data?.today_progress
            ? ` (допуск от ${data.today_progress.calories_min} ккал).`
            : '.'}{' '}
          Щиты обновляются с каждой новой серией и в начале месяца.
        </p>
      </div>
    </BottomSheet>
  );
};
