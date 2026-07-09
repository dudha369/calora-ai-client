import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/context/ThemeContext';

interface CaloriesArcProps {
  value?: number;
  max?: number;
  radius: number;
  strokeWidth: number;
}

export function CaloriesArc({
  value = 0,
  max = 0,
  radius,
  strokeWidth,
}: CaloriesArcProps) {
  const theme = useTheme();
  const { t } = useTranslation('home_page');

  const arcLength = Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = arcLength - progress * arcLength;

  const width = radius * 2 + strokeWidth;
  const height = radius + strokeWidth;

  const cx = width / 2;
  const cy = radius + strokeWidth / 2;

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full max-w-70"
      >
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{
            color: theme.section_separator_color,
          }}
        />

        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={offset}
          className="transition-colors duration-500"
          style={{
            color: theme.button_color,
          }}
        />
      </svg>

      <div className="absolute top-2/3 left-1/2 flex -translate-x-1/2 -translate-y-2/3 flex-col items-center">
        <span
          className="text-[42px] font-semibold tracking-wide"
          style={{
            color: theme.text_color,
          }}
        >
          {Math.max(max - value, 0)}
        </span>
        <span className="text-lg" style={{ color: theme.subtitle_text_color }}>
          {t('calories_remaining')}
        </span>
      </div>
    </div>
  );
}
