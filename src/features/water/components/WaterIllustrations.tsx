import React, { type CSSProperties, useId, useMemo, useState } from 'react';

export type WaterIllustrationProps = {
  currentMl: number;
  targetMl: number;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  showLabel?: boolean;
  label?: string;
  accent?: string;
  size?: number;
  pulseKey?: number;
  showScale?: boolean;
  showNumbers?: boolean;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatMl(value: number) {
  return `${Math.round(value)} ml`;
}

function percent(currentMl: number, targetMl: number) {
  if (targetMl <= 0) return 0;
  return clamp(currentMl / targetMl, 0, 1);
}

function useWaterMetrics(currentMl: number, targetMl: number) {
  return useMemo(() => {
    const p = percent(currentMl, targetMl);
    return {
      p,
      pctText: `${Math.round(p * 100)}%`,
      currentText: formatMl(currentMl),
      targetText: formatMl(targetMl),
      remainingText: formatMl(Math.max(0, targetMl - currentMl)),
    };
  }, [currentMl, targetMl]);
}

function MetricPill({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="text-[10px] tracking-[0.18em] text-white/40 uppercase">
        {title}
      </div>
      <div className="mt-1 text-sm font-medium text-white">{value}</div>
    </div>
  );
}

function WaterSurface({ top }: { top: number }) {
  return (
    <path
      d={`M56 ${top + 4}C74 ${top - 2}, 88 ${top + 8}, 104 ${top + 4}C120 ${top - 2}, 138 ${top + 8}, 164 ${top + 4}`}
      fill="none"
      stroke="rgba(255,255,255,0.30)"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  );
}

function WaterLayer({
  id,
  clipId,
  top,
  bottom,
  accent,
  pulseKey,
}: {
  id: string;
  clipId: string;
  top: number;
  bottom: number;
  accent: string;
  pulseKey?: number;
}) {
  const height = Math.max(0, bottom - top);

  return (
    <g
      clipPath={`url(#${clipId})`}
      key={pulseKey ?? 0}
      style={{ animation: 'fillBounce 360ms ease-out' }}
    >
      <defs>
        <linearGradient id={`${id}-waterGrad`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.92" />
          <stop offset="100%" stopColor="#2B5FFF" stopOpacity="0.80" />
        </linearGradient>
        <linearGradient id={`${id}-waterShine`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.03" />
          <stop offset="50%" stopColor="white" stopOpacity="0.10" />
          <stop offset="100%" stopColor="white" stopOpacity="0.03" />
        </linearGradient>
      </defs>

      <rect
        x="44"
        y={top}
        width="132"
        height={height}
        fill={`url(#${id}-waterGrad)`}
      />
      <path
        d={`M44 ${top + 3}C66 ${top - 3}, 84 ${top + 7}, 104 ${top + 4}C124 ${top - 2}, 144 ${top + 8}, 176 ${top + 4}V236H44Z`}
        fill={`url(#${id}-waterShine)`}
      />
      <WaterSurface top={top} />
      {height > 24 ? (
        <circle
          cx="82"
          cy={Math.max(top + 18, 64)}
          r="2"
          fill="white"
          opacity="0.12"
        />
      ) : null}
      {height > 52 ? (
        <circle
          cx="112"
          cy={Math.max(top + 30, 76)}
          r="1.7"
          fill="white"
          opacity="0.10"
        />
      ) : null}
      {height > 88 ? (
        <circle
          cx="95"
          cy={Math.max(top + 44, 88)}
          r="1.9"
          fill="white"
          opacity="0.09"
        />
      ) : null}

      <style>{`
        @keyframes fillBounce {
          0% { transform: translateY(0px) scaleY(1); }
          32% { transform: translateY(-3px) scaleY(1.01); }
          68% { transform: translateY(1px) scaleY(0.995); }
          100% { transform: translateY(0px) scaleY(1); }
        }
      `}</style>
    </g>
  );
}

function ScaleMarks({ showNumbers = true }: { showNumbers?: boolean }) {
  const marks = [
    { y: 50, value: 2000, long: true },
    { y: 74, value: 1800, long: false },
    { y: 98, value: 1600, long: true },
    { y: 122, value: 1400, long: false },
    { y: 146, value: 1200, long: true },
    { y: 170, value: 1000, long: false },
    { y: 194, value: 800, long: true },
  ];

  return (
    <g opacity="0.65">
      <line
        x1="174"
        y1="46"
        x2="174"
        y2="198"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth="1"
      />
      {marks.map((m) => (
        <g key={m.y}>
          <line
            x1="166"
            y1={m.y}
            x2={m.long ? 179 : 174}
            y2={m.y}
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1.3"
          />
          {showNumbers ? (
            <text
              x="184"
              y={m.y + 4}
              fill="rgba(255,255,255,0.40)"
              fontSize="10"
              fontFamily="inherit"
            >
              {m.value}
            </text>
          ) : null}
        </g>
      ))}
    </g>
  );
}

export function WaterGlass({
  currentMl,
  targetMl,
  className = '',
  interactive = true,
  onClick,
  showLabel = true,
  label,
  accent = '#6FB8FF',
  size = 300,
  pulseKey,
}: WaterIllustrationProps) {
  const uid = useId();
  const { p, pctText, currentText, targetText, remainingText } =
    useWaterMetrics(currentMl, targetMl);
  const fillBottom = 206;
  const fillTop = fillBottom - 154 * p;
  const styles: CSSProperties = { width: size, maxWidth: '100%' };

  return (
    <div
      className={`select-none ${interactive ? 'cursor-pointer' : ''} ${className}`}
      style={styles}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      <svg
        viewBox="0 0 220 250"
        className="block h-auto w-full overflow-visible"
      >
        <defs>
          <linearGradient id={`${uid}-glassStroke`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.34)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.10)" />
          </linearGradient>
          <clipPath id={`${uid}-glassClip`}>
            <path d="M66 28H154L148 54V186C148 201 135 214 120 214H100C85 214 72 201 72 186V54Z" />
          </clipPath>
        </defs>

        <ellipse
          cx="110"
          cy="226"
          rx="40"
          ry="7"
          fill="rgba(255,255,255,0.04)"
        />

        <g>
          <g clipPath={`url(#${uid}-glassClip)`}>
            <WaterLayer
              id={uid}
              clipId={`${uid}-glassClip`}
              top={fillTop}
              bottom={fillBottom}
              accent={accent}
              pulseKey={pulseKey}
            />
          </g>

          {/* body */}
          <path
            d="M66 28H154L148 54V186C148 201 135 214 120 214H100C85 214 72 201 72 186V54Z"
            fill="rgba(255,255,255,0.018)"
            stroke={`url(#${uid}-glassStroke)`}
            strokeWidth="2"
          />

          {/* top rim */}
          <path
            d="M68 28H152"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M72 32H148"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* side highlights */}
          <path
            d="M78 42L76 190"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M142 42L144 184"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </svg>

      {showLabel && (
        <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs tracking-[0.18em] text-white/40 uppercase">
                Water
              </div>
              <div className="mt-1 text-xl font-semibold text-white">
                {label ?? 'Glass'}
              </div>
            </div>
            <div className="rounded-2xl border border-[#6FB8FF]/20 bg-[#6FB8FF]/10 px-3 py-2 text-right">
              <div className="text-[10px] tracking-[0.16em] text-[#A9D4FF] uppercase">
                Done
              </div>
              <div className="text-base font-semibold text-white">
                {pctText}
              </div>
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${p * 100}%`,
                background: `linear-gradient(90deg, ${accent}, #4d7dff)`,
              }}
            />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <MetricPill title="Drank" value={currentText} />
            <MetricPill title="Target" value={targetText} />
            <MetricPill title="Left" value={remainingText} />
          </div>
        </div>
      )}
    </div>
  );
}

export function WaterPitcher({
  currentMl,
  targetMl,
  className = '',
  interactive = true,
  onClick,
  showLabel = true,
  label,
  accent = '#6FB8FF',
  size = 360,
  pulseKey,
  showScale = true,
  showNumbers = true,
}: WaterIllustrationProps) {
  const uid = useId();
  const { p, pctText, currentText, targetText, remainingText } =
    useWaterMetrics(currentMl, targetMl);
  const fillBottom = 189;
  const fillTop = fillBottom - 125 * p;
  const styles: CSSProperties = { width: size, maxWidth: '100%' };

  return (
    <div
      className={`select-none ${interactive ? 'cursor-pointer' : ''} ${className}`}
      style={styles}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      <svg
        viewBox="0 0 240 260"
        className="block h-auto w-full overflow-visible"
      >
        <defs>
          <linearGradient id={`${uid}-body`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.07)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </linearGradient>
          <linearGradient id={`${uid}-glass`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.30)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
          </linearGradient>
          <clipPath id={`${uid}-pitcherClip`}>
            <path d="M72 42H138C144 42 149 47 150 53L158 174C159 193 144 210 125 210H85C66 210 51 193 52 174L60 53C61 47 66 42 72 42Z" />
          </clipPath>
        </defs>

        <ellipse
          cx="120"
          cy="229"
          rx="52"
          ry="8"
          fill="rgba(255,255,255,0.04)"
        />

        <g>
          <g clipPath={`url(#${uid}-pitcherClip)`}>
            <WaterLayer
              id={uid}
              clipId={`${uid}-pitcherClip`}
              top={fillTop}
              bottom={fillBottom}
              accent={accent}
              pulseKey={pulseKey}
            />
          </g>

          {/* measuring cup / menzurka body */}
          <path
            d="M72 42H138C144 42 149 47 150 53L158 174C159 193 144 210 125 210H85C66 210 51 193 52 174L60 53C61 47 66 42 72 42Z"
            fill="url(#${uid}-body)"
            stroke={`url(#${uid}-glass)`}
            strokeWidth="2"
          />

          {/* top lip */}
          <path
            d="M74 36H136"
            stroke="rgba(255,255,255,0.26)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M72 40H138"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* outer highlights */}
          <path
            d="M84 50L80 180"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M136 50L140 176"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {showScale ? <ScaleMarks showNumbers={showNumbers} /> : null}
        </g>
      </svg>

      {showLabel && (
        <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs tracking-[0.18em] text-white/40 uppercase">
                Measuring cup
              </div>
              <div className="mt-1 text-xl font-semibold text-white">
                {label ?? 'Daily hydration'}
              </div>
            </div>
            <div className="rounded-2xl border border-[#6FB8FF]/20 bg-[#6FB8FF]/10 px-3 py-2 text-right">
              <div className="text-[10px] tracking-[0.16em] text-[#A9D4FF] uppercase">
                Done
              </div>
              <div className="text-base font-semibold text-white">
                {pctText}
              </div>
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${p * 100}%`,
                background: `linear-gradient(90deg, ${accent}, #4d7dff)`,
              }}
            />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <MetricPill title="Drank" value={currentText} />
            <MetricPill title="Target" value={targetText} />
            <MetricPill title="Left" value={remainingText} />
          </div>
        </div>
      )}
    </div>
  );
}

export function WaterIllustrationPair() {
  const [glassMl, setGlassMl] = useState(1250);
  const [cupMl, setCupMl] = useState(1800);
  const [glassPulse, setGlassPulse] = useState(0);
  const [cupPulse, setCupPulse] = useState(0);

  const glassTarget = 2500;
  const cupTarget = 3000;

  function applyChange(
    setter: React.Dispatch<React.SetStateAction<number>>,
    pulseSetter: React.Dispatch<React.SetStateAction<number>>,
    delta: number,
    max: number,
  ) {
    setter((prev) => clamp(prev + delta, 0, max));
    pulseSetter((v) => v + 1);
  }

  return (
    <div className="min-h-screen bg-[#07111f] p-6 text-white">
      <style>{`
        @keyframes fillBounce {
          0% { transform: translateY(0px) scaleY(1); }
          32% { transform: translateY(-3px) scaleY(1.01); }
          68% { transform: translateY(1px) scaleY(0.995); }
          100% { transform: translateY(0px) scaleY(1); }
        }
      `}</style>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-start lg:justify-center">
        <div className="flex-1 rounded-[32px] border border-white/10 bg-white/[0.03] p-6">
          <WaterGlass
            currentMl={glassMl}
            targetMl={glassTarget}
            label="Glass"
            pulseKey={glassPulse}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm"
              onClick={() =>
                applyChange(setGlassMl, setGlassPulse, 100, glassTarget)
              }
            >
              +100 ml
            </button>
            <button
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm"
              onClick={() =>
                applyChange(setGlassMl, setGlassPulse, 250, glassTarget)
              }
            >
              +250 ml
            </button>
            <button
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm"
              onClick={() =>
                applyChange(setGlassMl, setGlassPulse, -100, glassTarget)
              }
            >
              -100 ml
            </button>
            <button
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm"
              onClick={() => {
                setGlassMl(0);
                setGlassPulse((v) => v + 1);
              }}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="flex-1 rounded-[32px] border border-white/10 bg-white/[0.03] p-6">
          <WaterPitcher
            currentMl={cupMl}
            targetMl={cupTarget}
            label="Measuring cup"
            pulseKey={cupPulse}
            showScale
            showNumbers
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm"
              onClick={() => applyChange(setCupMl, setCupPulse, 150, cupTarget)}
            >
              +150 ml
            </button>
            <button
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm"
              onClick={() => applyChange(setCupMl, setCupPulse, 300, cupTarget)}
            >
              +300 ml
            </button>
            <button
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm"
              onClick={() =>
                applyChange(setCupMl, setCupPulse, -150, cupTarget)
              }
            >
              -150 ml
            </button>
            <button
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm"
              onClick={() => {
                setCupMl(0);
                setCupPulse((v) => v + 1);
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WaterIllustrationPair;
