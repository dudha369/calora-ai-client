import {useTheme} from "../context/ThemeContext.ts";

interface ProgressArcProps {
  value: number;
  max: number;
  radius: number;
  strokeWidth: number;
}

export function ProgressArc({
                              value,
                              max,
                              radius,
                              strokeWidth,
                            }: ProgressArcProps) {

  const theme = useTheme();

  const arcLength = Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = arcLength - progress * arcLength;

  // 1. Вычисляем точные размеры viewBox, чтобы линия любой толщины поместилась целиком
  const width = (radius * 2) + strokeWidth;
  const height = radius + strokeWidth;

  // 2. Находим идеальный центр, чтобы арка стояла ровно
  const cx = width / 2;
  const cy = radius + (strokeWidth / 2);

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full">

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-70 h-auto drop-shadow-sm"
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

      <div className="absolute flex flex-col items-center top-3/4 -translate-y-3/4 left-1/2 -translate-x-1/2">
        <span
          className="text-[42px] font-semibold tracking-wide"
          style={{
            color: theme.text_color
          }}
        >
          {max - value}
        </span>
        <span className="text-lg mt-1" style={{ color: theme.subtitle_text_color }}>
          calories remaining
        </span>
      </div>
    </div>
  );
}
