import { useState, useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useTheme } from '@/shared/context/ThemeContext';
import { Skeleton } from '@/shared/ui/Skeleton';
import { stats } from '@/shared/api/stats';
import { weight } from '@/shared/api/weight';
import { toApiDate, startOfDay } from '@/shared/lib/date';
import type { DailyStats } from '@/shared/types/api/stats';
import { useParams } from 'react-router-dom';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Последние 7 дней как YYYY-MM-DD, от старого к новому.
 * Строится один раз в useMemo, не пересчитывается при ре-рендерах.
 */
function buildLast7Dates(): string[] {
  const today = startOfDay(new Date());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return toApiDate(d);
  });
}

/** Короткое название дня недели из YYYY-MM-DD */
function dayLabel(dateStr: string): string {
  // T12:00:00 — защита от DST: полночь может сдвинуть день
  return DAY_SHORT[new Date(`${dateStr}T12:00:00`).getDay()];
}

/** Форматирует ISO datetime в "14 июн" */
function formatShortDate(isoStr: string): string {
  try {
    return new Date(isoStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return '';
  }
}

/** "14 июня" для заголовка детальной секции */
function formatLongDate(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface MacroBarProps {
  label: string;
  value: number;
  goal: number;
  unit: string;
  accentColor: string;
  trackColor: string;
  textColor: string;
  hintColor: string;
}

const MacroBar = ({
  label,
  value,
  goal,
  unit,
  accentColor,
  trackColor,
  textColor,
  hintColor,
}: MacroBarProps) => {
  const pct = goal > 0 ? Math.min(value / goal, 1) : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between text-xs">
        <span style={{ color: hintColor }}>{label}</span>
        <span className="tabular-nums" style={{ color: textColor }}>
          {value.toFixed(1)} / {goal.toFixed(1)} {unit}
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: trackColor }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${pct * 100}%`, backgroundColor: accentColor }}
        />
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export const AnalyticsPage = () => {
  const { date } = useParams();
  const correctDate = date ?? new Date();
  console.log(correctDate);

  const theme = useTheme();
  const today = useMemo(() => toApiDate(startOfDay(new Date())), []);
  const last7 = useMemo(buildLast7Dates, []);

  // Выбранный день для детального разбора (по умолчанию сегодня)
  const [selectedDate, setSelectedDate] = useState<string>(today);

  // ── Недельная статистика: 7 параллельных запросов ─────────────────────────
  // queryKey ['stats', 'daily', date] shared с HomePage — cache hit на 90%
  const weekQueries = useQueries({
    queries: last7.map((date) => ({
      queryKey: ['stats', 'daily', date] as const,
      queryFn: async () => (await stats.getDaily(date)).data,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const isWeekLoading = weekQueries.some((q) => q.isPending);
  const weekData = weekQueries.map((q) => q.data as DailyStats | undefined);

  // Максимальное значение для масштаба бар-чарта
  const chartMax = Math.max(
    ...weekData.map((d) => Math.max(d?.calories ?? 0, d?.calories_goal ?? 0)),
    1,
  );

  // Среднее потребление по дням с данными
  const weekAvg = useMemo(() => {
    const active = weekData.filter((d) => (d?.calories ?? 0) > 0);
    if (!active.length) return 0;
    return Math.round(
      active.reduce((sum, d) => sum + (d?.calories ?? 0), 0) / active.length,
    );
  }, [weekData]);

  const selectedStats = weekData[last7.indexOf(selectedDate)];

  // ── История веса для sparkline ─────────────────────────────────────────────
  const { data: weightHistory } = useQuery({
    queryKey: ['weight', 'history'],
    queryFn: async () => (await weight.getHistory()).data,
    staleTime: 10 * 60 * 1000,
  });

  // Последние 30 записей в хронологическом порядке (API отдаёт desc)
  const weightPoints = useMemo(
    () => (weightHistory ?? []).slice(0, 30).reverse(),
    [weightHistory],
  );

  // SVG sparkline: нормализованные координаты в viewBox 280×48
  const sparklinePath = useMemo(() => {
    if (weightPoints.length < 2) return '';
    const values = weightPoints.map((r) => Number(r.weight_kg));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 0.1; // защита от flat line
    const W = 280;
    const H = 40;
    const pts = values.map((v, i) => {
      const x = (i / (values.length - 1)) * W;
      const y = H - ((v - min) / range) * (H - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return `M ${pts.join(' L ')}`;
  }, [weightPoints]);

  const latestWeight = weightPoints.at(-1);
  const oldestWeight = weightPoints.at(0);
  const weightDelta =
    latestWeight && oldestWeight
      ? Number(latestWeight.weight_kg) - Number(oldestWeight.weight_kg)
      : null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4 px-4">
      <h1 className="text-2xl font-bold" style={{ color: theme.text_color }}>
        Аналитика
      </h1>

      {/* ── 1. Weekly bar chart ──────────────────────────────────────────── */}
      <section
        className="rounded-2xl p-4"
        style={{
          backgroundColor: theme.section_bg_color,
          border: `1px solid ${theme.section_separator_color}`,
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <p
            className="text-sm font-semibold"
            style={{ color: theme.text_color }}
          >
            Калории за 7 дней
          </p>
          <p
            className="text-xs tabular-nums"
            style={{ color: theme.hint_color }}
          >
            {weekAvg > 0 ? `~${weekAvg} ккал/день` : '—'}
          </p>
        </div>

        {isWeekLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="flex h-24 items-end gap-1.5">
            {last7.map((date, i) => {
              const d = weekData[i];
              const calories = d?.calories ?? 0;
              const goal = d?.calories_goal || 2000;
              const isSelected = date === selectedDate;
              const isToday = date === today;

              // Высота столбца: proportional to chartMax, max 72px
              const barH =
                calories > 0 ? Math.max((calories / chartMax) * 72, 4) : 2;

              // Цвет: selected/today → accent, остальные → dim
              const barColor =
                isSelected || isToday
                  ? theme.button_color
                  : `${theme.button_color}40`;

              // Тонкая линия цели поверх столбца
              // const goalLineY = 72 - (goal / chartMax) * 72;

              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className="relative flex flex-1 flex-col items-center gap-1.5 transition-opacity active:opacity-70"
                >
                  <div
                    className="relative flex w-full items-end justify-center"
                    style={{ height: 72 }}
                  >
                    {/* Линия цели (только если есть данные) */}
                    {goal > 0 && (
                      <div
                        className="absolute right-0 left-0 h-px opacity-30"
                        style={{
                          bottom: Math.min((goal / chartMax) * 72, 72),
                          backgroundColor: theme.button_color,
                        }}
                      />
                    )}
                    <div
                      className="w-full rounded-t-[5px] transition-[height,background-color] duration-300"
                      style={{ height: barH, backgroundColor: barColor }}
                    />
                  </div>
                  <span
                    className="text-[10px]"
                    style={{
                      color: isSelected ? theme.button_color : theme.hint_color,
                      fontWeight: isSelected ? 700 : 400,
                    }}
                  >
                    {dayLabel(date)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ── 2. Selected day breakdown ────────────────────────────────────── */}
      <section
        className="rounded-2xl p-4"
        style={{
          backgroundColor: theme.section_bg_color,
          border: `1px solid ${theme.section_separator_color}`,
        }}
      >
        <p
          className="mb-3 text-sm font-semibold"
          style={{ color: theme.text_color }}
        >
          {selectedDate === today ? 'Сегодня' : formatLongDate(selectedDate)}
        </p>

        {!selectedStats || !selectedStats.has_data ? (
          <p className="text-sm" style={{ color: theme.hint_color }}>
            {isWeekLoading ? 'Загрузка…' : 'Нет данных за этот день'}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Calories summary */}
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-3xl font-bold tabular-nums"
                style={{ color: theme.text_color }}
              >
                {selectedStats.calories}
              </span>
              <span className="text-sm" style={{ color: theme.hint_color }}>
                / {selectedStats.calories_goal} ккал
              </span>
            </div>

            {/* Macro progress bars */}
            <MacroBar
              label="Белки"
              value={selectedStats.protein_g}
              goal={selectedStats.protein_goal_g}
              unit="г"
              accentColor={theme.button_color}
              trackColor={theme.section_separator_color}
              textColor={theme.text_color}
              hintColor={theme.hint_color}
            />
            <MacroBar
              label="Жиры"
              value={selectedStats.fat_g}
              goal={selectedStats.fat_goal_g}
              unit="г"
              accentColor={theme.button_color}
              trackColor={theme.section_separator_color}
              textColor={theme.text_color}
              hintColor={theme.hint_color}
            />
            <MacroBar
              label="Углеводы"
              value={selectedStats.carbs_g}
              goal={selectedStats.carbs_goal_g}
              unit="г"
              accentColor={theme.button_color}
              trackColor={theme.section_separator_color}
              textColor={theme.text_color}
              hintColor={theme.hint_color}
            />

            {/* Water pill */}
            <div
              className="mt-0.5 flex items-center justify-between rounded-xl px-3 py-2"
              style={{ backgroundColor: `${theme.button_color}15` }}
            >
              <span className="text-sm" style={{ color: theme.hint_color }}>
                💧 Вода
              </span>
              <span
                className="text-sm font-semibold tabular-nums"
                style={{ color: theme.button_color }}
              >
                {selectedStats.water_ml} / {selectedStats.water_goal_ml} мл
              </span>
            </div>
          </div>
        )}
      </section>

      {/* ── 3. Weight sparkline ──────────────────────────────────────────── */}
      {weightPoints.length >= 2 && (
        <section
          className="rounded-2xl p-4"
          style={{
            backgroundColor: theme.section_bg_color,
            border: `1px solid ${theme.section_separator_color}`,
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <p
              className="text-sm font-semibold"
              style={{ color: theme.text_color }}
            >
              Вес
            </p>
            <div className="flex items-center gap-2">
              <span
                className="text-base font-bold tabular-nums"
                style={{ color: theme.text_color }}
              >
                {Number(latestWeight?.weight_kg).toFixed(1)} кг
              </span>
              {weightDelta !== null && Math.abs(weightDelta) >= 0.1 && (
                <span
                  className="text-xs font-semibold tabular-nums"
                  style={{
                    color: weightDelta < 0 ? '#34c759' : '#ff3b30',
                  }}
                >
                  {weightDelta > 0 ? '+' : ''}
                  {weightDelta.toFixed(1)} кг
                </span>
              )}
            </div>
          </div>

          {/*
           * SVG sparkline: fill gradient + stroke line.
           * viewBox фиксированный — SVG сам масштабируется под ширину контейнера.
           * Нет зависимостей: recharts/d3 избыточны для простого тренда.
           */}
          <svg
            viewBox="0 0 280 48"
            className="w-full"
            style={{ height: 48, display: 'block', overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={theme.button_color}
                  stopOpacity="0.3"
                />
                <stop
                  offset="100%"
                  stopColor={theme.button_color}
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>

            {/* Fill area */}
            <path d={`${sparklinePath} L 280,48 L 0,48 Z`} fill="url(#wGrad)" />

            {/* Line */}
            <path
              d={sparklinePath}
              fill="none"
              stroke={theme.button_color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div
            className="mt-1.5 flex justify-between text-[10px]"
            style={{ color: theme.hint_color }}
          >
            <span>{formatShortDate(oldestWeight?.recorded_at ?? '')}</span>
            <span>сейчас</span>
          </div>
        </section>
      )}
    </div>
  );
};
