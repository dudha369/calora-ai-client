import { useState } from 'react';
import { StepShell } from '../StepShell';
import { useTheme } from '../../../context/ThemeContext';
import type { OnboardingData } from '../../../interfaces/Onboarding';

const OPTIONS = [
  'Нет особенностей',
  'Сахарный диабет 2 типа',
  'Высокое давление',
  'Повышенный холестерин',
  'Заболевания почек',
];

const NONE = 'Нет особенностей';

interface Props {
  data: Partial<OnboardingData>;
  onChange: (patch: Partial<OnboardingData>, isValid: boolean) => void;
}

export const Step10Medical = ({ data, onChange }: Props) => {
  const theme = useTheme();
  const [selected, setSelected] = useState<string[]>(
    data.medical_conditions ?? [],
  );

  const toggle = (opt: string) => {
    let next: string[];
    if (opt === NONE) {
      next = selected.includes(NONE) ? [] : [NONE];
    } else {
      const without = selected.filter((s) => s !== NONE);
      next = without.includes(opt)
        ? without.filter((s) => s !== opt)
        : [...without, opt];
    }
    setSelected(next);
    onChange({ medical_conditions: next }, true);
  };

  return (
    <StepShell
      title="Медицинские особенности"
      subtitle="Только для точности рекомендаций ИИ. Данные не передаются третьим лицам. Можно пропустить"
    >
      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-all duration-150"
              style={{
                backgroundColor: active
                  ? theme.button_color
                  : theme.section_bg_color,
                color: active ? theme.button_text_color : theme.text_color,
                border: `1px solid ${active ? theme.button_color : theme.section_separator_color}`,
              }}
            >
              {/* Custom checkbox */}
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
              <span className="text-sm font-medium">{opt}</span>
            </button>
          );
        })}
      </div>
      <p className="-mt-2 px-1 text-xs" style={{ color: theme.hint_color }}>
        ⚠️ Используется только для фильтрации советов ИИ
      </p>
    </StepShell>
  );
};
