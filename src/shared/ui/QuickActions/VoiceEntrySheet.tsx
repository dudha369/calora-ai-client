import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Mic, Square } from 'lucide-react';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { useTheme } from '@/shared/context/ThemeContext';
import { food, todayApiDate } from '@/shared/api/food';
import { useVoiceRecorder } from '@/shared/hooks/useVoiceRecorder';
import { FoodResultModal } from '@/features/scanner/components/FoodResultModal';
import type {
  AnalyzedDish,
  FoodAnalyzeResponse,
} from '@/shared/types/api/food';

interface VoiceEntrySheetProps {
  onClose: () => void;
}

type Status =
  | { kind: 'idle' }
  | { kind: 'transcribing' }
  | { kind: 'analyzing'; transcript: string }
  | { kind: 'result'; result: FoodAnalyzeResponse }
  | { kind: 'error'; message: string };

export const VoiceEntrySheet = ({ onClose }: VoiceEntrySheetProps) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation('quick_actions');
  const { t: tc } = useTranslation('common');
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const voice = useVoiceRecorder();

  useEffect(() => () => voice.cancel(), [voice.cancel]);

  const isRecording = voice.state === 'recording';
  const isBusy =
    status.kind === 'transcribing' ||
    status.kind === 'analyzing' ||
    voice.state === 'processing';

  const handleToggle = async () => {
    if (isRecording) {
      const wavBlob = await voice.stop();
      if (!wavBlob) {
        setStatus({ kind: 'error', message: tc('errors.general.subtitle') });
        return;
      }
      setStatus({ kind: 'transcribing' });
      try {
        const { data } = await food.transcribeVoice(wavBlob);
        if (!data.transcript.trim()) {
          setStatus({
            kind: 'error',
            message: t('voice_sheet.empty_transcript'),
          });
          return;
        }
        setStatus({ kind: 'analyzing', transcript: data.transcript });
        const { data: result } = await food.analyzeText(
          data.transcript,
          i18n.language,
        );
        setStatus({ kind: 'result', result });
      } catch {
        setStatus({ kind: 'error', message: tc('errors.general.subtitle') });
      }
      return;
    }

    const started = await voice.start();
    if (!started) {
      setStatus({ kind: 'error', message: t('describe_sheet.mic_denied') });
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

  const ringScale = 1 + voice.volume * 0.35;

  return (
    <BottomSheet
      title={t('voice_sheet.title')}
      onClose={onClose}
      dismissOnBackdrop={!isBusy && !isRecording}
    >
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="relative flex size-24 items-center justify-center">
          {isRecording && (
            <span
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: `${theme.destructive_text_color}30`,
                transform: `scale(${ringScale})`,
                transition: 'transform 150ms ease-out',
              }}
            />
          )}
          <button
            onClick={handleToggle}
            disabled={isBusy}
            className="relative flex size-20 items-center justify-center rounded-full transition-transform active:scale-95 disabled:opacity-60"
            style={{
              backgroundColor: isRecording
                ? theme.destructive_text_color
                : theme.button_color,
              color: theme.button_text_color,
            }}
          >
            {isRecording ? (
              <Square size={28} fill="currentColor" />
            ) : (
              <Mic size={32} />
            )}
          </button>
        </div>

        <p
          className="text-center text-sm font-medium"
          style={{ color: theme.text_color }}
        >
          {isRecording
            ? t('describe_sheet.recording')
            : status.kind === 'transcribing'
              ? t('voice_sheet.transcribing')
              : status.kind === 'analyzing'
                ? t('voice_sheet.analyzing')
                : t('voice_sheet.hint')}
        </p>

        {status.kind === 'analyzing' && (
          <p
            className="rounded-xl px-3 py-2 text-center text-sm italic"
            style={{
              backgroundColor: theme.section_bg_color,
              color: theme.hint_color,
            }}
          >
            «{status.transcript}»
          </p>
        )}

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
