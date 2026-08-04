import { useState, type FocusEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { useTheme } from '@/shared/context/ThemeContext';
import { useUser } from '@/shared/context/UserContext';
import { weight } from '@/shared/api/weight';
import { LabeledTextarea } from '@/shared/ui/LabeledTextarea';

interface QuickWeightSheetProps {
  onClose: () => void;
}

export const QuickWeightSheet = ({ onClose }: QuickWeightSheetProps) => {
  const theme = useTheme();
  const { t } = useTranslation('quick_actions');
  const { t: tc } = useTranslation('common');
  const { user_data } = useUser();
  const queryClient = useQueryClient();

  const [raw, setRaw] = useState(
    user_data?.profile?.weight_kg?.toString() ?? '',
  );
  const [note, setNote] = useState('');
  const weightValue = parseFloat(raw);
  const isValid = !isNaN(weightValue) && weightValue > 0 && weightValue < 400;

  const { mutate: save, isPending } = useMutation({
    mutationFn: () =>
      weight.log({ weight_kg: weightValue, note: note.trim() || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['weight'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      onClose();
    },
  });

  const scrollIntoView = (e: FocusEvent<HTMLElement>) => {
    setTimeout(
      () => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }),
      250,
    );
  };

  return (
    <BottomSheet
      title={t('weight_sheet.title')}
      onClose={onClose}
      actionLabel={t('weight_sheet.save')}
      onAction={() => isValid && save()}
      actionDisabled={!isValid}
      isProcessing={isPending}
    >
      <div className="flex flex-col gap-3 pb-2">
        <div className="flex flex-col gap-1.5">
          <span
            className="px-1 text-xs font-medium"
            style={{ color: theme.hint_color }}
          >
            {t('weight_sheet.label')}
          </span>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              autoFocus
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              onFocus={scrollIntoView}
              className="w-full rounded-2xl p-4 pr-14 text-lg font-medium"
              style={{
                backgroundColor: theme.section_bg_color,
                color: theme.text_color,
                border: `1.5px solid ${theme.section_separator_color}`,
              }}
            />
            <span
              className="absolute top-1/2 right-4 -translate-y-1/2 text-sm font-medium"
              style={{ color: theme.hint_color }}
            >
              {tc('units.kg')}
            </span>
          </div>
        </div>

        <LabeledTextarea
          value={note}
          onChange={setNote}
          label={t('weight_sheet.note_label')}
          placeholder={t('weight_sheet.note_placeholder')}
          optionalLabel={`*${tc('optional')}`}
          maxLength={200}
          rows={2}
        />
      </div>
    </BottomSheet>
  );
};
