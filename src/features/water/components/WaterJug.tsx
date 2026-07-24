import { memo, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { MARKER_WATER_COLOR } from '@/shared/constants/markers';

/**
 * Интерактивный мерный кувшин (SVG).
 *
 * Форма — по образцу простого линейного эскиза: практически прямые бока,
 * скругление только у самого дна, волнистая кромка горлышка. Специально
 * без "плечо → брюхо" кривой — именно она раньше ломалась и превращала
 * кувшин то в шар с коробкой сверху, то в мешанину.
 *
 * Презентационный компонент: сам следит за valueMl и при каждом изменении
 * проигрывает анимацию "подъём с небольшим перелётом — быстрая посадка на
 * нужный уровень". Ничего вызывать вручную не нужно.
 */

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

// ─── Геометрия кувшина ───────────────────────────────────────────────────
// Волнистая кромка (2 пологие волны) → почти прямые бока (простые прямые
// линии, без риска сломать кривые) → скруглённое дно.
const BODY_D =
  'M50,34 ' +
  'Q60,20 72,32 Q84,44 96,32 Q108,20 120,30 Q135,38 150,34 ' +
  'L160,260 ' +
  'C165,280 155,296 138,300 ' +
  'C124,304 76,304 62,300 ' +
  'C45,296 35,280 40,260 ' +
  'L50,34 Z';

// Ручка крепится ровно в тех же точках, что лежат на самом контуре тела
// (152,70 и 157,195) — касается стенок, не проваливается внутрь и не висит
// в воздухе. Нижняя точка — на уровне декоративной волнистой полосы.
const HANDLE_D = 'M152,70 C206,66 218,110 214,140 C210,168 195,190 157,195';

// Декоративная волнистая полоса-блик — по высоте совпадает с нижней точкой
// ручки, стилистически как на референсе (похожа на блик, а не на кривую
// линию воды).
const STRIPE_D = 'M43,195 Q60,187 76,195 Q92,203 108,195 Q124,187 157,195';

const BODY_LEFT = 35;
const BODY_RIGHT = 165;
const BODY_TOP = 34;
const BODY_BOTTOM = 302;

const SCALE_STOPS = [0, 0.25, 0.5, 0.75, 1] as const; // снизу вверх

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

  // ── Анимация: подъём с небольшим (умеренным!) перелётом за целевой ──
  // ── уровень, затем быстрая посадка ровно на него. Один keyframe на ──
  // ── изменение — никаких параллельных transition/transform. ──────────
  const prevValueRef = useRef(valueMl);
  const animIdRef = useRef(0);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [anim, setAnim] = useState<{
    id: number;
    from: number;
    overshoot: number;
    to: number;
  } | null>(null);

  useLayoutEffect(() => {
    if (valueMl === prevValueRef.current) return;

    const from = fillTopFor(prevValueRef.current, chartMax);
    const to = fillTopFor(valueMl, chartMax);
    // Перелёт умеренный и ограниченный сверху — раньше здесь было слишком
    // много (до 14px), из-за чего казалось, что вода "взлетает" выше, чем
    // нужно.
    const overshootPx = clamp(Math.abs(to - from) * 0.1, 3, 8);
    const overshoot = to > from ? to + overshootPx : to - overshootPx;

    animIdRef.current += 1;
    setAnim({ id: animIdRef.current, from, overshoot, to });
    prevValueRef.current = valueMl;

    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    clearTimerRef.current = setTimeout(() => setAnim(null), 660);

    return () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, [valueMl, chartMax]);

  const viewBox = showScale ? '0 10 320 310' : '0 10 260 310';

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
            <stop offset="0%" stopColor={waterColor} stopOpacity="0.92" />
            <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.88" />
          </linearGradient>
          <linearGradient id={`${uid}-glassStroke`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.34)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.10)" />
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
              68%  { y: ${anim.overshoot}; height: ${BODY_BOTTOM + 10 - anim.overshoot};
                     animation-timing-function: cubic-bezier(0.22,1,0.36,1); }
              100% { y: ${anim.to}; height: ${BODY_BOTTOM + 10 - anim.to}; }
            }
          `}</style>
        )}

        {/* тень на "столе" */}
        <ellipse cx="100" cy="312" rx="46" ry="7" fill="rgba(0,0,0,0.22)" />

        {/* ручка — крепится ровно в тех же точках, что и контур тела */}
        <path
          d={HANDLE_D}
          fill="none"
          stroke={`url(#${uid}-glassStroke)`}
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* вода, обрезанная по силуэту кувшина */}
        <g clipPath={`url(#${uid}-clip)`}>
          <rect
            x={BODY_LEFT - 10}
            y={fillTop}
            width={BODY_RIGHT - BODY_LEFT + 20}
            height={BODY_BOTTOM + 10 - fillTop}
            fill={`url(#${uid}-water)`}
            style={
              anim
                ? { animation: `${uid}-rise${anim.id} 600ms both` }
                : undefined
            }
          />
        </g>

        {/* контур стекла поверх воды */}
        <path
          d={BODY_D}
          fill={glassColor}
          stroke={`url(#${uid}-glassStroke)`}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />

        {/* декоративная волнистая полоса-блик — на уровне низа ручки */}
        <path
          d={STRIPE_D}
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* мерная шкала — только в развёрнутых местах (например модалка) */}
        {showScale && (
          <g>
            <line
              x1="240"
              y1={BODY_TOP}
              x2="240"
              y2={BODY_BOTTOM}
              stroke="rgba(255,255,255,0.16)"
              strokeWidth="1"
            />
            {SCALE_STOPS.map((stop, i) => {
              const y = BODY_BOTTOM - stop * (BODY_BOTTOM - BODY_TOP);
              const isMax = i === SCALE_STOPS.length - 1;
              const active = fillPct / 100 >= stop - 0.001;
              return (
                <g key={stop}>
                  <line
                    x1="232"
                    y1={y}
                    x2="248"
                    y2={y}
                    stroke={active ? rim : 'rgba(255,255,255,0.35)'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{ transition: 'stroke 300ms ease-out' }}
                  />
                  <text
                    x="256"
                    y={y + 4}
                    fontSize="12"
                    fontWeight={active ? 600 : 400}
                    fontFamily="inherit"
                    fill={active ? rim : 'rgba(255,255,255,0.55)'}
                    style={{ transition: 'fill 300ms ease-out' }}
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
