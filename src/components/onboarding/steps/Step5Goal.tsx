import { StepShell } from '../StepShell';
import { OptionCard } from '../OptionCard';
import type { OnboardingData, Goal } from '../../../interfaces/Onboarding';

interface Props {
  data: Partial<OnboardingData>;
  onChange: (patch: Partial<OnboardingData>, isValid: boolean) => void;
}

const OPTIONS: { value: Goal; label: string; description: string }[] = [
  { value: 'lose',     label: '🔥 Похудеть',              description: 'Дефицит калорий, акцент на кардио и питании' },
  { value: 'maintain', label: '⚖️ Поддержать вес',         description: 'Баланс — удерживать текущую форму' },
  { value: 'gain',     label: '💪 Набрать мышечную массу', description: 'Профицит калорий, акцент на белке и силовых' },
];

export const Step5Goal = ({ data, onChange }: Props) => (
  <StepShell
    title="Какова твоя цель?"
    subtitle="Определяет дефицит или профицит калорий и основной акцент приложения"
  >
    <div className="flex flex-col gap-3">
      {OPTIONS.map(opt => (
        <OptionCard
          key={opt.value}
          label={opt.label}
          description={opt.description}
          isSelected={data.goal === opt.value}
          onClick={() =>
            onChange(
              // если меняем цель на «поддержать» — сбрасываем желаемый вес
              { goal: opt.value, target_weight: opt.value === 'maintain' ? undefined : data.target_weight },
              true,
            )
          }
        />
      ))}
    </div>
  </StepShell>
);
