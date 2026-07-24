import { useTheme } from '@/shared/context/ThemeContext';

interface ProgressBarProps {
  value: number;
  max: number;
  width: number;
  strokeWidth: number;
}

export const ProgressBar = ({
  value,
  max,
  width,
  strokeWidth,
}: ProgressBarProps) => {
  const theme = useTheme();

  const safeMax = Math.max(max, 1);
  const safeValue = Math.min(Math.max(value, 0), safeMax);

  const progressWidth = (safeValue / safeMax) * width;
  const borderRadius = strokeWidth / 2 + 1;

  return (
    <svg
      width={width}
      height={strokeWidth}
      viewBox={`0 0 ${width} ${strokeWidth}`}
      className="h-auto py-0.5"
    >
      <rect
        x={0}
        y={0}
        width={width}
        height={strokeWidth}
        rx={borderRadius}
        fill={theme.section_separator_color}
      />

      <rect
        x={0}
        y={0}
        width={progressWidth}
        height={strokeWidth}
        rx={borderRadius}
        fill={theme.accent_text_color}
      />
    </svg>
  );
};
