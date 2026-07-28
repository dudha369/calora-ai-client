import { memo, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { MARKER_WATER_COLOR } from '@/shared/constants/markers';

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

// Beaker / measuring-cup silhouette: wider top, narrower bottom, no handle.
// This keeps the scale readable and matches the reference image more closely.
const BODY_D = [
  'M54 26',
  'C60 20 70 17 84 17',
  'H112',
  'C126 17 136 20 142 26',
  'C145 29 146 33 145 38',
  'L136 233',
  'C135 249 122 261 106 261',
  'H82',
  'C66 261 53 249 52 233',
  'L43 38',
  'C42 33 43 29 46 26',
  'Z',
].join(' ');

const BODY_LEFT = 43;
const BODY_RIGHT = 145;
const BODY_TOP = 17;
const BODY_BOTTOM = 261;

// The reference uses a tidy, evenly spaced scale: MAX, 1500, 1000, 500, 0.
const MAJOR_STOPS = [1, 0.75, 0.5, 0.25, 0] as const;
const MINOR_STOPS = [0.875, 0.625, 0.375, 0.125] as const;

function fillTopFor(value: number, chartMax: number): number {
  const pct = clamp((value / Math.max(chartMax, 1)) * 100, 0, 100);
  const height = ((BODY_BOTTOM - BODY_TOP) * pct) / 100;
  return BODY_BOTTOM - height;
}

const WaterJug = memo(function WaterJug({
  valueMl,
  goalMl = 2000,
  maxMl,
  className,
  accentColor,
  waterColor = MARKER_WATER_COLOR,
  glassColor,
  showScale = false,
}: WaterJugProps) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const uid = `wj${rawId}`;
  const rim = accentColor ?? waterColor;
  const outline = 'rgba(86, 96, 110, 0.96)';
  const fillBase = glassColor ?? 'rgba(255,255,255,0.04)';

  const chartMax = maxMl ?? Math.max(goalMl, 2000);
  const fillPct = useMemo(
    () => clamp((valueMl / Math.max(chartMax, 1)) * 100, 0, 100),
    [valueMl, chartMax],
  );
  const fillTop = fillTopFor(valueMl, chartMax);

  const prevValueRef = useRef(valueMl);
  const animIdRef = useRef(0);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [anim, setAnim] = useState<{
    id: number;
    from: number;
    overshoot: number;
    to: number;
    duration: number;
  } | null>(null);

  useLayoutEffect(() => {
    const prev = prevValueRef.current;
    if (valueMl === prev) return;

    const from = fillTopFor(prev, chartMax);
    const to = fillTopFor(valueMl, chartMax);
    const deltaMl = Math.abs(valueMl - prev);
    const deltaPx = Math.abs(to - from);
    const isIncrease = valueMl > prev;

    const shouldAnimate = isIncrease
      ? deltaMl >= Math.max(20, chartMax * 0.012) && deltaPx >= 8
      : deltaMl >= 1;

    animIdRef.current += 1;

    if (!shouldAnimate) {
      setAnim(null);
      prevValueRef.current = valueMl;
      return;
    }

    const overshootPx = clamp(deltaPx * 0.08, 2, 6);
    const overshoot = isIncrease ? to - overshootPx : to + overshootPx;
    const duration = isIncrease ? 600 : 460;

    setAnim({ id: animIdRef.current, from, overshoot, to, duration });
    prevValueRef.current = valueMl;

    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    clearTimerRef.current = setTimeout(() => setAnim(null), duration);

    return () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, [valueMl, chartMax]);

  const viewBox = showScale ? '0 0 352 286' : '0 0 240 286';

  return (
    <div
      className={cn('relative select-none', className)}
      aria-label={`Water jug: ${Math.round(valueMl)} ml of ${Math.round(chartMax)} ml`}
    >
      <svg
        viewBox={viewBox}
        className="block h-full w-full overflow-visible"
        role="img"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={`${uid}-water`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={waterColor} stopOpacity="0.96" />
            <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id={`${uid}-glassStroke`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={outline} />
            <stop offset="100%" stopColor="rgba(86, 96, 110, 0.74)" />
          </linearGradient>
          <linearGradient id={`${uid}-glassFill`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={fillBase} />
            <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </linearGradient>
          <filter
            id={`${uid}-shadow`}
            x="-20%"
            y="-20%"
            width="160%"
            height="160%"
          >
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="2.1"
              floodColor="rgba(0,0,0,0.22)"
            />
          </filter>
          <clipPath id={`${uid}-clip`}>
            <path d={BODY_D} />
          </clipPath>
        </defs>

        {anim && (
          <style>{`
            @keyframes ${uid}-rise${anim.id} {
              0%   { y: ${anim.from}; height: ${BODY_BOTTOM + 10 - anim.from};
                     animation-timing-function: cubic-bezier(0.45,0,0.85,0.35); }
              70%  { y: ${anim.overshoot}; height: ${BODY_BOTTOM + 10 - anim.overshoot};
                     animation-timing-function: cubic-bezier(0.22,1,0.36,1); }
              100% { y: ${anim.to}; height: ${BODY_BOTTOM + 10 - anim.to}; }
            }
          `}</style>
        )}

        <ellipse cx="94" cy="275" rx="42" ry="6" fill="rgba(0,0,0,0.22)" />

        <g filter={`url(#${uid}-shadow)`}>
          <g clipPath={`url(#${uid}-clip)`}>
            <rect
              x={BODY_LEFT - 10}
              y={fillTop}
              width={BODY_RIGHT - BODY_LEFT + 20}
              height={BODY_BOTTOM + 10 - fillTop}
              fill={`url(#${uid}-water)`}
              style={
                anim
                  ? {
                      animation: `${uid}-rise${anim.id} ${anim.duration}ms both`,
                    }
                  : undefined
              }
            />

            <path
              d={`M ${BODY_LEFT + 1} ${fillTop + 1.5} C ${BODY_LEFT + 16} ${fillTop - 1}, ${BODY_LEFT + 28} ${fillTop + 3.5}, ${BODY_LEFT + 42} ${fillTop + 1.5} S ${BODY_LEFT + 72} ${fillTop - 1}, ${BODY_RIGHT - 1} ${fillTop + 1.5}`}
              fill="none"
              stroke="rgba(255,255,255,0.16)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>

          <path
            d={BODY_D}
            fill={`url(#${uid}-glassFill)`}
            stroke={`url(#${uid}-glassStroke)`}
            strokeWidth="3.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          <path
            d={BODY_D}
            fill="none"
            stroke="rgba(255,255,255,0.09)"
            strokeWidth="1.15"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </g>

        {showScale && (
          <g>
            {MINOR_STOPS.map((stop) => {
              const y = BODY_BOTTOM - stop * (BODY_BOTTOM - BODY_TOP);
              const active = fillPct / 100 >= stop - 0.001;
              return (
                <line
                  key={stop}
                  x1={BODY_RIGHT - 2}
                  y1={y}
                  x2={BODY_RIGHT + 16}
                  y2={y}
                  stroke={active ? rim : 'rgba(255,255,255,0.24)'}
                  strokeWidth={1.35}
                  strokeLinecap="round"
                />
              );
            })}

            {MAJOR_STOPS.map((stop, i) => {
              const y = BODY_BOTTOM - stop * (BODY_BOTTOM - BODY_TOP);
              const isMax = i === MAJOR_STOPS.length - 1;
              const active = fillPct / 100 >= stop - 0.001;
              return (
                <g key={stop}>
                  <line
                    x1={BODY_RIGHT - 2}
                    y1={y}
                    x2={BODY_RIGHT + 50}
                    y2={y}
                    stroke={active ? rim : 'rgba(255,255,255,0.40)'}
                    strokeWidth={active ? 2.5 : 2}
                    strokeLinecap="round"
                    style={{ transition: 'stroke 220ms ease-out' }}
                  />
                  <text
                    x={BODY_RIGHT + 58}
                    y={y + 4}
                    fontSize={isMax ? '12' : '11'}
                    fontWeight={active ? 600 : 400}
                    fontFamily="inherit"
                    fill={active ? rim : 'rgba(255,255,255,0.56)'}
                    style={{ transition: 'fill 220ms ease-out' }}
                  >
                    {isMax ? 'MAX' : `${Math.round(chartMax * stop)} мл`}
                  </text>
                </g>
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
});

export type { WaterJugProps };
export { WaterJug };
