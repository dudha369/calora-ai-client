import { useTheme } from '@/shared/context/ThemeContext';

const fmt = (n: number) => n.toFixed(1).replace(/\.0$/, '');

export interface NutritionGridCardCellProps {
  title: string;
  value: number;
  unit: string;
}

export const NutritionGridCardCell = ({
  title,
  value,
  unit,
}: NutritionGridCardCellProps) => {
  const theme = useTheme();

  return (
    <div className="group relative flex flex-1 flex-col items-center justify-center gap-1.5 py-3">
      <div className="flex items-baseline gap-1">
        <span className="text-lg leading-none font-medium">{fmt(value)}</span>
        <span className="align-bottom text-base leading-none">{unit}</span>
      </div>

      <span
        className="text-sm leading-none"
        style={{ color: theme.hint_color }}
      >
        {title}
      </span>

      <div
        className="absolute top-1/2 -right-px h-3/4 w-0.5 -translate-y-1/2 group-last:hidden"
        style={{
          backgroundColor: theme.section_separator_color,
        }}
      />
    </div>
  );
};
