import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StepShell } from '../StepShell';
import { useTheme } from '../../../context/ThemeContext';
import type { OnboardingData } from '../../../interfaces/Onboarding';

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

interface Step2BirthDateProps {
  data: Partial<OnboardingData>;
  onChange: (patch: Partial<OnboardingData>, isValid: boolean) => void;
}

export const Step2BirthDate = ({ data, onChange }: Step2BirthDateProps) => {
  const theme = useTheme();
  const { t } = useTranslation('onboarding');
  const [raw, setRaw] = useState(data.birth_date ?? '');

  const now = new Date();
  const maxDate = new Date(
    now.getFullYear() - MIN_YEAR_OFFSET,
    now.getMonth(),
    now.getDate(),
  )
    .toISOString()
    .split('T')[0];
  const minDate = new Date(
    now.getFullYear() - MAX_YEAR_OFFSET,
    now.getMonth(),
    now.getDate(),
  )
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
    <StepShell title={t('step2.title')} subtitle={t('step2.subtitle')}>
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
            ? t('step2.error', { min: MIN_YEAR_OFFSET, max: MAX_YEAR_OFFSET })
            : age !== null
              ? t('step2.age', { count: age })
              : t('step2.hint', { min: MIN_YEAR_OFFSET, max: MAX_YEAR_OFFSET })}
        </p>
      </div>
    </StepShell>
  );
};
