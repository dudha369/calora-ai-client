import { useTranslation } from 'react-i18next';
import { StepShell } from '../StepShell';
import { OptionCard } from '../OptionCard';
import type { OnboardingData, Goal } from '@/shared/types/Onboarding';

interface Step5GoalProps {
  data: Partial<OnboardingData>;
  onChange: (patch: Partial<OnboardingData>, isValid: boolean) => void;
}

export const Step5Goal = ({ data, onChange }: Step5GoalProps) => {
  const { t } = useTranslation('onboarding');

  const OPTIONS: { value: Goal; label: string; description: string }[] = [
    {
      value: 'lose',
      label: t('step5.lose'),
      description: t('step5.lose_desc'),
    },
    {
      value: 'maintain',
      label: t('step5.maintain'),
      description: t('step5.maintain_desc'),
    },
    {
      value: 'gain',
      label: t('step5.gain'),
      description: t('step5.gain_desc'),
    },
  ];

  return (
    <StepShell title={t('step5.title')} subtitle={t('step5.subtitle')}>
      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            description={opt.description}
            isSelected={data.goal === opt.value}
            onClick={() =>
              onChange(
                // если меняем цель на «поддержать» — сбрасываем желаемый вес
                {
                  goal: opt.value,
                  target_weight:
                    opt.value === 'maintain' ? undefined : data.target_weight,
                },
                true,
              )
            }
          />
        ))}
      </div>
    </StepShell>
  );
};
