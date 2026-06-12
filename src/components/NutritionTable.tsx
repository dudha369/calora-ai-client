import { useTheme } from '../context/ThemeContext';

export interface NutritionRow {
  label: string;
  value: string;
  /** Основная строка рендерится с bold-шрифтом и увеличенным размером */
  primary?: boolean;
}

interface NutritionTableProps {
  rows: NutritionRow[];
}

/**
 * Общий компонент таблицы КБЖУ.
 * Используется в BarcodeResultModal и FoodResultModal.
 *
 * divide-(--tg-section-separator-color) — Tailwind v4-синтаксис для
 * CSS-переменной темы, уже выставленной ThemeProvider.
 */
export const NutritionTable = ({ rows }: NutritionTableProps) => {
  const theme = useTheme();

  return (
    <div
      className="mt-3 divide-y divide-(--tg-section-separator-color) overflow-hidden rounded-2xl"
      style={{ backgroundColor: theme.section_bg_color }}
    >
      {rows.map((row) => (
        <div
          key={row.label}
          className={`flex items-center justify-between px-4 py-2.5 ${
            row.primary ? 'text-base font-semibold' : 'text-sm'
          }`}
          style={{ color: theme.text_color }}
        >
          <span>{row.label}</span>
          <span>{row.value}</span>
        </div>
      ))}
    </div>
  );
};
