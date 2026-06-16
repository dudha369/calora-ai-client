import { useState } from 'react';
import { StepShell } from '../StepShell';
import { useTheme } from '../../../context/ThemeContext';
import type { OnboardingData } from '../../../interfaces/Onboarding';

/** Min age 13, max age 90 */
const MIN_YEAR_OFFSET = 13;
const MAX_YEAR_OFFSET = 90;

function getAge(dateStr: string): number {
  const birth = new Date(dateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const age = getAge(dateStr);
  return age >= MIN_YEAR_OFFSET && age <= MAX_YEAR_OFFSET;
}

interface Props {
  data: Partial<OnboardingData>;
  onChange: (patch: Partial<OnboardingData>, isValid: boolean) => void;
}

export const Step2BirthDate = ({ data, onChange }: Props) => {
  const theme = useTheme();
  const [raw, setRaw] = useState(data.birth_date ?? '');

  const now = new Date();
  const maxDate = new Date(now.getFullYear() - MIN_YEAR_OFFSET, now.getMonth(), now.getDate())
    .toISOString()
    .split('T')[0];
  const minDate = new Date(now.getFullYear() - MAX_YEAR_OFFSET, now.getMonth(), now.getDate())
    .toISOString()
    .split('T')[0];

  const handleChange = (val: string) => {
    setRaw(val);
    const valid = isValidDate(val);
    onChange({ birth_date: valid ? val : undefined }, valid);
  };

  const hasError = raw !== '' && !isValidDate(raw);
  const age = raw && isValidDate(raw) ? getAge(raw) : null;

  return (
    <StepShell
      title="Дата рождения"
      subtitle="Возраст вычисляется автоматически и обновляет нормы каждый год"
    >
      <div className="flex flex-col gap-2">
        <input
          type="date"
          value={raw}
          min={minDate}
          max={maxDate}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full rounded-2xl p-4 text-lg font-medium outline-none"
          style={{
            backgroundColor: theme.section_bg_color,
            color: theme.text_color,
            border: `1.5px solid ${hasError ? '#ff3b30' : theme.section_separator_color}`,
            colorScheme: 'dark',
          }}
        />
        <p
          className="px-1 text-sm"
          style={{ color: hasError ? '#ff3b30' : theme.hint_color }}
        >
          {hasError
            ? `Возраст должен быть от ${MIN_YEAR_OFFSET} до ${MAX_YEAR_OFFSET} лет`
            : age !== null
              ? `Тебе ${age} ${age % 10 === 1 && age !== 11 ? 'год' : (age % 10 >= 2 && age % 10 <= 4 && (age < 12 || age > 14)) ? 'года' : 'лет'}`
              : `От ${MIN_YEAR_OFFSET} до ${MAX_YEAR_OFFSET} лет`}
        </p>
      </div>
    </StepShell>
  );
};
