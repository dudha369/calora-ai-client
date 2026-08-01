import { startOfDay } from '@/shared/lib/date';

// ─── Month-level date helpers ────────────────────────────────────────────────

/** Первое число месяца, время обнулено */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

function monthKeyOf(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

export function isSameMonth(a: Date, b: Date): boolean {
  return monthKeyOf(a) === monthKeyOf(b);
}

/**
 * Ячейки сетки одного месяца. null = пустая ячейка перед 1-м числом
 * (неделя начинается с понедельника — как и в DateStrip/DayCarousel).
 */
export function buildCalendarCells(
  year: number,
  month: number,
): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = (firstDay.getDay() + 6) % 7;

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

// ─── Sliding window (buffer) — тот же паттерн, что generateWindow в DayCarousel ──

const MONTH_BUFFER = 6; // ±6 месяцев ≈ окно на год вперёд/назад от центра

export interface MonthWindowData {
  /** Месяцы окна (даты — первое число месяца), по возрастанию */
  months: Date[];
  activeIndex: number;
}

/**
 * Строит окно месяцев вокруг center, зажатое диапазоном [min, max].
 * Симметрично generateWindow() из DayCarousel.tsx: не тянем весь диапазон
 * жизни аккаунта разом (может быть от одного года и больше), а держим
 * скользящее окно и регенерируем его по мере приближения к краю (см. Calendar.tsx).
 */
export function generateMonthWindow(
  center: Date,
  min: Date,
  max: Date,
): MonthWindowData {
  const c = startOfMonth(center);
  const mn = startOfMonth(startOfDay(min));
  const mx = startOfMonth(startOfDay(max));
  const centerKey = monthKeyOf(c);

  const months: Date[] = [];
  let activeIndex = 0;

  for (let i = -MONTH_BUFFER; i <= MONTH_BUFFER; i++) {
    const d = addMonths(c, i);
    if (d < mn || d > mx) continue;
    months.push(d);
    if (monthKeyOf(d) === centerKey) activeIndex = months.length - 1;
  }

  return { months, activeIndex };
}
