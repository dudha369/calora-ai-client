import { useTranslation } from 'react-i18next';
import { StepShell } from '../StepShell';
import { OptionCard } from '../OptionCard';
import type {
  OnboardingData,
  ActivityLevel,
} from '@/shared/types/Onboarding';

interface Step7ActivityProps {
  data: Partial<OnboardingData>;
  onChange: (patch: Partial<OnboardingData>, isValid: boolean) => void;
}

export const Step7Activity = ({ data, onChange }: Step7ActivityProps) => {
  const { t } = useTranslation('onboarding');

  const OPTIONS: {
    value: ActivityLevel;
    label: string;
    description: string;
  }[] = [
    {
      value: 1.2,
      label: t('step7.sedentary'),
      description: t('step7.sedentary_desc'),
    },
    {
      value: 1.375,
      label: t('step7.light'),
      description: t('step7.light_desc'),
    },
    {
      value: 1.55,
      label: t('step7.moderate'),
      description: t('step7.moderate_desc'),
    },
    {
      value: 1.725,
      label: t('step7.active'),
      description: t('step7.active_desc'),
    },
    {
      value: 1.9,
      label: t('step7.extreme'),
      description: t('step7.extreme_desc'),
    },
  ];

  return (
    <StepShell title={t('step7.title')} subtitle={t('step7.subtitle')}>
      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            description={opt.description}
            isSelected={data.activity_level === opt.value}
            onClick={() => onChange({ activity_level: opt.value }, true)}
          />
        ))}
      </div>
    </StepShell>
  );
};
