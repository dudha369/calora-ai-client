import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Scale, Trash2 } from 'lucide-react';
import { useBackButton } from '@/shared/hooks/useBackButton';
import { useTheme } from '@/shared/context/ThemeContext';
import { weight } from '@/shared/api/weight';
import { getIntlLocale } from '@/shared/lib/locale';
import type { WeightRecord } from '@/shared/types/api/weight';
import { QuickWeightSheet } from '@/shared/ui/QuickActions/QuickWeightSheet';
import { Skeleton } from '@/shared/ui/Skeleton';

export const WeightPage = () => {
  const navigate = useNavigate();
  useBackButton(() => navigate('/profile'), true);

  const theme = useTheme();
  const { t } = useTranslation('quick_actions');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['weight', 'history'],
    queryFn: async () => (await weight.getHistory()).data,
  });

  const [addOpen, setAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { mutate: removeEntry } = useMutation({
    mutationFn: (id: number) => weight.remove(id),
    onMutate: (id: number) => setDeletingId(id),
    onSettled: () => setDeletingId(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weight'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const records = data ?? [];

  return (
    <div className="flex flex-col gap-4 px-4 pt-2 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: theme.text_color }}>
          {t('weight_sheet.title')}
        </h1>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold transition-opacity active:opacity-70"
          style={{
            backgroundColor: theme.button_color,
            color: theme.button_text_color,
          }}
        >
          <Plus size={16} />
          {t('weight_sheet.save')}
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      ) : records.length === 0 ? (
        <p
          className="py-10 text-center text-sm"
          style={{ color: theme.hint_color }}
        >
          {t('weight_page.empty')}
        </p>
      ) : (
        <div
          className="flex flex-col divide-y divide-(--tg-section-separator-color) rounded-2xl"
          style={{ backgroundColor: theme.section_bg_color }}
        >
          {records.map((r) => (
            <WeightRow
              key={r.id}
              record={r}
              isDeleting={deletingId === r.id}
              onDelete={() => removeEntry(r.id)}
            />
          ))}
        </div>
      )}

      {addOpen && <QuickWeightSheet onClose={() => setAddOpen(false)} />}
    </div>
  );
};

function WeightRow({
  record,
  isDeleting,
  onDelete,
}: {
  record: WeightRecord;
  isDeleting: boolean;
  onDelete: () => void;
}) {
  const theme = useTheme();
  const { t: tc, i18n } = useTranslation('common');

  const dateStr = new Date(record.recorded_at).toLocaleDateString(
    getIntlLocale(i18n.language),
    { day: 'numeric', month: 'short' },
  );

  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{ opacity: isDeleting ? 0.5 : 1 }}
    >
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: theme.secondary_bg_color }}
      >
        <Scale size={18} style={{ color: theme.button_color }} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-baseline gap-1.5">
          <span
            className="text-base font-semibold"
            style={{ color: theme.text_color }}
          >
            {record.weight_kg}
          </span>
          <span className="text-xs" style={{ color: theme.hint_color }}>
            {tc('units.kg')}
          </span>
          <span className="text-xs" style={{ color: theme.hint_color }}>
            · {dateStr}
          </span>
        </div>
        {record.note && (
          <span
            className="truncate text-xs"
            style={{ color: theme.subtitle_text_color }}
          >
            {record.note}
          </span>
        )}
      </div>

      <button
        onClick={onDelete}
        disabled={isDeleting}
        aria-label={tc('buttons.delete')}
        className="rounded-lg p-1.5 transition-opacity active:opacity-50"
      >
        <Trash2 size={16} style={{ color: theme.destructive_text_color }} />
      </button>
    </div>
  );
}
