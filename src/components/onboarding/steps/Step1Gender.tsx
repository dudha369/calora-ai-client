import { StepShell } from '../StepShell';
import { OptionCard } from '../OptionCard';
import type { OnboardingData, Gender } from '../../../interfaces/Onboarding';
import { useTranslation } from 'react-i18next';

interface Step1GenderProps {
  data: Partial<OnboardingData>;
  onChange: (patch: Partial<OnboardingData>, isValid: boolean) => void;
}

export const Step1Gender = ({ data, onChange }: Step1GenderProps) => {
  const { t } = useTranslation('onboarding');

  const OPTIONS: { value: Gender; label: string }[] = [
    { value: 'male', label: t('step1.male') },
    { value: 'female', label: t('step1.female') },
  ];

  return (
    <StepShell
      title="Укажи свой пол"
      subtitle="Влияет на расчёт базового обмена веществ — у мужчин и женщин разные коэффициенты BMR"
    >
      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            isSelected={data.gender === opt.value}
            onClick={() => onChange({ gender: opt.value }, true)}
          />
        ))}
      </div>
    </StepShell>
  );
};
