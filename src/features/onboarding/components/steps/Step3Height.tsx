import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StepShell } from '../StepShell';
import { useTheme } from '@/shared/context/ThemeContext';
import type {
  OnboardingData,
  HeightUnit,
} from '@/shared/types/Onboarding';

const CM_MIN = 140;
const CM_MAX = 220;
const CM_DEFAULT = 170;

function cmToFeet(cm: number): string {
  const inches = cm / 2.54;
  const ft = Math.floor(inches / 12);
  const inc = Math.round(inches % 12);
  return `${ft}' ${inc}"`;
}

interface Step3HeightProps {
  data: Partial<OnboardingData>;
  onChange: (patch: Partial<OnboardingData>, isValid: boolean) => void;
}

export const Step3Height = ({ data, onChange }: Step3HeightProps) => {
  const theme = useTheme();
  const { t } = useTranslation('onboarding');
  const { t: tc } = useTranslation('common');

  const [cm, setCm] = useState(data.height ?? CM_DEFAULT);
  const [unit, setUnit] = useState<HeightUnit>(data.height_unit ?? 'cm');

  const emit = (newCm: number, newUnit: HeightUnit) => {
    onChange({ height: newCm, height_unit: newUnit }, true);
  };

  const handleSlider = (val: number) => {
    setCm(val);
    emit(val, unit);
  };

  const toggleUnit = () => {
    const next: HeightUnit = unit === 'cm' ? 'ft' : 'cm';
    setUnit(next);
    emit(cm, next);
  };

  return (
    <StepShell title={t('step3.title')} subtitle={t('step3.subtitle')}>
      <div className="flex flex-col gap-5">
        {/* Value + unit toggle */}
        <div className="flex items-center justify-between">
          <span
            className="text-5xl font-bold tabular-nums"
            style={{ color: theme.text_color }}
          >
            {unit === 'cm' ? `${cm}` : cmToFeet(cm)}
            {unit === 'cm' && (
              <span
                className="ml-1 text-2xl font-normal"
                style={{ color: theme.hint_color }}
              >
                {tc('units.cm')}
              </span>
            )}
          </span>
          <button
            onClick={toggleUnit}
            className="rounded-xl px-3 py-1.5 text-sm font-medium"
            style={{
              backgroundColor: theme.section_bg_color,
              color: theme.button_color,
            }}
          >
            {unit === 'cm' ? t('step3.to_imperial') : t('step3.to_metric')}
          </button>
        </div>

        {/* Slider */}
        <div className="flex flex-col gap-2">
          <input
            type="range"
            min={CM_MIN}
            max={CM_MAX}
            value={cm}
            onChange={(e) => handleSlider(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full"
            style={{ accentColor: theme.button_color }}
          />
          <div
            className="flex justify-between text-xs"
            style={{ color: theme.hint_color }}
          >
            <span>
              {CM_MIN} {tc('units.cm')}
            </span>
            <span>
              {CM_MAX} {tc('units.cm')}
            </span>
          </div>
        </div>
      </div>
    </StepShell>
  );
};
