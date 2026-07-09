import { useEffect } from 'react';
import { StepShell } from '../StepShell';
import { OptionCard } from '../OptionCard';
import { useLanguageMode } from '@/shared/context/LanguageContext';
import { listLanguageOptions } from '@/shared/lib/language';
import type { OnboardingData } from '@/shared/types/Onboarding';

interface Step0LanguageProps {
  data: Partial<OnboardingData>;
  onChange: (patch: Partial<OnboardingData>, isValid: boolean) => void;
}

export const Step0Language = ({ onChange }: Step0LanguageProps) => {
  const { language, setLanguage } = useLanguageMode();
  const options = listLanguageOptions();

  // Шагу нечего сохранять в черновик онбординга — выбор языка уже
  // полностью обработан (и персистентен) через LanguageProvider.
  // Нужно только пометить шаг как проходимый.
  useEffect(() => {
    onChange({}, true);
  }, [onChange]);

  return (
    <StepShell title="Choose language" subtitle="Выбери язык · Обери мову">
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <OptionCard
            key={opt.code}
            label={`${opt.flag} ${opt.label}`}
            isSelected={language === opt.code}
            onClick={() => setLanguage(opt.code)}
          />
        ))}
      </div>
    </StepShell>
  );
};
