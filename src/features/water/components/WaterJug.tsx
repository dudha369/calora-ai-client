import { memo, useId, useLayoutEffect, useRef, useState } from 'react';
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
  /** Floating "X ml" pill in the centre. Off by default — your UI already shows
   *  the value, so the pill would just duplicate it. Turn on for standalone use. */
  showValuePill?: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// ── Geometry ────────────────────────────────────────────────────────────────
// Mirror-symmetric about CX (only the spout breaks symmetry, on the left).
//
// What was wrong before and why this version is different:
//  - v2 had a SPIKE spout (tip ~10px above the rim → pointed up-left).
//  - v3 over-corrected: it flattened the body into a 1:1.24 bucket (top much
//    wider than bottom = "popcorn cup") AND grew the spout into a long sharp
//    spear pointing left. Both read as "not a beaker".
//  - v4 (this): body is a MODERATELY tall cylinder, walls NEARLY VERTICAL
//    (taper only 8px/side, 150∓70 at top → 150∓62 at bottom), softly rounded
//    floor, ratio ≈ 140:194 ≈ 1:1.39 — a real beaker, neither a tube nor a
//    bucket. The spout is a SHORT BLUNT lip (tip ≈ x64, rise ≈ 6px, ~18° up
//    from horizontal): a little pouring nub, not a spear and not a spike.
const CX = 150;

const WATER_TOP = 60; // inner top = full (MAX)
const WATER_BOTTOM = 244; // inner floor = empty (0)
const EXTRA = WATER_BOTTOM - WATER_TOP + 12; // keeps the rect floor below the clip during the fall anim

// Visible glass outline. The spout's top edge runs only ~20px left of the rim
// with a blunt rounded tip, so it's a lip — not the 35px spear v3 produced.
const OUTLINE_D = [
  'M 216 56', // rim right (after the rounded corner)
  'L 84 56', // rim top edge, horizontal, going left
  'C 78 55 72 52 66 50', // spout top edge — short, slight rise (≈18°)
  'Q 62 49 64 55', // blunt rounded spout tip (a nub, not a point)
  'C 70 62 76 67 80 72', // spout inner edge back to the left wall top
  'L 88 232', // left wall — nearly vertical (80 → 88)
  'Q 89 250 107 250', // soft bottom-left corner
  'L 193 250', // flat floor
  'Q 211 250 212 232', // soft bottom-right corner (mirror)
  'L 220 72', // right wall — nearly vertical (220 → 212, mirror)
  'Q 221 56 216 56', // rounded top-right corner
  'Z',
].join(' ');

// Water clip — flat top, inset a few px from the walls/floor so the fill never
// touches the stroke (that inset reads as glass thickness).
const CLIP_D = [
  'M 82 60',
  'L 218 60',
  'L 210 232',
  'Q 209 244 197 244',
  'L 103 244',
  'Q 91 244 90 232',
  'Z',
].join(' ');

// Scale stops as fractions of chartMax. Reference layout: MAX / .75 / .5 / .25 / 0,
// with short unlabeled ticks in between. (Unchanged from v3 — you liked it.)
const MAJOR_STOPS = [1, 0.75, 0.5, 0.25, 0] as const;
const MINOR_STOPS = [0.875, 0.625, 0.375, 0.125] as const;

// Ticks on a FIXED x just right of the widest point — short, uniform, they
// don't chase the (now nearly vertical) wall.
const TICK_X1 = 236;
const TICK_X2_MAJOR = 250;
const TICK_X2_MINOR = 245;
const LABEL_X = 258;

function yForStop(stop: number): number {
  return WATER_TOP + (1 - stop) * (WATER_BOTTOM - WATER_TOP);
}

function fillTopFor(value: number, chartMax: number): number {
  const pct = clamp(value / Math.max(chartMax, 1), 0, 1);
  return WATER_BOTTOM - pct * (WATER_BOTTOM - WATER_TOP);
}

const WaterJug = memo(function WaterJug({
  valueMl,
  goalMl = 2000,
  maxMl,
  className,
  waterColor = MARKER_WATER_COLOR,
  glassColor,
  showScale = false,
  showValuePill = false,
}: WaterJugProps) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const uid = `wj${rawId}`;

  const outline = 'rgba(148, 163, 184, 0.6)'; // muted slate, like the ref
  const scaleColor = 'rgba(148, 163, 184, 0.55)'; // static grey scale
  const emptyFill = glassColor ?? 'rgba(255,255,255,0.02)';

  const chartMax = maxMl ?? Math.max(goalMl, 2000);
  const fillTop = fillTopFor(valueMl, chartMax);

  // ── Fill animation ──────────────────────────────────────────────────────
  // transform: translateY() on the water group (water + meniscus + highlight
  // move together, no desync). translate in px on an SVG <g> resolves to user
  // units in both Chromium and WebKit → survives iOS Telegram's WKWebView.
  const prevValueRef = useRef(valueMl);
  const animIdRef = useRef(0);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [anim, setAnim] = useState<{
    id: number;
    offset: number;
    overshootY: number;
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

    const bounce = clamp(deltaPx * 0.06, 2, 5);
    const overshootY = isIncrease ? -bounce : bounce;
    const duration = isIncrease ? 600 : 460;

    setAnim({ id: animIdRef.current, offset: from - to, overshootY, duration });
    prevValueRef.current = valueMl;

    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    clearTimerRef.current = setTimeout(() => setAnim(null), duration);

    return () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, [valueMl, chartMax]);

  const t = fillTop;
  const surfaceD = `M 78 ${t} C 108 ${t - 2} 138 ${t + 2} 168 ${t} S 214 ${t - 1.5} 224 ${t}`;

  // Without the scale the viewBox hugs body+spout and stays near-square, so a
  // tall container can't stretch the beaker into a tube.
  const viewBox = showScale ? '56 44 256 212' : '56 44 170 212';

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
            <stop offset="55%" stopColor={waterColor} stopOpacity="0.92" />
            <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.94" />
          </linearGradient>
          <linearGradient id={`${uid}-meniscus`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <clipPath id={`${uid}-clip`}>
            <path d={CLIP_D} />
          </clipPath>
        </defs>

        {anim && (
          <style>{`
            @keyframes ${uid}-rise${anim.id} {
              0%   { transform: translateY(${anim.offset}px);
                     animation-timing-function: cubic-bezier(0.45, 0, 0.85, 0.35); }
              70%  { transform: translateY(${anim.overshootY}px);
                     animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1); }
              100% { transform: translateY(0px); }
            }
          `}</style>
        )}

        {/* Water + meniscus + surface highlight, clipped to the inset body. */}
        <g clipPath={`url(#${uid}-clip)`}>
          <g
            style={
              anim
                ? { animation: `${uid}-rise${anim.id} ${anim.duration}ms both` }
                : undefined
            }
          >
            <rect
              x={78}
              y={t}
              width={144}
              height={WATER_BOTTOM + EXTRA - t}
              fill={`url(#${uid}-water)`}
            />
            <rect
              x={78}
              y={t}
              width={144}
              height={10}
              fill={`url(#${uid}-meniscus)`}
            />
            <path
              d={surfaceD}
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        </g>

        {/* Glass outline on top so the stroke cleanly covers the water edge. */}
        <path
          d={OUTLINE_D}
          fill={emptyFill}
          stroke={outline}
          strokeWidth="2.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {showValuePill && (
          <g>
            <rect
              x={115}
              y={137}
              width={70}
              height={30}
              rx={10}
              fill="rgba(13, 16, 24, 0.58)"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1"
            />
            <text x={CX} y={157} textAnchor="middle" fontFamily="inherit">
              <tspan fontSize="17" fontWeight={700} fill="#ffffff">
                {Math.round(valueMl)}
              </tspan>
              <tspan
                fontSize="11"
                fontWeight={500}
                fill="rgba(255,255,255,0.72)"
                dx="1"
              >
                {' ml'}
              </tspan>
            </text>
          </g>
        )}

        {showScale && (
          <g>
            {MINOR_STOPS.map((stop) => {
              const y = yForStop(stop);
              return (
                <line
                  key={`m${stop}`}
                  x1={TICK_X1}
                  y1={y}
                  x2={TICK_X2_MINOR}
                  y2={y}
                  stroke={scaleColor}
                  strokeWidth={1.3}
                  strokeLinecap="round"
                />
              );
            })}

            {MAJOR_STOPS.map((stop, i) => {
              const y = yForStop(stop);
              const isMax = i === 0;
              return (
                <g key={stop}>
                  <line
                    x1={TICK_X1}
                    y1={y}
                    x2={TICK_X2_MAJOR}
                    y2={y}
                    stroke={scaleColor}
                    strokeWidth={1.6}
                    strokeLinecap="round"
                  />
                  <text
                    x={LABEL_X}
                    y={y + 4}
                    fontSize={isMax ? '11' : '12'}
                    fontWeight={400}
                    fontFamily="inherit"
                    fill={scaleColor}
                  >
                    {isMax ? 'MAX' : `${Math.round(chartMax * stop)} ml`}
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
