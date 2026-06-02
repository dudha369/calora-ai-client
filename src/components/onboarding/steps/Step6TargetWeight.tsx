import { useState } from 'react';
import { StepShell } from '../StepShell';
import { useTelegram } from '../../../hooks/useTelegram';
import type { OnboardingData } from '../../../interfaces/Onboarding';

interface Props {
  data: Partial<OnboardingData>;
  onChange: (patch: Partial<OnboardingData>, isValid: boolean) => void;
}

export const Step6TargetWeight = ({ data, onChange }: Props) => {
  const { theme } = useTelegram();
  const [raw, setRaw] = useState(data.target_weight?.toString() ?? '');

  const isLose = data.goal === 'lose';
  const unitLabel = data.weight_unit === 'lbs' ? 'фунт' : 'кг';
  const currentDisplay = data.weight ? `Текущий вес: ${data.weight} ${unitLabel}` : '';

  const handleChange = (val: string) => {
    setRaw(val);
    const n = parseFloat(val);
    const valid = !isNaN(n) && n > 0 && n < 400;
    onChange({ target_weight: valid ? n : undefined }, valid);
  };

  const hasError = raw !== '' && (() => {
    const n = parseFloat(raw);
    return isNaN(n) || n <= 0;
  })();

  return (
    <StepShell
      title="Желаемый вес"
      subtitle={`Хочешь ${isLose ? 'похудеть до' : 'набрать до'} какого веса? ${currentDisplay}`}
    >
      <div className="flex flex-col gap-2">
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            value={raw}
            onChange={e => handleChange(e.target.value)}
            placeholder={isLose ? 'Например, 65' : 'Например, 85'}
            className="w-full p-4 rounded-2xl text-lg font-medium outline-none pr-20"
            style={{
              backgroundColor: theme.section_bg_color,
              color: theme.text_color,
              border: `1.5px solid ${hasError ? '#ff3b30' : theme.section_separator_color}`,
            }}
          />
          <span
            className="absolute right-4 top-1/2 -translate-y-1/2 font-medium"
            style={{ color: theme.hint_color }}
          >
            {unitLabel}
          </span>
        </div>
        {hasError && (
          <p className="text-sm px-1" style={{ color: '#ff3b30' }}>
            Введи корректный вес
          </p>
        )}
      </div>
    </StepShell>
  );
};
