import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StepShell } from '../StepShell';
import { useTheme } from '@/shared/context/ThemeContext';
import type {
  OnboardingData,
  WeightUnit,
} from '@/shared/types/Onboarding';

const KG_MIN = 30;
const KG_MAX = 200;
const KG_DEFAULT = 70;

const kgToLbs = (kg: number) => Math.round(kg * 2.205);

interface Step4WeightProps {
  data: Partial<OnboardingData>;
  onChange: (patch: Partial<OnboardingData>, isValid: boolean) => void;
}

export const Step4Weight = ({ data, onChange }: Step4WeightProps) => {
  const theme = useTheme();
  const { t } = useTranslation('onboarding');
  const { t: tc } = useTranslation('common');

  const [kg, setKg] = useState(data.weight ?? KG_DEFAULT);
  const [unit, setUnit] = useState<WeightUnit>(data.weight_unit ?? 'kg');

  const emit = (newKg: number, newUnit: WeightUnit) => {
    onChange({ weight: newKg, weight_unit: newUnit }, true);
  };

  const handleSlider = (val: number) => {
    setKg(val);
    emit(val, unit);
  };

  const toggleUnit = () => {
    const next: WeightUnit = unit === 'kg' ? 'lbs' : 'kg';
    setUnit(next);
    emit(kg, next);
  };

  const displayValue = unit === 'kg' ? `${kg}` : `${kgToLbs(kg)}`;
  const displayUnit = unit === 'kg' ? tc('units.kg') : tc('units.lbs');

  return (
    <StepShell title={t('step4.title')} subtitle={t('step4.subtitle')}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span
            className="text-5xl font-bold tabular-nums"
            style={{ color: theme.text_color }}
          >
            {displayValue}
            <span
              className="ml-1 text-2xl font-normal"
              style={{ color: theme.hint_color }}
            >
              {displayUnit}
            </span>
          </span>
          <button
            onClick={toggleUnit}
            className="rounded-xl px-3 py-1.5 text-sm font-medium"
            style={{
              backgroundColor: theme.section_bg_color,
              color: theme.button_color,
            }}
          >
            {unit === 'kg' ? t('step4.to_imperial') : t('step4.to_metric')}
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <input
            type="range"
            min={KG_MIN}
            max={KG_MAX}
            value={kg}
            onChange={(e) => handleSlider(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full"
            style={{ accentColor: theme.button_color }}
          />
          <div
            className="flex justify-between text-xs"
            style={{ color: theme.hint_color }}
          >
            <span>
              {KG_MIN} {tc('units.kg')}
            </span>
            <span>
              {KG_MAX} {tc('units.kg')}
            </span>
          </div>
        </div>
      </div>
    </StepShell>
  );
};
