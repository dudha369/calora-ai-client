import { useState } from 'react';
import { StepShell } from '../StepShell';
import { useTheme } from '../../../context/ThemeContext';
import type { OnboardingData, HeightUnit } from '../../../interfaces/Onboarding';

const CM_MIN = 140;
const CM_MAX = 220;
const CM_DEFAULT = 170;

function cmToFeet(cm: number): string {
  const inches = cm / 2.54;
  const ft = Math.floor(inches / 12);
  const inc = Math.round(inches % 12);
  return `${ft}' ${inc}"`;
}

interface Props {
  data: Partial<OnboardingData>;
  onChange: (patch: Partial<OnboardingData>, isValid: boolean) => void;
}

export const Step3Height = ({ data, onChange }: Props) => {
  const theme = useTheme();
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
    <StepShell
      title="Твой рост"
      subtitle="Основной физический параметр для расчёта базового обмена веществ"
    >
      <div className="flex flex-col gap-5">
        {/* Value + unit toggle */}
        <div className="flex items-center justify-between">
          <span className="text-5xl font-bold tabular-nums" style={{ color: theme.text_color }}>
            {unit === 'cm' ? `${cm}` : cmToFeet(cm)}
            <span className="text-2xl font-normal ml-1" style={{ color: theme.hint_color }}>
              {unit === 'cm' ? 'см' : ''}
            </span>
          </span>
          <button
            onClick={toggleUnit}
            className="px-3 py-1.5 rounded-xl text-sm font-medium"
            style={{ backgroundColor: theme.section_bg_color, color: theme.button_color }}
          >
            {unit === 'cm' ? '→ Футы' : '→ См'}
          </button>
        </div>

        {/* Slider */}
        <div className="flex flex-col gap-2">
          <input
            type="range"
            min={CM_MIN}
            max={CM_MAX}
            value={cm}
            onChange={e => handleSlider(Number(e.target.value))}
            className="w-full h-2 rounded-full cursor-pointer appearance-none"
            style={{ accentColor: theme.button_color }}
          />
          <div className="flex justify-between text-xs" style={{ color: theme.hint_color }}>
            <span>{CM_MIN} см</span>
            <span>{CM_MAX} см</span>
          </div>
        </div>
      </div>
    </StepShell>
  );
};
