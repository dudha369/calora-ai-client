import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StepShell } from '../StepShell';
import { OptionCard } from '../OptionCard';
import { useTheme } from '@/shared/context/ThemeContext';
import type {
  OnboardingData,
  WaterTrack,
} from '@/shared/types/Onboarding';

const calcAuto = (weight?: number) => (weight ? Math.round(weight * 33) : 2000);

interface Step9WaterProps {
  data: Partial<OnboardingData>;
  onChange: (patch: Partial<OnboardingData>, isValid: boolean) => void;
}

export const Step9Water = ({ data, onChange }: Step9WaterProps) => {
  const theme = useTheme();
  const { t } = useTranslation('onboarding');
  const { t: tc } = useTranslation('common');
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
      label: t('step9.auto'),
      description: t('step9.auto_desc', { goal: autoGoal }),
    },
    {
      value: 'manual',
      label: t('step9.manual'),
      description: t('step9.manual_desc'),
    },
    {
      value: 'none',
      label: t('step9.opt_none'),
      description: t('step9.opt_none_desc'),
    },
  ];

  return (
    <StepShell title={t('step9.title')} subtitle={t('step9.subtitle')}>
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
              placeholder={t('step9.placeholder')}
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
              {tc('units.ml_per_day')}
            </span>
          </div>
        )}
      </div>
    </StepShell>
  );
};
