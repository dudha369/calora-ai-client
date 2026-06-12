import { StepShell } from '../StepShell';
import { OptionCard } from '../OptionCard';
import type {
  OnboardingData,
  ActivityLevel,
} from '../../../interfaces/Onboarding';

interface Props {
  data: Partial<OnboardingData>;
  onChange: (patch: Partial<OnboardingData>, isValid: boolean) => void;
}

const OPTIONS: { value: ActivityLevel; label: string; description: string }[] =
  [
    {
      value: 1.2,
      label: '🛋 Сидячий',
      description: 'Офис, почти нет движения (×1.2)',
    },
    {
      value: 1.375,
      label: '🚶 Слабоактивный',
      description: 'Лёгкие прогулки 1–2 раза в неделю (×1.375)',
    },
    {
      value: 1.55,
      label: '🏃 Умеренно активный',
      description: 'Спорт 3–5 раз в неделю (×1.55)',
    },
    {
      value: 1.725,
      label: '🏋️ Очень активный',
      description: 'Интенсивные тренировки 6–7 раз (×1.725)',
    },
    {
      value: 1.9,
      label: '⚡ Экстремально активный',
      description: 'Физический труд + ежедневный спорт (×1.9)',
    },
  ];

export const Step7Activity = ({ data, onChange }: Props) => (
  <StepShell
    title="Насколько ты активен?"
    subtitle="Коэффициент активности (PAL) умножается на BMR и даёт твою дневную норму калорий (TDEE)"
  >
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
