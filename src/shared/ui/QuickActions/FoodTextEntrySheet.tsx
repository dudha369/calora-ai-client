import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { useTheme } from '@/shared/context/ThemeContext';
import { food, todayApiDate } from '@/shared/api/food';
import { resolveAiErrorMessage } from '@/shared/lib/aiErrors';
import { FoodResultModal } from '@/features/scanner/components/FoodResultModal';
import type {
  AnalyzedDish,
  FoodAnalyzeResponse,
} from '@/shared/types/api/food';
import { LabeledTextarea } from '@/shared/ui/LabeledTextarea';

interface FoodTextEntrySheetProps {
  onClose: () => void;
}

const MAX_LENGTH = 500;

type Status =
  | { kind: 'input' }
  | { kind: 'analyzing' }
  | { kind: 'result'; result: FoodAnalyzeResponse }
  | { kind: 'error'; message: string };

export const FoodTextEntrySheet = ({ onClose }: FoodTextEntrySheetProps) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation('quick_actions');
  const queryClient = useQueryClient();

  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'input' });

  const handleAnalyze = async () => {
    const trimmed = description.trim();
    if (!trimmed) return;
    setStatus({ kind: 'analyzing' });
    try {
      const { data } = await food.analyzeText(trimmed, i18n.language);
      setStatus({ kind: 'result', result: data });
    } catch (err) {
      setStatus({ kind: 'error', message: resolveAiErrorMessage(err) });
    }
  };

  const handleConfirm = async (dishes: AnalyzedDish[], mealName: string) => {
    const totalWaterMl = dishes.reduce((sum, d) => sum + d.water_ml, 0);
    await food.log({
      log_date: todayApiDate(),
      items: dishes.map((dish) => ({
        food_name: dish.name,
        portion_g: dish.portion_g,
        calories: dish.calories,
        protein_g: dish.protein_g,
        fat_g: dish.fat_g,
        carbs_g: dish.carbs_g,
        fiber_g: dish.fiber_g,
        sugar_g: dish.sugar_g,
        water_ml: dish.water_ml,
      })),
      meal_name: mealName || undefined,
      water_ml: totalWaterMl > 0 ? totalWaterMl : undefined,
    });

    const date = todayApiDate();
    queryClient.invalidateQueries({ queryKey: ['food', date] });
    queryClient.invalidateQueries({ queryKey: ['stats', 'daily', date] });
    queryClient.invalidateQueries({ queryKey: ['stats', 'active-dates'] });
    queryClient.invalidateQueries({ queryKey: ['user'] });
    if (totalWaterMl > 0) {
      queryClient.invalidateQueries({ queryKey: ['water', date] });
    }
    onClose();
  };

  if (status.kind === 'result') {
    return (
      <FoodResultModal
        result={status.result}
        photo={null}
        onConfirm={handleConfirm}
        onClose={onClose}
      />
    );
  }

  return (
    <BottomSheet
      title={t('describe_sheet.title')}
      onClose={onClose}
      actionLabel={t('describe_sheet.analyze')}
      onAction={handleAnalyze}
      isProcessing={status.kind === 'analyzing'}
      actionDisabled={!description.trim()}
      dismissOnBackdrop={status.kind !== 'analyzing'}
    >
      <div className="flex flex-col gap-2 pb-1">
        <LabeledTextarea
          value={description}
          onChange={setDescription}
          placeholder={t('describe_sheet.placeholder')}
          maxLength={MAX_LENGTH}
          rows={4}
          disabled={status.kind === 'analyzing'}
          autoFocus
        />

        {status.kind === 'error' && (
          <p
            className="text-center text-sm"
            style={{ color: theme.destructive_text_color }}
          >
            {status.message}
          </p>
        )}
      </div>
    </BottomSheet>
  );
};
