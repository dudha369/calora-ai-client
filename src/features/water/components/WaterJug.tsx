import { memo, useMemo } from 'react';
import { cn } from '@/shared/lib/cn';

type WaterJugProps = {
  valueMl: number;
  goalMl?: number;
  maxMl?: number;
  className?: string;
  accentColor?: string;
  waterColor?: string;
  glassColor?: string;
  showScale?: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toFillPercent(valueMl: number, maxMl: number) {
  if (maxMl <= 0) return 0;
  return clamp((valueMl / maxMl) * 100, 0, 100);
}

const WaterJug = memo(function WaterJug({
  valueMl,
  goalMl = 2000,
  maxMl,
  className,
  accentColor = 'var(--water-marker-color, #4ea1ff)',
  waterColor = 'rgba(78, 161, 255, 0.86)',
  glassColor = 'rgba(255, 255, 255, 0.05)',
  showScale = true,
}: WaterJugProps) {
  const chartMax = maxMl ?? Math.max(goalMl, 2000);
  const fillPct = useMemo(
    () => toFillPercent(valueMl, chartMax),
    [valueMl, chartMax],
  );

  const bodyTop = 18;
  const bodyBottom = 116;
  const bodyHeight = bodyBottom - bodyTop;
  const fillHeight = (fillPct / 100) * bodyHeight;
  const fillTop = bodyBottom - fillHeight;

  const tickMarks = showScale
    ? [0, 25, 50, 75, 100].map((percent) => ({
        percent,
        y: bodyBottom - (percent / 100) * bodyHeight,
      }))
    : [];

  return (
    <div
      className={cn(
        'relative flex items-center justify-end select-none',
        className,
      )}
      aria-label={`Water jug illustration: ${Math.round(valueMl)} ml out of ${Math.round(chartMax)} ml`}
    >
      <svg
        viewBox="0 0 128 128"
        className="h-full w-full overflow-visible"
        role="img"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <clipPath id="jug-clip">
            <path d="M 48 16 H 76 C 80 16 83 18 85 21 C 86 23 87 26 87 30 C 87 34 86 38 85 43 C 84 49 84 55 85 61 C 87 74 89 86 89 98 C 89 108 83 115 74 116 H 50 C 41 115 35 108 35 98 C 35 86 37 74 39 61 C 40 55 40 49 39 43 C 38 38 37 34 37 30 C 37 26 38 23 39 21 C 41 18 44 16 48 16 Z" />
          </clipPath>
        </defs>

        <path
          d="M 48 16 H 76 C 80 16 83 18 85 21 C 86 23 87 26 87 30 C 87 34 86 38 85 43 C 84 49 84 55 85 61 C 87 74 89 86 89 98 C 89 108 83 115 74 116 H 50 C 41 115 35 108 35 98 C 35 86 37 74 39 61 C 40 55 40 49 39 43 C 38 38 37 34 37 30 C 37 26 38 23 39 21 C 41 18 44 16 48 16 Z"
          fill={glassColor}
          stroke={accentColor}
          strokeWidth="2.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        <path
          d="M 84 24 C 91 24 96 22 101 20"
          fill="none"
          stroke={accentColor}
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        <path
          d="M 43 16 C 45 12 50 10 55 10 H 69 C 75 10 79 12 81 16"
          fill="none"
          stroke={accentColor}
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        <path
          d="M 86 30 C 92 30 97 27 101 24"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <g clipPath="url(#jug-clip)">
          <rect
            x="35"
            y={fillTop}
            width="54"
            height={bodyBottom - fillTop}
            rx="8"
            fill={waterColor}
          />

          <path
            d={`M 35 ${fillTop + 5} C 44 ${fillTop + 1}, 52 ${fillTop + 7}, 61 ${fillTop + 4} C 69 ${fillTop + 1}, 78 ${fillTop + 7}, 89 ${fillTop + 4} V ${bodyBottom} H 35 Z`}
            fill="rgba(255,255,255,0.08)"
            opacity={fillPct > 0 ? 1 : 0}
            style={{ transition: 'opacity 180ms ease' }}
          />

          <circle
            cx="48"
            cy={Math.max(bodyTop + 22, fillTop + 11)}
            r={fillPct > 12 ? 1.2 : 0}
            fill="rgba(255,255,255,0.45)"
            opacity={fillPct > 12 ? 1 : 0}
          />

          <circle
            cx="67"
            cy={Math.max(bodyTop + 30, fillTop + 18)}
            r={fillPct > 28 ? 1 : 0}
            fill="rgba(255,255,255,0.35)"
            opacity={fillPct > 28 ? 1 : 0}
          />
        </g>

        <path
          d="M 47 22 H 74"
          fill="none"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {showScale && (
          <g>
            {tickMarks.map((mark) => (
              <g key={mark.percent}>
                <line
                  x1="97"
                  y1={mark.y}
                  x2="103"
                  y2={mark.y}
                  stroke="rgba(255,255,255,0.22)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <text
                  x="105"
                  y={mark.y + 1.4}
                  fontSize="6"
                  fill="rgba(255,255,255,0.52)"
                  fontFamily="inherit"
                >
                  {mark.percent === 100 ? 'MAX' : `${mark.percent}%`}
                </text>
              </g>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
});

export type { WaterJugProps };
export { WaterJug };
