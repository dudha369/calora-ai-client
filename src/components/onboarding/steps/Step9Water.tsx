import { useState } from 'react';
import { StepShell } from '../StepShell';
import { OptionCard } from '../OptionCard';
import { useTheme } from '../../../context/ThemeContext';
import type {
  OnboardingData,
  WaterTrack,
} from '../../../interfaces/Onboarding';

// weight(kg) × 33 ml — standard recommendation
const calcAuto = (weight?: number) => (weight ? Math.round(weight * 33) : 2000);

interface Props {
  data: Partial<OnboardingData>;
  onChange: (patch: Partial<OnboardingData>, isValid: boolean) => void;
}

export const Step9Water = ({ data, onChange }: Props) => {
  const theme = useTheme();
  const autoGoal = calcAuto(data.weight);

  const [track, setTrack] = useState<WaterTrack | undefined>(data.water_track);
  const [rawGoal, setRawGoal] = useState(data.water_goal?.toString() ?? '');

  const emit = (t: WaterTrack, goalStr: string) => {
    const goal =
      t === 'auto'
        ? autoGoal
        : t === 'manual'
          ? parseFloat(goalStr) || undefined
          : undefined;

    const valid = t !== 'manual' || (!!goal && goal > 0);
    onChange({ water_track: t, water_goal: goal }, valid);
  };

  const handleSelect = (t: WaterTrack) => {
    setTrack(t);
    emit(t, rawGoal);
  };

  const handleGoalInput = (val: string) => {
    setRawGoal(val);
    if (track === 'manual') emit('manual', val);
  };

  const OPTIONS: { value: WaterTrack; label: string; description: string }[] = [
    {
      value: 'auto',
      label: '💧 Да, рассчитай норму',
      description: `На основе твоего веса (~${autoGoal} мл/день)`,
    },
    {
      value: 'manual',
      label: '✏️ Да, введу свою норму',
      description: 'Укажу сам сколько хочу выпивать',
    },
    {
      value: 'none',
      label: '🚫 Нет, не нужно',
      description: 'Не хочу отслеживать воду',
    },
  ];

  return (
    <StepShell
      title="Отслеживать воду?"
      subtitle="Помогает не забывать пить в течение дня. Норма = вес × 33 мл"
    >
      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            description={opt.description}
            isSelected={track === opt.value}
            onClick={() => handleSelect(opt.value)}
          />
        ))}

        {track === 'manual' && (
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              value={rawGoal}
              onChange={(e) => handleGoalInput(e.target.value)}
              placeholder="Например, 2000"
              className="w-full rounded-2xl p-4 pr-24 text-lg font-medium outline-none"
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
              мл / день
            </span>
          </div>
        )}
      </div>
    </StepShell>
  );
};
