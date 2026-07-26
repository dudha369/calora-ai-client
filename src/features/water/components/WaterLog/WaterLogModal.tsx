import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Clock, Droplets, Link, Unlink, UtensilsCrossed } from 'lucide-react';
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

type Mode = 'view' | 'edit' | 'link';

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

  // Черновик редактирования — независим от log до момента Save.
  // Инициализируется/сбрасывается только при входе в edit / отмене,
  // а не на каждый рендер — иначе правки терялись бы при инвалидации кэша.
  const [amount, setAmount] = useState(log.amount_ml);
  const [notes, setNotes] = useState(log.notes ?? '');

  const resetDraft = () => {
    setAmount(log.amount_ml);
    setNotes(log.notes ?? '');
  };

  const formattedTime = new Date(log.logged_at).toLocaleTimeString(
    getIntlLocale(i18n.language),
    { hour: '2-digit', minute: '2-digit' },
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['water', log.log_date] });
  };

  const { mutate: saveEdits, isPending: isSaving } = useMutation({
    mutationFn: () =>
      water.update(log.id, {
        amount_ml: amount,
        notes: notes.trim() || null,
      }),
    onSuccess: () => {
      invalidate();
      setMode('view');
    },
  });

  const { mutate: linkMeal, isPending: isLinking } = useMutation({
    mutationFn: (foodLogId: number) =>
      water.update(log.id, { food_log_id: foodLogId }),
    onSuccess: () => {
      invalidate();
      setMode('edit');
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

  const handleDismissRequest = () => {
    if (mode === 'link') {
      setMode('edit');
      return true;
    }
    if (mode === 'edit') {
      resetDraft();
      setMode('view');
      return true;
    }
    return false;
  };

  const mainButton =
    mode === 'view'
      ? { label: tc('buttons.edit'), onAction: () => setMode('edit') }
      : mode === 'edit'
        ? { label: tc('buttons.save'), onAction: () => saveEdits() }
        : { label: tc('buttons.cancel'), onAction: () => setMode('edit') };

  const secondaryAction =
    mode === 'view'
      ? {
          text: tc('buttons.delete'),
          textColor: theme.destructive_text_color,
          onClick: () => onDelete(log.id),
          isProcessing: isDeleting,
          position: 'left' as const,
        }
      : mode === 'edit'
        ? {
            text: tc('buttons.cancel'),
            onClick: () => {
              resetDraft();
              setMode('view');
            },
            position: 'left' as const,
          }
        : undefined;

  return (
    <BottomSheet
      onClose={onClose}
      onDismissRequest={handleDismissRequest}
      title={mode === 'link' ? t('link_meal_title') : undefined}
      dragToClose={mode === 'view'}
      actionLabel={mainButton.label}
      onAction={mainButton.onAction}
      isProcessing={mode === 'edit' ? isSaving : undefined}
      secondaryAction={secondaryAction}
    >
      {mode === 'view' && (
        <div className="flex flex-col gap-3 pb-1">
          <div className="flex items-center gap-3">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-full text-2xl"
              style={{ color: MARKER_WATER_COLOR }}
            >
              <Droplets />
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

          {log.notes && (
            <div className="flex flex-col gap-1.5">
              <span
                className="px-1 text-xs font-medium"
                style={{ color: theme.hint_color }}
              >
                {t('note')}
              </span>
              <p
                className="rounded-xl px-3 py-2 text-sm whitespace-pre-wrap"
                style={{
                  backgroundColor: theme.section_bg_color,
                  color: theme.text_color,
                }}
              >
                {log.notes}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <span
              className="px-1 text-xs font-medium"
              style={{ color: theme.hint_color }}
            >
              {t('linked_meal')}
            </span>
            {log.linked_food_log ? (
              <button
                onClick={goToMeal}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-opacity active:opacity-60"
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
                  {linkedName ?? t('linked_meal')}
                </span>
              </button>
            ) : (
              <span
                className="rounded-xl px-3 py-2.5 text-sm"
                style={{
                  backgroundColor: theme.section_bg_color,
                  color: theme.hint_color,
                }}
              >
                {t('no_linked_meal')}
              </span>
            )}
          </div>
        </div>
      )}

      {mode === 'edit' && (
        <div className="flex flex-col gap-3 pb-1">
          <div className="flex flex-col gap-1.5">
            <span
              className="px-1 text-xs font-medium"
              style={{ color: theme.hint_color }}
            >
              {t('amount')}
            </span>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                value={amount}
                min={1}
                max={5000}
                onChange={(e) =>
                  setAmount(
                    Math.max(1, Math.round(Number(e.target.value) || 0)),
                  )
                }
                className="w-full rounded-xl py-2.5 pr-10 pl-3 text-sm font-medium"
                style={{
                  backgroundColor: theme.section_bg_color,
                  color: theme.text_color,
                }}
              />
              <span
                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs"
                style={{ color: theme.hint_color }}
              >
                {tc('units.ml')}
              </span>
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
              placeholder={t('note_placeholder')}
              rows={2}
              className="w-full rounded-xl px-3 py-2 text-sm"
              style={{
                backgroundColor: theme.section_bg_color,
                color: theme.text_color,
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
                <UtensilsCrossed
                  size={16}
                  className="shrink-0"
                  style={{ color: theme.hint_color }}
                />
                <span
                  className="min-w-0 flex-1 truncate text-sm font-medium"
                  style={{ color: theme.text_color }}
                >
                  {linkedName ?? t('linked_meal')}
                </span>
                <button
                  onClick={() => setMode('link')}
                  className="shrink-0 rounded-lg p-1.5 transition-opacity active:opacity-60"
                  style={{ color: theme.hint_color }}
                >
                  <Link size={14} />
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
                <Link size={14} />
                {t('link_meal')}
              </button>
            )}
          </div>
        </div>
      )}

      {mode === 'link' && (
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
