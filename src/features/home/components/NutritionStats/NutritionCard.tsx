import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/context/ThemeContext';
import { ProgressBar } from './ProgressBar';

interface NutritionCardProps {
  title: string;
  value?: number;
  max?: number;
}

export const NutritionCard = ({
  title,
  value = 0,
  max = 0,
}: NutritionCardProps) => {
  const theme = useTheme();
  const { t } = useTranslation('common');

  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        backgroundColor: theme.section_bg_color,
      }}
    >
      <span className="text-base font-semibold">
        {value} {t('units.g')}
      </span>

      <ProgressBar value={value} max={max} width={80} strokeWidth={8} />

      <span
        style={{
          color: theme.subtitle_text_color,
        }}
      >
        {title}
      </span>
    </div>
  );
};
