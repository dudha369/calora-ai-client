import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Clock, Link2, Unlink, UtensilsCrossed } from 'lucide-react';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { useTheme } from '@/shared/context/ThemeContext';
import { getIntlLocale } from '@/shared/lib/locale';
import { water } from '@/shared/api/water';
import { food } from '@/shared/api/food';
import type { WaterLog } from '@/shared/types/api/water';
import { MARKER_WATER_COLOR } from '@/shared/constants/markers';

interface WaterLogModalProps {
  onClose: () => void;
  log: WaterLog;
  onDelete: (logId: number) => void;
  isDeleting: boolean;
}

type Mode = 'view' | 'link';

export const WaterLogModal = ({
  onClose,
  log,
  onDelete,
  isDeleting,
}: WaterLogModalProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation('water_page');
  const { t: tc } = useTranslation('common');

  const [mode, setMode] = useState<Mode>('view');
  const [notes, setNotes] = useState(log.notes ?? '');

  const formattedTime = new Date(log.logged_at).toLocaleTimeString(
    getIntlLocale(i18n.language),
    { hour: '2-digit', minute: '2-digit' },
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['water', log.log_date] });
  };

  const { mutate: saveNotes, isPending: isSavingNotes } = useMutation({
    mutationFn: (value: string) =>
      water.update(log.id, { notes: value || null }),
    onSuccess: invalidate,
  });

  const { mutate: linkMeal, isPending: isLinking } = useMutation({
    mutationFn: (foodLogId: number) =>
      water.update(log.id, { food_log_id: foodLogId }),
    onSuccess: () => {
      invalidate();
      setMode('view');
    },
  });

  const { mutate: unlinkMeal, isPending: isUnlinking } = useMutation({
    mutationFn: () => water.update(log.id, { food_log_id: null }),
    onSuccess: invalidate,
  });

  // Блюда за тот же день — грузим только когда реально открыт пикер
  const { data: dayMeals, isLoading: mealsLoading } = useQuery({
    queryKey: ['food', log.log_date],
    queryFn: async () => (await food.getByDate(log.log_date)).data,
    enabled: mode === 'link',
    staleTime: 60 * 1000,
  });

  const goToMeal = useCallback(() => {
    if (!log.linked_food_log) return;
    navigate(
      `/?date=${log.linked_food_log.log_date}&foodLogId=${log.linked_food_log.id}`,
    );
    onClose();
  }, [log.linked_food_log, navigate, onClose]);

  const linkedName =
    log.linked_food_log?.meal_name ??
    log.linked_food_log?.first_item_name ??
    null;

  return (
    <BottomSheet
      onClose={onClose}
      onDismissRequest={() => {
        if (mode !== 'view') {
          setMode('view');
          return true;
        }
        return false;
      }}
      title={mode === 'link' ? t('link_meal_title') : undefined}
      dragToClose={mode === 'view'}
      secondaryAction={
        mode === 'view'
          ? {
              text: tc('buttons.delete'),
              textColor: theme.destructive_text_color,
              onClick: () => onDelete(log.id),
              isProcessing: isDeleting,
              position: 'left' as const,
            }
          : {
              text: tc('buttons.cancel'),
              onClick: () => setMode('view'),
              position: 'left' as const,
            }
      }
    >
      {mode === 'view' ? (
        <div className="flex flex-col gap-3 pb-1">
          <div className="flex items-center gap-3">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-full text-2xl"
              style={{ backgroundColor: `${MARKER_WATER_COLOR}20` }}
            >
              💧
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span
                className="text-2xl font-bold"
                style={{ color: theme.text_color }}
              >
                {log.amount_ml} {tc('units.ml')}
              </span>
              <div
                className="flex items-center gap-1 text-xs"
                style={{ color: theme.hint_color }}
              >
                <Clock size={12} />
                {formattedTime}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span
              className="px-1 text-xs font-medium"
              style={{ color: theme.hint_color }}
            >
              {t('note')}
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => {
                const trimmed = notes.trim();
                if (trimmed !== (log.notes ?? '')) saveNotes(trimmed);
              }}
              placeholder={t('note_placeholder')}
              rows={2}
              className="w-full rounded-xl px-3 py-2 text-sm transition-opacity"
              style={{
                backgroundColor: theme.section_bg_color,
                color: theme.text_color,
                opacity: isSavingNotes ? 0.6 : 1,
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span
              className="px-1 text-xs font-medium"
              style={{ color: theme.hint_color }}
            >
              {t('linked_meal')}
            </span>
            {log.linked_food_log ? (
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                style={{ backgroundColor: theme.section_bg_color }}
              >
                <button
                  onClick={goToMeal}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <UtensilsCrossed
                    size={16}
                    style={{ color: theme.hint_color }}
                  />
                  <span
                    className="truncate text-sm font-medium"
                    style={{ color: theme.text_color }}
                  >
                    {linkedName ?? t('linked_meal')}
                  </span>
                </button>
                <button
                  onClick={() => unlinkMeal()}
                  disabled={isUnlinking}
                  aria-label={t('unlink')}
                  className="shrink-0 rounded-lg p-1.5 transition-opacity active:opacity-60 disabled:opacity-40"
                  style={{ color: theme.destructive_text_color }}
                >
                  <Unlink size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setMode('link')}
                className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-opacity active:opacity-60"
                style={{
                  backgroundColor: theme.section_bg_color,
                  color: theme.hint_color,
                }}
              >
                <Link2 size={14} />
                {t('link_meal')}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 pb-1">
          {mealsLoading ? (
            <span
              className="py-4 text-center text-sm"
              style={{ color: theme.hint_color }}
            >
              {tc('loading')}
            </span>
          ) : dayMeals && dayMeals.logs.length > 0 ? (
            dayMeals.logs.map((meal) => (
              <button
                key={meal.id}
                onClick={() => linkMeal(meal.id)}
                disabled={isLinking}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-opacity active:opacity-60 disabled:opacity-40"
                style={{ backgroundColor: theme.section_bg_color }}
              >
                <UtensilsCrossed
                  size={16}
                  style={{ color: theme.hint_color }}
                />
                <span
                  className="min-w-0 flex-1 truncate text-sm font-medium"
                  style={{ color: theme.text_color }}
                >
                  {meal.meal_name ?? meal.items[0]?.food_name ?? tc('nav.home')}
                </span>
              </button>
            ))
          ) : (
            <span
              className="py-4 text-center text-sm"
              style={{ color: theme.hint_color }}
            >
              {t('no_meals_today')}
            </span>
          )}
        </div>
      )}
    </BottomSheet>
  );
};
