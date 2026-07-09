import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StepShell } from '../StepShell';
import { useTheme } from '@/shared/context/ThemeContext';
import type { OnboardingData } from '@/shared/types/Onboarding';

const OPTION_KEYS = [
  'none',
  'diabetes',
  'hypertension',
  'cholesterol',
  'kidney',
] as const;
type MedicalKey = (typeof OPTION_KEYS)[number];

const LEGACY_MAP: Record<string, MedicalKey> = {
  'Нет особенностей': 'none',
  'Сахарный диабет 2 типа': 'diabetes',
  'Высокое давление': 'hypertension',
  'Повышенный холестерин': 'cholesterol',
  'Заболевания почек': 'kidney',
};

function migrateValues(values: string[]): MedicalKey[] {
  return values.map((v) => (LEGACY_MAP[v] ?? v) as MedicalKey);
}

interface Step10MedicalProps {
  data: Partial<OnboardingData>;
  onChange: (patch: Partial<OnboardingData>, isValid: boolean) => void;
}

export const Step10Medical = ({ data, onChange }: Step10MedicalProps) => {
  const theme = useTheme();
  const { t } = useTranslation('onboarding');

  const [selected, setSelected] = useState<MedicalKey[]>(() =>
    migrateValues(data.medical_conditions ?? []),
  );

  const toggle = (key: MedicalKey) => {
    let next: MedicalKey[];
    if (key === 'none') {
      next = selected.includes('none') ? [] : ['none'];
    } else {
      const without = selected.filter((s) => s !== 'none');
      next = without.includes(key)
        ? without.filter((s) => s !== key)
        : [...without, key];
    }
    setSelected(next);
    onChange({ medical_conditions: next }, true);
  };

  return (
    <StepShell title={t('step10.title')} subtitle={t('step10.subtitle')}>
      <div className="flex flex-col gap-3">
        {OPTION_KEYS.map((key) => {
          const active = selected.includes(key);
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-all duration-150"
              style={{
                backgroundColor: active
                  ? theme.button_color
                  : theme.section_bg_color,
                color: active ? theme.button_text_color : theme.text_color,
                border: `1px solid ${active ? theme.button_color : theme.section_separator_color}`,
              }}
            >
              <span
                className="flex size-5 flex-shrink-0 items-center justify-center rounded-full border-2"
                style={{
                  borderColor: active
                    ? theme.button_text_color
                    : theme.hint_color,
                  backgroundColor: active
                    ? theme.button_text_color
                    : 'transparent',
                }}
              >
                {active && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke={theme.button_color}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span className="text-sm font-medium">{t(`step10.${key}`)}</span>
            </button>
          );
        })}
      </div>
      <p className="-mt-2 px-1 text-xs" style={{ color: theme.hint_color }}>
        {t('step10.warning')}
      </p>
    </StepShell>
  );
};
