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
  /** Показывать мерную шкалу сбоку (для крупных мест — модалка выбора объёма) */
  showScale?: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// Кувшин с более плоской верхней кромкой, небольшим носиком слева,
// без лишнего "подбородка", и с ручкой, которая выглядит как отдельная внешняя дуга.
const BODY_D = [
  'M31 30',
  'C32 22 37 17 44 16',
  'C53 15 62 18 70 21',
  'C79 25 90 28 104 28',
  'H138',
  'C146 28 152 33 152 41',
  'V47',
  'C152 52 150 56 147 59',
  'C158 83 166 111 168 141',
  'V235',
  'C168 255 152 270 133 270',
  'H57',
  'C38 270 23 255 23 235',
  'V141',
  'C25 111 33 83 45 59',
  'C42 56 40 52 40 47',
  'V39',
  'C40 35 37 31 31 30',
  'Z',
].join(' ');

// Ручка должна читаться как внешняя Г-образная дуга с округлением,
// а не как тонкий штрих, уходящий внутрь корпуса.
const HANDLE_D = [
  'M145 72',
  'C167 74 184 90 190 113',
  'C193 125 193 139 193 156',
  'C193 173 193 188 193 205',
].join(' ');

const BODY_LEFT = 23;
const BODY_RIGHT = 168;
const BODY_TOP = 16;
const BODY_BOTTOM = 270;

const MAJOR_STOPS = [0, 0.25, 0.5, 0.75, 1] as const;
const MINOR_STOPS = Array.from({ length: 11 }, (_, i) => (i + 1) / 12);

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
  glassColor = 'rgba(255,255,255,0.05)',
  showScale = false,
}: WaterJugProps) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const uid = `wj${rawId}`;
  const rim = accentColor ?? waterColor;

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

  const viewBox = showScale ? '0 0 338 286' : '0 0 230 286';

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
            <stop offset="0%" stopColor={waterColor} stopOpacity="0.95" />
            <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id={`${uid}-glassStroke`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.34)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.12)" />
          </linearGradient>
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

        <ellipse cx="98" cy="276" rx="46" ry="6" fill="rgba(0,0,0,0.22)" />

        {/* Ручка рисуется до корпуса, чтобы её внутренняя часть пряталась за стенкой кувшина */}
        <path
          d={HANDLE_D}
          fill="none"
          stroke={`url(#${uid}-glassStroke)`}
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <g clipPath={`url(#${uid}-clip)`}>
          <rect
            x={BODY_LEFT - 12}
            y={fillTop}
            width={BODY_RIGHT - BODY_LEFT + 24}
            height={BODY_BOTTOM + 10 - fillTop}
            fill={`url(#${uid}-water)`}
            style={
              anim
                ? { animation: `${uid}-rise${anim.id} ${anim.duration}ms both` }
                : undefined
            }
          />

          <path
            d={`M ${BODY_LEFT - 1} ${fillTop + 1.5} C ${BODY_LEFT + 18} ${fillTop - 2}, ${BODY_LEFT + 34} ${fillTop + 4}, ${BODY_LEFT + 52} ${fillTop + 1.5} S ${BODY_LEFT + 98} ${fillTop - 2}, ${BODY_RIGHT + 4} ${fillTop + 1.5}`}
            fill="none"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        <path
          d={BODY_D}
          fill={glassColor}
          stroke={`url(#${uid}-glassStroke)`}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {showScale && (
          <g>
            {MINOR_STOPS.map((stop) => {
              const y = BODY_BOTTOM - stop * (BODY_BOTTOM - BODY_TOP);
              const active = fillPct / 100 >= stop - 0.001;
              return (
                <line
                  key={stop}
                  x1={BODY_RIGHT - 6}
                  y1={y}
                  x2={BODY_RIGHT + 14}
                  y2={y}
                  stroke={active ? rim : 'rgba(255,255,255,0.26)'}
                  strokeWidth={1.3}
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
                    x1={BODY_RIGHT - 6}
                    y1={y}
                    x2={BODY_RIGHT + 58}
                    y2={y}
                    stroke={active ? rim : 'rgba(255,255,255,0.38)'}
                    strokeWidth={active ? 2.5 : 2}
                    strokeLinecap="round"
                    style={{ transition: 'stroke 220ms ease-out' }}
                  />
                  <text
                    x={BODY_RIGHT + 66}
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
