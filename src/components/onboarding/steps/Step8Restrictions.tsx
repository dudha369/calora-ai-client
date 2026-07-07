import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StepShell } from '../StepShell';
import { useTheme } from '../../../context/ThemeContext';
import type { OnboardingData } from '../../../interfaces/Onboarding';

// Language-agnostic keys stored in DB going forward
const OPTION_KEYS = [
  'none',
  'vegetarian',
  'vegan',
  'gluten_free',
  'lactose_free',
  'halal',
  'kosher',
  'allergy',
] as const;

type RestrictionKey = (typeof OPTION_KEYS)[number];

// One-time migration for users who onboarded in Russian
const LEGACY_MAP: Record<string, RestrictionKey> = {
  'Нет ограничений': 'none',
  Вегетарианство: 'vegetarian',
  Веганство: 'vegan',
  'Без глютена': 'gluten_free',
  'Без лактозы': 'lactose_free',
  Халяль: 'halal',
  Кошер: 'kosher',
  Аллергия: 'allergy',
};

function migrateValues(values: string[]): RestrictionKey[] {
  return values.map((v) => (LEGACY_MAP[v] ?? v) as RestrictionKey);
}

interface Step8RestrictionsProps {
  data: Partial<OnboardingData>;
  onChange: (patch: Partial<OnboardingData>, isValid: boolean) => void;
}

export const Step8Restrictions = ({
  data,
  onChange,
}: Step8RestrictionsProps) => {
  const theme = useTheme();
  const { t } = useTranslation('onboarding');

  const [selected, setSelected] = useState<RestrictionKey[]>(() =>
    migrateValues(data.dietary_restrictions ?? []),
  );
  const [allergyNote, setAllergyNote] = useState(data.allergy_note ?? '');

  const emit = (sel: RestrictionKey[], note: string) =>
    onChange(
      { dietary_restrictions: sel, allergy_note: note || undefined },
      true,
    );

  const toggle = (key: RestrictionKey) => {
    let next: RestrictionKey[];
    if (key === 'none') {
      next = selected.includes('none') ? [] : ['none'];
    } else {
      const without = selected.filter((s) => s !== 'none');
      next = without.includes(key)
        ? without.filter((s) => s !== key)
        : [...without, key];
    }
    setSelected(next);
    emit(next, allergyNote);
  };

  return (
    <StepShell title={t('step8.title')} subtitle={t('step8.subtitle')}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {OPTION_KEYS.map((key) => {
            const active = selected.includes(key);
            return (
              <button
                key={key}
                onClick={() => toggle(key)}
                className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 active:scale-95"
                style={{
                  backgroundColor: active
                    ? theme.button_color
                    : theme.section_bg_color,
                  color: active ? theme.button_text_color : theme.text_color,
                  border: `1px solid ${active ? theme.button_color : theme.section_separator_color}`,
                }}
              >
                {t(`step8.${key}`)}
              </button>
            );
          })}
        </div>

        {selected.includes('allergy') && (
          <input
            type="text"
            value={allergyNote}
            onChange={(e) => {
              setAllergyNote(e.target.value);
              emit(selected, e.target.value);
            }}
            placeholder={t('step8.allergy_placeholder')}
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
