import { useEffect } from 'react';
import { StepShell } from '../StepShell';
import { OptionCard } from '../OptionCard';
import { initData } from '@tma.js/sdk-react';
import type { OnboardingData } from '../../../interfaces/Onboarding';

interface Props {
  data: Partial<OnboardingData>;
  onChange: (patch: Partial<OnboardingData>, isValid: boolean) => void;
}

const OPTIONS: { value: string; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'ru', label: 'Русский', flag: '🇷🇺' },
  { value: 'ua', label: 'Українська', flag: '🇺🇦' },
];

export const Step0Language = ({ data, onChange }: Props) => {
  // Auto-select from Telegram language if not yet chosen
  useEffect(() => {
    if (data.language) return;
    try {
      const tgLang = initData
        ?.user()
        ?.language_code?.split('-')[0]
        ?.toLowerCase();
      const match = OPTIONS.find((o) => o.value === tgLang);
      if (match) {
        onChange({ language: match.value }, true);
      }
    } catch {
      // initData not available
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <StepShell title="Choose language" subtitle="Выбери язык · Обери мову">
      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            label={`${opt.flag} ${opt.label}`}
            isSelected={data.language === opt.value}
            onClick={() => onChange({ language: opt.value }, true)}
          />
        ))}
      </div>
    </StepShell>
  );
};
