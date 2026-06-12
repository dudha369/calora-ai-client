import { useState } from 'react';
import { StepShell } from '../StepShell';
import { useTheme } from '../../../context/ThemeContext';
import type { OnboardingData } from '../../../interfaces/Onboarding';

const OPTIONS = [
  'Нет ограничений',
  'Вегетарианство',
  'Веганство',
  'Без глютена',
  'Без лактозы',
  'Халяль',
  'Кошер',
  'Аллергия',
];

const NONE = 'Нет ограничений';
const ALLERGY = 'Аллергия';

interface Props {
  data: Partial<OnboardingData>;
  onChange: (patch: Partial<OnboardingData>, isValid: boolean) => void;
}

export const Step8Restrictions = ({ data, onChange }: Props) => {
  const theme = useTheme();
  const [selected, setSelected] = useState<string[]>(
    data.dietary_restrictions ?? [],
  );
  const [allergyNote, setAllergyNote] = useState(data.allergy_note ?? '');

  const emit = (sel: string[], note: string) => {
    onChange(
      { dietary_restrictions: sel, allergy_note: note || undefined },
      true,
    );
  };

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
    emit(next, allergyNote);
  };

  const showAllergy = selected.includes(ALLERGY);

  return (
    <StepShell
      title="Пищевые ограничения"
      subtitle="Нужно для подбора подходящих продуктов и рецептов. Можно пропустить"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {OPTIONS.map((opt) => {
            const active = selected.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => toggle(opt)}
                className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 active:scale-95"
                style={{
                  backgroundColor: active
                    ? theme.button_color
                    : theme.section_bg_color,
                  color: active ? theme.button_text_color : theme.text_color,
                  border: `1px solid ${active ? theme.button_color : theme.section_separator_color}`,
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {showAllergy && (
          <input
            type="text"
            value={allergyNote}
            onChange={(e) => {
              setAllergyNote(e.target.value);
              emit(selected, e.target.value);
            }}
            placeholder="На что аллергия? Например: орехи, морепродукты…"
            className="w-full rounded-2xl p-4 text-sm outline-none"
            style={{
              backgroundColor: theme.section_bg_color,
              color: theme.text_color,
              border: `1px solid ${theme.section_separator_color}`,
            }}
          />
        )}
      </div>
    </StepShell>
  );
};
