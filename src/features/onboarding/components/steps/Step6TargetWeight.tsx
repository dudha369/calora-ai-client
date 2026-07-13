import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StepShell } from '../StepShell';
import { useTheme } from '@/shared/context/ThemeContext';
import type { OnboardingData } from '@/shared/types/Onboarding';

interface Step6TargetWeightProps {
  data: Partial<OnboardingData>;
  onChange: (patch: Partial<OnboardingData>, isValid: boolean) => void;
}

export const Step6TargetWeight = ({
  data,
  onChange,
}: Step6TargetWeightProps) => {
  const theme = useTheme();
  const { t } = useTranslation('onboarding');
  const { t: tc } = useTranslation('common');

  const [raw, setRaw] = useState(data.target_weight?.toString() ?? '');

  const isLose = data.goal === 'lose';
  const unitLabel =
    data.weight_unit === 'lbs' ? tc('units.lbs') : tc('units.kg');
  const subtitle = data.weight
    ? `${isLose ? t('step6.subtitle_lose') : t('step6.subtitle_gain')} ${t('step6.current_weight', { weight: data.weight, unit: unitLabel })}`
    : isLose
      ? t('step6.subtitle_lose')
      : t('step6.subtitle_gain');

  const handleChange = (val: string) => {
    setRaw(val);
    const n = parseFloat(val);
    const valid = !isNaN(n) && n > 0 && n < 400;
    onChange({ target_weight: valid ? n : undefined }, valid);
  };

  const hasError =
    raw !== '' &&
    (() => {
      const n = parseFloat(raw);
      return isNaN(n) || n <= 0;
    })();

  return (
    <StepShell title={t('step6.title')} subtitle={subtitle}>
      <div className="flex flex-col gap-2">
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            value={raw}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={
              isLose ? t('step6.placeholder_lose') : t('step6.placeholder_gain')
            }
            className="w-full rounded-2xl p-4 pr-20 text-lg font-medium"
            style={{
              backgroundColor: theme.section_bg_color,
              color: theme.text_color,
              border: `1.5px solid ${hasError ? theme.destructive_text_color : theme.section_separator_color}`,
            }}
          />
          <span
            className="absolute top-1/2 right-4 -translate-y-1/2 font-medium"
            style={{ color: theme.hint_color }}
          >
            {unitLabel}
          </span>
        </div>
        {hasError && (
          <p
            className="px-1 text-sm"
            style={{ color: theme.destructive_text_color }}
          >
            {t('step6.error')}
          </p>
        )}
      </div>
    </StepShell>
  );
};
