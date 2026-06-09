import { useState } from 'react';
import { StepShell } from '../StepShell';
import { useTheme } from '../../../context/ThemeContext';
import type { OnboardingData } from '../../../interfaces/Onboarding';

const MIN = 13;
const MAX = 90;

interface Props {
  data: Partial<OnboardingData>;
  onChange: (patch: Partial<OnboardingData>, isValid: boolean) => void;
}

export const Step2Age = ({ data, onChange }: Props) => {
  const theme = useTheme();
  const [raw, setRaw] = useState(data.age?.toString() ?? '');

  const handleChange = (val: string) => {
    setRaw(val);
    const n = parseInt(val, 10);
    const valid = !isNaN(n) && n >= MIN && n <= MAX;
    onChange({ age: valid ? n : undefined }, valid);
  };

  const hasError = raw !== '' && (() => {
    const n = parseInt(raw, 10);
    return isNaN(n) || n < MIN || n > MAX;
  })();

  return (
    <StepShell
      title="Сколько тебе лет?"
      subtitle="Возраст участвует в формуле Миффлина–Сент-Жеора для расчёта калорийности"
    >
      <div className="flex flex-col gap-2">
        <input
          type="number"
          inputMode="numeric"
          value={raw}
          onChange={e => handleChange(e.target.value)}
          placeholder="Например, 25"
          className="w-full p-4 rounded-2xl text-lg font-medium outline-none"
          style={{
            backgroundColor: theme.section_bg_color,
            color: theme.text_color,
            border: `1.5px solid ${hasError ? '#ff3b30' : theme.section_separator_color}`,
          }}
        />
        <p className="text-sm px-1" style={{ color: hasError ? '#ff3b30' : theme.hint_color }}>
          {hasError ? `Введи возраст от ${MIN} до ${MAX} лет` : `От ${MIN} до ${MAX} лет`}
        </p>
      </div>
    </StepShell>
  );
};
