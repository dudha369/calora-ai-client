import { StepShell } from '../StepShell';
import { OptionCard } from '../OptionCard';
import type { OnboardingData, Gender } from '../../../interfaces/Onboarding';

interface Props {
  data: Partial<OnboardingData>;
  onChange: (patch: Partial<OnboardingData>, isValid: boolean) => void;
}

const OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male',   label: '♂ Мужской' },
  { value: 'female', label: '♀ Женский' },
];

export const Step1Gender = ({ data, onChange }: Props) => (
  <StepShell
    title="Укажи свой пол"
    subtitle="Влияет на расчёт базового обмена веществ — у мужчин и женщин разные коэффициенты BMR"
  >
    <div className="flex flex-col gap-3">
      {OPTIONS.map(opt => (
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
